# BONE SIP Design System v3

**Brand line:** *Invest in BONES. Invest in LIFE.*
**Posture:** Warm, confident, visual-first. Show, don't explain. Every screen should be understandable from its pictures and one line of text.

All colours derive from the logo (`assets/images/bonesip_logo.png`). Tokens live in `css/style.css` `:root`; components live in `css/brand.css`.

---

## 1. Colour

### Brand primitives (from the logo)
| Token | Hex | Where it comes from |
|---|---|---|
| `--brand-navy` | `#332D4B` | "BONE" letterforms |
| `--brand-pink` | `#E5305F` | "SIP" letterforms, arrow head |
| `--brand-berry` | `#B1315D` | bottom of the "SIP" gradient |
| `--brand-plum` | `#6B2A5C` | tail of the rising arrow |
| `--grad-brand` | `#6B2A5C → #B1315D → #E5305F` | the arrow; used on primary buttons, active tabs, score ring |

### Pillars
| Pillar | Text/ink (AA on white) | Soft background | Use |
|---|---|---|---|
| **Build** | `--build` `#D6265A` (4.9:1) | `--build-bg` `#FDECF1` | Diet, exercise, streaks |
| **Protect** | `--protect` `#4A3F7A` (9.0:1) | `--protect-bg` `#EEEBF7` | Fall risk, home check |
| **Strengthen** | `--strengthen` `#8E2C6A` (7.7:1) | `--strengthen-bg` `#F7E8F1` | Doctor checklist, DXA |

`#E5305F` (logo pink) is only **4.27:1** on white, so use it for fills, large text and decoration; use `--build` for small pink text.

### Neutrals & semantic
| Token | Hex |
|---|---|
| `--text-primary` | `#2A2540` |
| `--text-secondary` | `#433D5A` |
| `--text-muted` | `#6B6580` |
| `--bg-primary` | `#F8F6FB` |
| `--bg-surface` | `#FFFFFF` |
| `--border-subtle` / `--border-medium` | `#E7E3EF` / `#D6D0E3` |
| `--success` / `--warning` / `--danger` | `#1E9E62` / `#D97706` / `#DC2626` |

Risk levels stay semantic (green / amber / red) and are always paired with a text label, never colour alone.

---

## 2. Typography
- **Headings:** `Outfit` 700–900. Geometric and heavy, it echoes the logo's letterforms.
- **Body & controls:** `DM Sans` 400–800.
- Headings are short (≤ 6 words). Supporting copy is one line (≤ 12 words). Details go behind a disclosure ("How & why").

---

## 3. Imagery & motion
- **3D illustrations:** Microsoft Fluent Emoji 3D (MIT), self-hosted as 160 px WebP in `assets/icons3d/`. Use the `img3d(name, cls, size)` helper in `app.js`. Every choice, room, meal slot and pillar has one.
- **Icons for UI glyphs:** Font Awesome 6 (arrows, checks, close).
- **Motion vocabulary** (all in `brand.css`):
  - `.pop`: staggered spring entrance (`--i` sets the order)
  - `.fade-up`: list entrance
  - `.float`: idle bob for hero illustrations
  - `checkPop`: tick confirmation
  - rings animate `stroke-dashoffset` / `conic-gradient` via `--p`
  - confetti (`celebrate()`) only for real milestones: verification, pillar complete, all 5 meals, full workout
- Entrance animations run once per step. Re-renders inside a step add `.no-anim` so taps don't replay them.
- `prefers-reduced-motion` disables all of it.

---

## 4. Components
| Component | Class | Notes |
|---|---|---|
| Primary button | `.cta-btn` (+ `.protect`, `.strengthen`) | Gradient pill with a slow shine. One per screen. |
| Choice tile | `.choice-tile` in `.choice-grid` | Picture + title + ≤ 4-word caption, tick badge. Grid gets `.protect`/`.strengthen` to recolour. |
| Checklist row | `.choice-row` / `.doc-row` | For longer questions. |
| Wizard chrome | `.wiz-top`, `.wiz-footer` | Back button, segmented progress, pinned footer CTA above the nav. |
| Score ring | `.score-ring` (`--p` 0–100) | Uses the shared `#gradBrandRing` SVG gradient. |
| Nutrient ring | `.nutri-ring` (`--p`, `--c`) | Conic gradient with a 3D icon in the centre. |
| Risk gauge | `.gauge-card` | Semicircle with an animated needle plus a text level. |
| Yes / No | `.yesno` | Words, not icons, for clarity. |
| Pillar hero | `.pillar-hero.protect` / `.strengthen` | Dark gradient header for hub pages. |
| Workout home | `.wk-hero`, `.wk-groups`, `.wk-row` | 28-day plan card on the brand gradient, 2×2 focus groups, thumbnail list. |
| Exercise detail | `.exd-card` | Bottom sheet: video (or illustration), Level/Time/Target, duration stepper, numbered steps, safety, body map, bones, benefits. |
| Workout player | `.player` (`data-phase` = ready / work / rest / done) | Full screen. Big timer, labelled Pause/Skip, 10 s rest on the brand gradient, optional voice guide, screen kept awake. |
| Bottom nav | `.pillar-bottom-nav` | Floating pill; 3D icons, greyed with a lock badge when locked, green tick when complete. |

---

## 5. Layout
- Mobile-first; the wizard column is max 560 px. Dashboards use the 1180 px container, and meal cards go to 2 columns from 900 px.
- The floating nav is 72 px tall, 12 px from the bottom. Fixed footers sit at `bottom: 88px`.
- Toasts drop in under the header so they never cover the primary action.
- Modals (`z-index: 10050`) and chat (`10060`) sit above the nav (`9999`).

---

## 6. Designing for older adults (Exercise tab)
- Body text ≥ 16 px in steps and the player; timers 52–72 px.
- Every control has a text label ("Pause", "Skip", "Skip rest"), not just an icon. Touch targets ≥ 46 px.
- A safety line is always visible: on the home screen, in every detail sheet, and under the timer.
- Only show a coach video when it matches the move. Otherwise show an illustration and the steps.
- Slow pacing: a 10 s "get ready", a 10 s rest you can extend (+10 s), and auto-advance so nobody has to hunt for buttons mid-exercise.
