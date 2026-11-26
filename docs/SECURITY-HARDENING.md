# Security hardening: copying, scraping and API abuse

Advice and risks discussed on 2026-11-17, kept so it is not lost. **Nothing here is implemented yet**; it is a checklist to work through. It covers the website and the app together, because the biggest cost risks sit in the app and its backend. Related: [RULES](RULES.md) (CSP, privacy, no third-party requests), [ARCHITECTURE](ARCHITECTURE.md) (the beta Pages Function and D1).

## The principle

Anything shipped to a client (the website bundle or the app binary) can be read, copied and replayed by anyone. So:

1. Make copying pointless or easy to act against, instead of trying to stop it.
2. Never rely on hiding endpoints, keys or logic in the client. Design the backend so that knowing everything the client knows gives an attacker nothing.

## 1. Someone copying the website

**Risk:** HTML, CSS, images and fonts are public by design. A clone can be made in minutes and cannot be prevented, only discouraged and removed.

| Action                                                                                                                                                                                                                  | Effort | Notes                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| State the licence: add a `LICENSE` or copyright notice. This repo is **public**; with no licence it is "all rights reserved" by default, but say so. Consider making the repo private if it does not need to be public. | Low    | Keep the copyright line in the footer.                                     |
| Trademark the name and the seal (India: classes 9 and 42 for the app).                                                                                                                                                  | Medium | The brand is what makes the site yours; the code is not.                   |
| Know the takedown route: a DMCA notice to the clone's host, registrar and Google; an abuse report to Cloudflare if the clone sits behind it.                                                                            | Low    | Keep dated screenshots and the repo history as proof of first publication. |
| Keep canonical tags and structured data correct (already done) so search engines treat this site as the original.                                                                                                       | Done   | `npm run check:seo` guards it.                                             |
| Watch for copies: a Google Alert on a distinctive phrase; occasional reverse image search of the seal.                                                                                                                  | Low    |                                                                            |
| Register obvious typo and lookalike domains of `theaftertaste.app`.                                                                                                                                                     | Low    | HSTS preload is already on for the apex.                                   |

## 2. Abuse of the database and paid APIs (bots, hacking and reverse-engineering tools)

**Risk:** attackers decompile the app or read the network traffic, find the endpoints and keys, and script them. The usual loss is a large API bill, most often stolen AI or maps API keys and free-form chatbot access, or a scraped or flooded database.

In order of impact:

1. **No paid key in any client.** The app and the website never hold an AI, maps or other paid key. The client calls our backend; the backend calls the provider.
2. **A strict backend gate in front of every expensive call:**
   - a real signed-in user (anonymous accounts count) before any costly request;
   - per-user and per-day quotas, plus per-IP limits as a secondary check;
   - the model, `max_tokens` and maximum input length fixed on the server;
   - the client never chooses the model and never sends its own system prompt.
3. **Hard spend limits at the provider:** monthly budget caps, usage alerts, a kill switch, and separate keys per environment, rotated on a schedule. This is the safety net if everything else fails.
4. **App attestation:** Play Integrity (Android) and App Attest (iOS), or Firebase App Check wrapping both. It makes scripts impersonating the app much harder. It raises the bar; it does not stop a determined attacker.
5. **Database access:**
   - the client never reaches the database directly, except through strict row-level rules (Firebase or Supabase);
   - otherwise it goes only through our API, with parameterised queries and least-privilege credentials;
   - keep backups and test a restore.
6. **Reverse-engineering hardening** (speed bumps, not security): R8/ProGuard, Hermes bytecode if the app is React Native, certificate pinning, root and jailbreak checks. Tools such as Frida can bypass pinning and the checks, so items 1 to 3 are what actually protect us.
7. **Monitoring:** alert on cost per hour and on unusual per-user usage. Abuse usually shows up as a spend spike first.

### The website's beta form

`functions/api/beta.ts` writes to D1. The risk is bots filling the table or a flood of signups.

- **Start with:** a Cloudflare WAF rate-limiting rule on `/api/beta` (runs at the edge and stores no IPs), a honeypot field, and a cap on rows accepted per time window.
- **Stronger option:** Cloudflare Turnstile. It needs a third-party script (`challenges.cloudflare.com`), which conflicts with the "no third-party requests" rule and the strict CSP (`script-src`, `frame-src`, `connect-src`). Adopting it needs a recorded decision in `.claude/project-state/decisions.md` and a CSP change.
- Keep the current rules: first-party only, no IPs stored.

## 3. Content that DevTools "cannot see"

**What some sites do:**

- disable right-click, F12 and Ctrl+U with JavaScript;
- detect open DevTools (window-size checks, timing, `debugger` loops) and blank or redirect the page;
- draw the page on a `<canvas>` or WebGL surface (Flutter web does this) or render text as images;
- use a scrambled font so the HTML text is gibberish but displays correctly;
- obfuscate JavaScript or ship WebAssembly;
- use video DRM (Widevine and similar). This is the only one that really restricts copying.

**Why none of it gives real protection:** the browser has to receive the content to show it. The Network tab, `curl`, disabled JavaScript, a proxy such as mitmproxy, a headless browser, or a screenshot plus OCR all still get it, and the blocking scripts never run in most of those. These tricks also hurt the site: canvas and image text is invisible to screen readers and Google, debugger loops slow the page, and honest visitors get frustrated.

**What works instead:**

- keep private content on the server, behind login, with per-user limits;
- bot and rate-limit rules at the edge (for example Cloudflare) against scraping;
- watermarks or fingerprints on valuable content, and a clear licence, so copying is traceable and actionable;
- DRM, for video and audio only.

**Decision for this site:** the marketing site has nothing secret in its HTML, and it must stay readable to Google and screen readers (see [RULES](RULES.md) on accessibility), so we do **not** add inspection-blocking tricks. Protection effort goes to the backend and the app (section 2).

## Suggested order of work

1. Provider spend caps, usage alerts and key hygiene (hours, biggest risk reduction).
2. Confirm no paid key is in the app or website bundle; move any that are behind the backend.
3. Backend gate: auth, quotas, fixed model and limits.
4. Edge rate limit and honeypot on `/api/beta`.
5. Licence file, trademark filing, takedown routine.
6. App attestation, then obfuscation as a later layer.

## Open questions

- How does the app call AI and maps today: through a backend, Firebase or Supabase, or directly from the client? The answer decides how much of section 2 is already covered.
- Does the repo need to stay public?
- Is Turnstile worth a CSP change, or are the edge rate limit and honeypot enough for the beta list?
