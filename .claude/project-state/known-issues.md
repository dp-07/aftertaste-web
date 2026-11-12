# Known issues and open items

- `www.theaftertaste.in` → apex redirect cannot be done in `_redirects` (path-only); configure a Cloudflare Redirect Rule (see README).
- `.well-known/assetlinks.json` is intentionally absent: it needs the app's release signing certificate SHA-256 fingerprint (TODO for the human).
