# CLAUDE.md

Context for Claude Code working in this repository. Keep it in sync: when you change something described in `docs/` or `.claude/project-state/`, update that file rather than repeating it here.

## Where things live

- **`docs/` is the source of truth** for rules and architecture. Read before changing anything: [RULES](docs/RULES.md) (hard rules, git workflow), [ARCHITECTURE](docs/ARCHITECTURE.md) (build, layout, legal sync, SEO, CSP, theme, motion, deployment). Also [PRD](docs/PRD.md), [DESIGN](docs/DESIGN.md), [TASKS](docs/TASKS.md), [MEMORY](docs/MEMORY.md) (gotchas), [DEV-GUIDE](docs/DEV-GUIDE.md) (commands, tasks, troubleshooting). Index: [docs/README.md](docs/README.md).
- **`.claude/project-state/`** keeps live status and dated decisions (`current-state.md`, `active-work.md`, `decisions.md`, `known-issues.md`, `feature-status.md`). Update it when status changes.

## Overview

The public website for **Aftertaste**, a private food diary for Android ("Your personal food memory"), at **https://theaftertaste.app** (apex is canonical; `www` redirects to it via a Cloudflare Bulk Redirect). Static Astro site deployed by Cloudflare Pages from `main`. Pages: `/`, `/privacy`, `/terms`, `/support`, and a branded `404`. Contact: `hello@theaftertaste.app`. The app lives in a separate repo (`DishDiary`, package `bitemarks`); this repo is public.

## Non-negotiables (details in [RULES](docs/RULES.md))

- Never write to the app repo; never copy app code, config, secrets or history into this one. Only brand assets, fonts, token values and legal markdown (via `npm run sync:legal`) may come from it.
- No analytics, cookies, trackers or third-party requests. Strict CSP: no inline scripts except the hashed theme script, no inline styles.
- HTTPS only (`.app` is HSTS-preloaded); never write `http://` links.
- Exact-version dependencies at least 14 days old (`npm install --before=<date>`).
- Copy and design rules (banned words, no "AI slop", reduced-motion fallbacks) are in [RULES](docs/RULES.md#copy) and [DESIGN](docs/DESIGN.md#do-and-dont).
- Every change passes `npm run gates`.
- Git: `task/<name>` → `work-branch` (Claude, only after the human replies "approved") → `main` (human only; production deploy). Claude never commits to, merges into or pushes `main`; no force-push, no branch deletion, never discard uncommitted work; on a merge conflict stop and report. Commit messages are conventional and descriptive.

## Quick reference

- `nvm use` (Node 22.23.4, `.nvmrc`), `npm ci`, `npm run dev` (http://localhost:4321), `npm run build`, `npm run gates`. All scripts: [DEV-GUIDE](docs/DEV-GUIDE.md#scripts).
- Site facts (name, URL, contact, Play URL) are in `src/config/site.ts`; tokens in `src/styles/tokens.css`; legal text in `src/content/legal/` is synced, never hand-edited.
