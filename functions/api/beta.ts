/**
 * POST /api/beta: the "Save your seat" form (Cloudflare Pages Function, D1).
 *
 * Stores the email (trimmed, lower-cased, unique), the optional city and
 * "how did you hear" answer, and the time. Nothing else: no IP address, no
 * user agent. Every outcome that could reveal whether an email is already on
 * the list (new, duplicate) gets the same answer, and so do the silent drops
 * (honeypot, too fast).
 *
 * Abuse protection, no third parties:
 *  - same-origin only (Origin header), form-encoded only, body ≤ 2 KB;
 *  - a per-network limit of 10 attempts an hour, counted in D1 under an HMAC
 *    of (hour, IP) keyed with the RATE_LIMIT_SALT secret, so the raw IP is
 *    never stored and buckets cannot be linked across hours;
 *  - a honeypot field (`website`) that people never see;
 *  - a minimum time to submit (`elapsed_ms`, measured by the page's script;
 *    absent without JS, when only the other checks apply).
 *
 * Two response modes: JSON when the request accepts it (the page's script),
 * otherwise a 303 redirect to a #fragment on the landing page, whose CSS
 * shows the matching message (the form works without JS).
 */

// The subset of the Workers runtime types this function uses (no dependency).
interface D1Result {
  success: boolean;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T>(): Promise<T | null>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface Env {
  BETA_DB?: D1Database;
  RATE_LIMIT_SALT?: string;
}
interface Context {
  request: Request;
  env: Env;
  waitUntil(promise: Promise<unknown>): void;
}

type Outcome = 'ok' | 'invalid' | 'limited' | 'error';

const MAX_BODY_BYTES = 2048;
const MIN_ELAPSED_MS = 2500;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS_PER_WINDOW = 10;
const MAX_CITY = 80;
const HEARD = new Set(['friend', 'instagram', 'whatsapp', 'search', 'other']);

// No-JS mode: where each outcome lands on the landing page (see JoinBeta.astro).
const FRAGMENT: Record<Outcome, string> = {
  ok: '/#joined',
  invalid: '/#join-invalid',
  limited: '/#join-limited',
  error: '/#join-error',
};
const STATUS: Record<Outcome, number> = { ok: 200, invalid: 400, limited: 429, error: 503 };

// _headers does not apply to Function responses, so they carry their own.
const HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
};

function respond(json: boolean, outcome: Outcome, status = STATUS[outcome]): Response {
  if (!json) return new Response(null, { status: 303, headers: { ...HEADERS, Location: FRAGMENT[outcome] } });
  const body = outcome === 'ok' ? { ok: true } : { ok: false, error: outcome };
  const extra: Record<string, string> = outcome === 'limited' ? { 'Retry-After': '3600' } : {};
  return Response.json(body, { status, headers: { ...HEADERS, ...extra } });
}

/** Reads at most `max` bytes of the body; null if it is larger. */
async function readBody(request: Request, max: number): Promise<string | null> {
  if (Number(request.headers.get('Content-Length') ?? 0) > max) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

const DOMAIN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const LOCAL = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]{1,64}$/;

/** A plain, deliverable-looking address, lower-cased; null if not. */
function normaliseEmail(raw: string): string | null {
  const email = raw.normalize('NFC').trim().toLowerCase();
  if (email.length > 254) return null;
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!LOCAL.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  return DOMAIN.test(domain) ? email : null;
}

/** Free text: no control characters, single spaces, at most 80 characters; null if empty. */
function normaliseCity(raw: string): string | null {
  const city = raw
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return city ? Array.from(city).slice(0, MAX_CITY).join('') : null;
}

// Without a configured salt the limiter still works, keyed per isolate on a
// random salt that is never stored (weaker: isolates do not share it).
let fallbackSalt: string | null = null;
function salt(env: Env): string {
  if (env.RATE_LIMIT_SALT) return env.RATE_LIMIT_SALT;
  if (!fallbackSalt) {
    console.warn('[beta] RATE_LIMIT_SALT is not set; rate limiting is per isolate');
    fallbackSalt = crypto.randomUUID();
  }
  return fallbackSalt;
}

async function bucketFor(env: Env, window: number, ip: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(salt(env)), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${window}|${ip}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Counts this attempt; true when the network is over its hourly limit. */
async function overLimit(context: Context, db: D1Database): Promise<boolean> {
  const ip = context.request.headers.get('CF-Connecting-IP');
  if (!ip) return false;
  const window = Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS;
  const bucket = await bucketFor(context.env, window, ip);
  const row = await db
    .prepare(
      `INSERT INTO beta_rate_limits (bucket, window_start, hits) VALUES (?1, ?2, 1)
       ON CONFLICT (bucket) DO UPDATE SET hits = hits + 1 RETURNING hits`,
    )
    .bind(bucket, window)
    .first<{ hits: number }>();
  // Finished hours are useless: clear them out after responding.
  context.waitUntil(
    db
      .prepare('DELETE FROM beta_rate_limits WHERE window_start < ?1')
      .bind(window)
      .run()
      .catch(() => undefined),
  );
  return (row?.hits ?? 0) > MAX_HITS_PER_WINDOW;
}

export async function onRequestPost(context: Context): Promise<Response> {
  const { request, env } = context;
  const json = (request.headers.get('Accept') ?? '').includes('application/json');

  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return respond(json, 'error', 403);
  const type = request.headers.get('Content-Type') ?? '';
  if (!type.startsWith('application/x-www-form-urlencoded')) return respond(json, 'invalid', 415);
  const body = await readBody(request, MAX_BODY_BYTES);
  if (body === null) return respond(json, 'invalid', 413);

  const db = env.BETA_DB;
  if (!db) {
    console.error('[beta] the BETA_DB binding is missing');
    return respond(json, 'error');
  }

  try {
    if (await overLimit(context, db)) return respond(json, 'limited');

    const form = new URLSearchParams(body);
    // Bots: answer as if it worked, store nothing.
    if ((form.get('website') ?? '') !== '') return respond(json, 'ok');
    const elapsed = form.get('elapsed_ms');
    if (elapsed !== null && !(Number(elapsed) >= MIN_ELAPSED_MS)) return respond(json, 'ok');

    const email = normaliseEmail(form.get('email') ?? '');
    if (!email) return respond(json, 'invalid');
    const city = normaliseCity(form.get('city') ?? '');
    const heardRaw = form.get('heard') ?? '';
    const heard = HEARD.has(heardRaw) ? heardRaw : null;

    // A repeat sign-up changes nothing and gets the same answer.
    await db
      .prepare(
        `INSERT INTO beta_signups (email, city, heard, created_at) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT (email) DO NOTHING`,
      )
      .bind(email, city, heard, new Date().toISOString())
      .run();
    return respond(json, 'ok');
  } catch (err) {
    // Never log the submitted values.
    console.error('[beta] database error:', err instanceof Error ? err.message : 'unknown');
    return respond(json, 'error');
  }
}
