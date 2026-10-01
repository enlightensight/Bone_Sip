# BONE SIP · Invest in Bones. Invest in Life.

A mobile-first web app (installable PWA) that turns bone health into a simple daily plan across three pillars:

| | Pillar | What the user does |
|---|---|---|
| 💪 | **Build** | Daily 3-2-1 diet (calcium, protein, vitamin D) with regional meal swaps + guided workouts for older adults: 18 moves in Strength, Balance, Flexibility and Posture, a 28-day plan, and a full-screen player (get ready → move → 10 s rest → auto-next) |
| 🛡️ | **Protect** | Fall-risk check (animated gauge) + room-by-room home safety check |
| 📈 | **Strengthen** | Doctor-question checklist (share to WhatsApp / PDF) + DXA T-score guide |

It's static HTML/CSS/JS with no build step and no framework. User data stays on the device (`localStorage`).

---

## Run locally

```bash
python -m http.server 5510
```

Open http://localhost:5510. The service worker is skipped on `localhost` so edits show up immediately; add `?sw=1` to test offline mode.

## Test

```bash
node tests/app.test.js
```

47 checks: data catalogues, guest state, profile/OTP security, chat escaping, scoring, swaps, persistence and legacy-data migration.

---

## Before going live (checklist)

1. **OTP / SMS: required.** `js/config.js` ships in `mode: 'demo'`, which simulates the SMS and shows the code on screen. For production:
   - Set `mode: 'production'`.
   - Provide two endpoints from your backend (e.g. MSG91, Twilio, Firebase Auth):
     - `otp.sendUrl`: `POST { phone }` → 2xx once the SMS is sent
     - `otp.verifyUrl`: `POST { phone, code }` → `{ "verified": true }`
   - Rate-limit both endpoints server-side.
2. **Data storage.** Profiles, progress and chat live only in the browser. If you need accounts across devices, add a backend and sync `BoneDB` (`js/app.js`).
3. **Dr. Bone assistant** is a rule-based guide (keyword intents in `js/data.js → botKnowledge`), not an AI model, and it shows a "not medical advice" note. Keep that wording.
4. **Medical review.** Have a clinician or physiotherapist review the copy in `js/data.js`: diet targets, DXA ranges, and especially `workoutLibrary` (steps, safety notes, durations).
5. **Exercise demos.** 5 moves use filmed coach videos. The other 13 use animated coach characters drawn in the same style (`js/character.js`: keyframed joint angles → SVG, male and female). To check or tweak one, open `/scratch/char-preview.html?id=ex_wall_sit` (add `&g=female`). If you later film a real video, add it to the move's `video` field and it takes priority. Never reuse a clip for a different movement (a test enforces this).
6. **Video rights.** Confirm you have the rights to the files in `assets/exercises/`.
7. **Bump caches on every deploy.** Change `CACHE_VERSION` in `sw.js` and the `?v=` query strings in `index.html`.

---

## Deploy

All three options serve the folder as-is, with security headers (CSP, HSTS, nosniff, frame-deny) and caching already configured.

**Netlify:** connect the repo in app.netlify.com (`netlify.toml` copies only the public files into `dist/`), or run `npx netlify-cli deploy --build --prod`. Don't drag-and-drop the raw folder, because that would also publish `scratch/` and the `.pptx`.

**Vercel**
```bash
npx vercel --prod
```

**Docker / any VM:** nginx on port 8080, running as non-root, with a `/healthz` check.
```bash
docker build -t bonesip .
```
```bash
docker run -p 8080:8080 bonesip
```

Any static host (S3 + CloudFront, Firebase Hosting, GitHub Pages) also works. Serve `index.html`, `sw.js` and `js/config.js` with `Cache-Control: no-cache`.

---

## Project layout

```
index.html              App shell (all views + modals)
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline shell + runtime cache)
css/style.css           Base styles + design tokens (:root)
css/brand.css           v3 brand layer: components, motion, responsive
js/config.js            Environment config (demo vs production OTP)
js/data.js              Content: meals (106), exercises (12), copy, risk factors, rooms
js/app.js               App logic (state, wizard, dashboards, BoneDB persistence)
js/character.js         Animated coach characters for exercises without video
js/vendor/              canvas-confetti
assets/icons3d/         64 Fluent 3D illustrations (WebP)
assets/icons/           Favicon, PWA & social icons (generated from the logo)
assets/exercises/       Coach demo videos (lazy-loaded)
deploy/, nginx.conf, Dockerfile, netlify.toml, vercel.json   Hosting configs
tests/app.test.js       Node test suite
DESIGN.md               Design system (colours, type, components, motion)
CREDITS.md              Third-party licences
```
