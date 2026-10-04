# BONE SIP · Invest in Bones. Invest in Life.

A mobile-first web app (installable PWA) that turns bone health into a simple daily plan across three pillars:

| | Pillar | What the user does |
|---|---|---|
| 💪 | **Build** | Daily 3-2-1 diet (calcium, protein, vitamin D) with regional meal swaps + guided workouts for older adults: 5 filmed moves in Strength, Balance and Posture, a 28-day plan, and a full-screen player (get ready → move → 10 s rest → auto-next) |
| 🛡️ | **Protect** | Fall-risk check (animated gauge) + room-by-room home safety check |
| 📈 | **Strengthen** | Doctor-question checklist (share to WhatsApp / PDF) + DXA T-score guide |
| 🌐 | **Languages** | Whole app in English + 10 Indian languages (हिन्दी, বাংলা, मराठी, తెలుగు, தமிழ், ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ, ଓଡ଼ିଆ): picked after the splash, changeable from the top bar |
| 🤖 | **Ojas** (AI) | Personal assistant in English + 10 Indian languages: knows the whole app, bone health, diet and exercise, and the user's plan for today |

The app is static HTML/CSS/JS with no build step and no framework. User data stays on the device (`localStorage`). The only server code is the small AI endpoint (`/api/chat`), which keeps the Groq key secret.

---

## Run locally

```bash
node server/server.js 5510
```

Open http://localhost:5510. Put your Groq key in `.env` first (copy `.env.example`); without it Ojas uses its built-in offline answers. The service worker is skipped on `localhost` so edits show up immediately; add `?sw=1` to test offline mode.

## Test

```bash
node tests/app.test.js
```
```bash
node tests/assistant.test.js
```
```bash
node tests/i18n.test.js
```
```bash
node tests/accounts.test.js
```

The first covers data catalogues, guest state, profile/OTP security, chat escaping, scoring, swaps, persistence and legacy-data migration. The second covers the AI endpoint (no network needed): knowledge prompt, input limits, model fallback, rate limiting, and that `.env` and server files are never served. The accounts suite starts the real server with a throwaway database and checks login, saving, history, privacy between users, the admin portal, logout, account deletion and abuse limits.

---

## Before going live (checklist)

1. **SMS login codes: required.** Until an SMS service is added, `OTP_TEST_MODE=1` lets every number log in with the test code shown on screen, so **anyone who knows a phone number can open that account**. Fine for testing, not for real users. To go live, add the SMS provider (e.g. MSG91 or Twilio) in `sendOtp()` in `server/accounts.js` and set `OTP_TEST_MODE=0`.
2. **Accounts and data.** See [Accounts, history and admin](#accounts-history-and-admin). Back up `data/bonesip.db` regularly, and add a privacy policy and consent text that covers saving health data (India's DPDP Act).
3. **Ojas AI assistant.** Set `GROQ_API_KEY` on the host (see Deploy). Never put the key in `js/` or commit `.env`.
   - **What it knows:** `server/assistant.js` builds Ojas's knowledge from `js/data.js` (app flow, foods, exercises, risk factors, DXA), so content edits there reach the AI automatically. Each message also sends a short snapshot of the user's plan (first name, age, BMI, diet, today's meals/workout, score, risk signs). It never sends the phone number or full name.
   - **Free-tier limits:** each Groq model allows about 1,000 requests a day and 8,000 tokens a minute. Ojas tries `openai/gpt-oss-120b`, then `openai/gpt-oss-20b`, then `qwen/qwen3.8-27b`, and parks a model that hits its limit. That's roughly 3,000 chats a day, a handful per minute. For more traffic, upgrade the Groq plan or add models via `GROQ_MODELS`.
   - **Abuse protection:** each visitor gets 20 messages per 10 minutes, and other websites can't call the endpoint.
   - **Fallback:** if the AI can't be reached, the built-in offline answers (`js/data.js → botKnowledge`) are used.
   - **Disclaimer:** the chat says it's AI guidance, not medical advice, and that messages go to an AI provider. Keep that wording and mention Groq in your privacy policy.
4. **Medical review.** Have a clinician or physiotherapist review the copy in `js/data.js`: diet targets, DXA ranges, and especially `workoutLibrary` (steps, safety notes, durations).
5. **Exercise demos.** Every move has a filmed coach video (male and female): 3 Strength, 1 Balance and 1 Posture. To add a move, film it first, then add it to `workoutLibrary` with its `video` field. Never reuse a clip for a different movement (a test enforces this).
6. **Video rights.** Confirm you have the rights to the files in `assets/exercises/`.
7. **Bump caches on every deploy.** Change `CACHE_VERSION` in `sw.js` and the `?v=` query strings in `index.html`.

---

## Accounts, history and admin

On our Node server (`server/server.js` → `server/accounts.js`) the phone login is real and data is saved per user in one SQLite file (`data/bonesip.db`, Node's built-in `node:sqlite`, git-ignored). Settings live in `.env` (see `.env.example`).
- **Login:** phone + 6-digit code, then an HttpOnly session cookie for 30 days. Codes expire after 5 minutes, allow 5 tries, and each number can request 5 codes an hour.
- **Saving:** the app sends the user's data and one record per day (meals planned and eaten, moves done, score) a few seconds after each change, when the phone comes back online and when the app is closed. Chat history stays on the phone.
- **Users:** log in from the welcome slides or the profile (a new phone restores their plan and history), see any past day in **My history** (Report → My history, or tap the week heading), log out, or delete their account and all its data.
- **Super admin:** `/admin.html`. Only `ADMIN_PHONE` can sign in, and only with the login code **and** `ADMIN_PIN`. It shows totals, a 14-day activity chart, every user's diet and exercise follow-through (7 and 30 days), streaks, a health summary and day-by-day history, plus a CSV export. Every login, user view and export is written to the access log.
- **Hosts without the server** (Netlify, Vercel, static hosting) have no accounts API: the app falls back to the on-phone demo login and keeps data on the device only.

---

## Languages

`js/i18n.js` translates what is *displayed*: data, saved progress and meal swaps stay in English, so switching language never breaks anything.
- **Dictionaries:** one file per language in `js/i18n/<code>.js`, mapping English UI text to the translation. Only the chosen language is downloaded, and Indian-script Noto fonts are loaded with it.
- **Placeholders:** numbers in labels are matched automatically (e.g. `Room {0} of {1}`). Labels that contain words from data use `t('Next: {name}', …)` in `js/app.js`.
- **Excluded:** user input and chat messages (`translate="no"`) are never translated. Ojas replies in the app language.

**When you add or change UI text:**
1. Run the app with `node server/server.js 5510`. In the browser console, run `BoneI18n.collect(true)`, switch to any non-English language and click through the screens you changed.
2. Save the strings: `fetch('/__dev/i18n-collected', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({strings: BoneI18n.missing()})})`. This dev-only route writes `scratch/i18n-collected.json`.
3. Run `node scratch/i18n_catalog.js` to rebuild `tests/i18n-catalog.json`.
4. Add the new keys to every `js/i18n/*.js`.
5. Run `node tests/i18n.test.js`. It fails if any language is missing a string, drops a `{placeholder}` or leaves text in the wrong script.
6. Have a native speaker review medical wording before launch.

---

## Deploy

Each option publishes only the public files, serves `/api/chat` for Ojas, and already sets security headers (CSP, HSTS, nosniff, frame-deny) and caching. **Set `GROQ_API_KEY` as an environment variable on the host.** `.env` is never uploaded.

**Netlify:** connect the repo in app.netlify.com. Add `GROQ_API_KEY` under Site configuration → Environment variables. `netlify.toml` copies the public files into `dist/` and deploys `netlify/functions/chat.js` at `/api/chat`. You can also run `npx netlify-cli deploy --build --prod`. Don't drag-and-drop the folder: that skips the function and would publish `scratch/`.

**Vercel:** add `GROQ_API_KEY` under Project → Settings → Environment Variables, then deploy. `api/chat.js` becomes `/api/chat`, and only the public files are published from `dist/`.
```bash
npx vercel --prod
```

**Docker / any VM (needed for accounts and the admin portal):** the Node server (`server/server.js`, no dependencies) on port 8080, running as non-root, with a `/healthz` check. Put it behind HTTPS (a load balancer or Caddy/nginx). Mount `/app/data` as a volume so the user database survives deploys.
```bash
docker build -t bonesip .
```
```bash
docker run -p 8080:8080 --env-file .env -v bonesip-data:/app/data bonesip
```

A plain static host (S3 + CloudFront, Firebase Hosting, GitHub Pages) also works for the app, but it has no `/api/chat`, so Ojas will only give offline answers unless you deploy the endpoint elsewhere. Serve `index.html`, `sw.js` and `js/config.js` with `Cache-Control: no-cache`.

---

## Project layout

```
index.html              App shell (all views + modals)
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline shell + runtime cache)
css/style.css           Base styles + design tokens (:root)
css/brand.css           v3 brand layer: components, motion, responsive
js/config.js            Environment config (demo vs production OTP, AI endpoint)
js/data.js              Content: meals (106), exercises (5), copy, risk factors, rooms
js/app.js               App logic (state, wizard, dashboards, BoneDB persistence)
js/i18n.js              Languages: display translation, picker data, fonts, dates
js/i18n/<code>.js       Dictionaries for the 10 Indian languages
js/vendor/              canvas-confetti
assets/icons3d/         64 Fluent 3D illustrations (WebP)
assets/icons/           Favicon, PWA & social icons (generated from the logo)
assets/exercises/       Coach demo videos (lazy-loaded)
server/assistant.js     Ojas AI: knowledge prompt, Groq calls with model fallback, limits
server/server.js        Node server for local dev + Docker (static files, /api/chat, accounts API)
server/accounts.js      Phone login, sessions, saved data, day history, admin API
server/db.js            SQLite schema (data/bonesip.db)
admin.html, js/admin.js, css/admin.css   Super-admin portal
netlify/functions/, api/   /api/chat for Netlify and Vercel
.env.example            Template for GROQ_API_KEY (.env is git-ignored)
Dockerfile, netlify.toml, vercel.json   Hosting configs
tests/                  Node test suites (app, assistant, languages, accounts)
DESIGN.md               Design system (colours, type, components, motion)
CREDITS.md              Third-party licences
```
