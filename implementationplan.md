# SketchLens — AI-Powered Sketch Assistant (v3 — Revised)

> **Turn any image into a step-by-step drawing lesson, overlaid on your real paper through your camera.**

---

## Changes from Previous Plan

> [!IMPORTANT]
> This plan has been **rewritten** to address every structural problem identified in the review:
> 1. ~~Copyrighted characters~~ → All replaced with **original archetypes** (no licensed IP)
> 2. ~~base64 images in MongoDB~~ → Images stored in **Cloudinary** (free tier), only URLs in Mongo
> 3. ~~JWT in localStorage~~ → **httpOnly cookies + refresh tokens**
> 4. ~~AI+CV pipeline mismatch~~ → **CV renders first, then Gemini describes what CV drew** (guaranteed sync)
> 5. ~~Massive "Phase 1"~~ → Restructured into a **real shippable MVP** (no camera, no auth, no i18n) + later phases
> 6. ~~Signup wall before value~~ → **One free sketch without signup**, gate on save/publish
> 7. ~~No monetization~~ → **Freemium model** defined

---

## The Hard Problem: AI + CV Pipeline Sync

> [!WARNING]
> The previous plan treated Gemini and OpenCV as two parallel systems. Gemini would write "draw the jawline" while OpenCV independently grouped contours by arc length — with zero guarantee they'd match. Here's how we actually solve this:

### Solution: CV First, AI Second

```
User uploads image
    │
    ├─ 0. Downscale to max 1200px on longest side (prevents UI hang on 4000×3000 phone photos)
    ├─ 1. OpenCV.js extracts edges + contours
    ├─ 2. Contours grouped using HIERARCHY-WEIGHTED ordering (not pure arc-length):
    │       • Outer contours (no parent) → Step 1 (main silhouette/gesture)
    │       • Direct children of outer contours → Step 2 (major internal shapes)
    │       • Deeper nested contours → later steps (fine detail)
    │       • Within each hierarchy level, sort by area (largest first)
    │       This produces a natural sketch order: proportion → form → detail
    ├─ 3. Each step rendered as a separate PNG (cumulative)
    │       Step 1: [main silhouette/gesture lines]
    │       Step 2: [+ major internal shapes]
    │       Step 3: [+ secondary structure]
    │       ...
    │
    └─ 4. ALL step PNGs sent to Gemini via backend proxy in ONE call:
           "Here are N progressive sketch steps. For each step,
            describe what new lines were added and how to draw them."
           │
           └─ Gemini returns instructions that DESCRIBE what's
              actually visible in each step image — guaranteed match.
```

**Why this works:** Gemini doesn't decide what to draw — it describes what OpenCV already drew. The visual and the text are always in sync because the text is derived from the visual.

**Fallback:** If Gemini API fails or is slow, the app still works — users see the progressive line reveal, just without text instructions. The core tracing experience is fully client-side.

---

## Phased Scope

### 🚀 Phase 0 — Real MVP (What We Build Now)
**Goal: Upload → AI steps → static overlay on screen. Shippable in days, not months.**

| Feature | Included |
|---|---|
| Upload image from device | ✅ |
| Pick from sample library (10 images) | ✅ |
| Step selector (2–10 steps) | ✅ |
| Difficulty selector | ✅ |
| OpenCV edge detection + hierarchy-weighted step grouping | ✅ |
| Gemini step instructions via backend proxy (synced to CV) | ✅ |
| Lightweight Express server (Gemini API proxy) | ✅ |
| Static overlay (reference sketch on screen, no camera) | ✅ |
| Step navigation (prev/next + progress bar) | ✅ |
| Opacity slider | ✅ |
| One free sketch without signup | ✅ |
| Premium dark UI | ✅ |
| Auth (signup/login) | ❌ Phase 1 |
| Camera AR overlay | ❌ Phase 1 |
| MongoDB / cloud save | ❌ Phase 1 |
| Community gallery | ❌ Phase 2 |
| i18n / RTL | ❌ Phase 2 |
| PWA | ❌ Phase 2 |

### 📦 Phase 1 — Auth + Camera + Persistence
- Sign up / log in (httpOnly cookies + refresh tokens)
- **"Continue with Google"** OAuth sign-in (one-tap, no password needed)
- Camera AR overlay with pinch-zoom, pan, rotate
- MongoDB sketch history (save, resume, complete)
- Cloudinary image storage
- Grid overlay tool
- "My Sketches" page

### 🌍 Phase 2 — Community + Global
- Community gallery (publish, browse, like)
- i18n (7 languages, RTL support)
- PWA (manifest, service worker, offline shell)
- Share & export (PNG download, Web Share API)
- Monetization features (see below)

---

## Monetization Model (Freemium)

| Tier | Price | What you get |
|---|---|---|
| **Free** | $0 | 1 sketch without signup. After signup: 3 AI-analyzed sketches/day, sample library, basic difficulty |
| **Pro** | $4.99/mo | Unlimited AI sketches, all difficulties, camera AR overlay, cloud history, priority processing |
| **Team/Edu** | $9.99/mo | Everything in Pro + classroom mode, bulk image upload, shared gallery for students |

> [!NOTE]
> Monetization is a Phase 2 feature. Phase 0 is fully free with no limits. The free tier quota only applies once the product has proven value and has users.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Already scaffolded |
| **Backend** | Node.js + Express | **Phase 0:** Gemini API proxy only. **Phase 1+:** adds auth, data API |
| **Database** (Phase 1+) | MongoDB Atlas | User data, sketch metadata |
| **Image Storage** (Phase 1+) | Cloudinary (free tier) | Store originals + thumbnails, serve via CDN |
| **AI** | Gemini API (`@google/genai`) | Step instruction generation (synced to CV output) |
| **Computer Vision** | OpenCV.js (CDN) | In-browser edge detection, contour grouping |
| **Auth** (Phase 1+) | httpOnly cookies + JWT refresh tokens | XSS-resistant session management |
| **Icons** | Lucide React | Clean, tree-shakable |
| **Styling** | Vanilla CSS | Full control |

---

## Phase 0 — Detailed Implementation

### Sample Library (10 Starter Images — Pre-Baked at Build Time)

> [!NOTE]
> All images are **original archetypes or public domain subjects** — zero copyrighted characters. Images are **generated once using the `generate_image` tool during development** and committed to `public/samples/` as static JPGs. They ship with the build — no per-session generation, no runtime cost, no added latency.

| # | Design | Category | Difficulty |
|---|---|---|---|
| 1 | Female samurai in flowing robe (original design, no specific IP) | Anime | Intermediate |
| 2 | Chibi forest spirit with leaf hat (original design, no specific IP) | Anime | Beginner |
| 3 | Single rose with thorny stem | Nature | Beginner |
| 4 | Mountain lake with pine trees | Nature | Advanced |
| 5 | Female face, front view | Portraits | Intermediate |
| 6 | Cat sitting, side view | Animals | Beginner |
| 7 | Lion head, majestic mane | Animals | Advanced |
| 8 | Eiffel Tower | Landmarks | Intermediate |
| 9 | Acoustic guitar | Objects | Intermediate |
| 10 | Mandala pattern | Patterns | Advanced |

> Phase 1+ expands to **100 images across 10 categories** (same categories as before, but with all copyrighted names replaced by generic archetypes).

---

### Application Architecture (Phase 0)

```
sketchapp/
├── public/
│   └── samples/                # 10 pre-baked starter images
│       ├── anime-warrior.jpg
│       ├── anime-schoolgirl.jpg
│       ├── rose.jpg
│       ├── mountain-lake.jpg
│       ├── female-portrait.jpg
│       ├── cat-sitting.jpg
│       ├── lion-head.jpg
│       ├── eiffel-tower.jpg
│       ├── acoustic-guitar.jpg
│       └── mandala.jpg
│
├── server/                     # Lightweight Express proxy (Phase 0)
│   ├── index.js                # Express entry: CORS + single /api/ai/analyze route
│   └── .env                    # GEMINI_API_KEY, PORT=5000
│
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # Screen state manager
│   ├── index.css               # Design system (dark mode, glassmorphism)
│   │
│   ├── components/
│   │   ├── Landing.jsx         # Hero + how-it-works + CTA
│   │   ├── ImageUploader.jsx   # Upload + sample picker
│   │   ├── StepConfigurator.jsx # Step count (2-10) + difficulty
│   │   ├── SketchWorkspace.jsx # Main workspace container
│   │   ├── SketchOverlay.jsx   # Canvas rendering the progressive sketch
│   │   ├── StepNavigation.jsx  # Prev/Next + progress bar
│   │   ├── InstructionCard.jsx # Gemini instruction for current step
│   │   ├── OpacitySlider.jsx   # Overlay opacity control
│   │   └── Celebration.jsx     # Confetti on completion
│   │
│   └── utils/
│       ├── imageProcessor.js   # OpenCV: downscale → edges → hierarchy contours → step PNGs
│       └── geminiService.js    # Calls backend proxy /api/ai/analyze
│
├── .env.local                  # VITE_API_URL=http://localhost:5000
├── package.json
└── vite.config.js
```

> [!NOTE]
> **Gemini API key is server-side from day one.** Even Phase 0 includes a minimal Express server (one file, one route) that proxies Gemini calls. The key never touches the client bundle, so the app is safe to deploy publicly, share a link, or demo — no key extraction risk.

---

### Auth Strategy (Phase 0 vs Phase 1)

**Phase 0: No auth.** The app is fully open. Every visitor gets unlimited use. This lets us validate the core product experience without friction.

**Phase 1: httpOnly cookie auth + Google OAuth.** When we add user accounts:

| Concern | Solution |
|---|---|
| XSS token theft | JWT stored in **httpOnly, Secure, SameSite=Strict** cookie — inaccessible to JavaScript |
| Token expiry | Short-lived access token (15 min) + long-lived refresh token (7 days) in separate httpOnly cookie |
| CSRF | SameSite=Strict cookie + CSRF token in headers |
| "Try before signup" | First sketch is free. Signup prompt appears on second sketch or when user tries to save/publish |

**"Continue with Google" Sign-In:**

| Detail | Implementation |
|---|---|
| Library | Google Identity Services (GIS) — `accounts.google.com/gsi/client` loaded via CDN |
| Frontend flow | Render the Google "Sign in with Google" button via `google.accounts.id.initialize()` + `renderButton()` |
| Backend flow | Google returns a JWT `credential` to the frontend → frontend sends it to `POST /api/auth/google` → backend verifies the token with Google's public keys using `google-auth-library` → creates or finds user in MongoDB → sets httpOnly session cookie |
| Auto-populate profile | Username, email, and avatar automatically pulled from Google account — zero friction |
| Fallback | Email + password signup remains available for users who prefer not to use Google |

---

### Image Storage Strategy (Phase 1+)

| What | Where | Why |
|---|---|---|
| Original uploaded image | **Cloudinary** (free: 25GB storage, 25GB bandwidth/mo) | CDN-delivered, auto-optimized, no DB bloat |
| Compressed thumbnail | **Cloudinary** (auto-transform URL) | `w_300,h_300,c_fill` transform in URL |
| Image URL | **MongoDB** `sketch.imageUrl` field (String) | Tiny, fast reads |
| Step PNG renders | **Browser memory only** (canvas blobs) | Ephemeral, regenerated from contours each session |

---

### Proposed File Changes (Phase 0)

| Status | File | Purpose |
|---|---|---|
| [MODIFY] | `index.html` | Add OpenCV.js CDN, meta tags, favicon |
| [NEW] | `.env.local` | `VITE_API_URL=http://localhost:5000` |
| [NEW] | `src/index.css` | Full design system (dark mode, glassmorphism, typography) |
| [MODIFY] | `src/App.jsx` | Screen flow: Landing → Upload → Configure → Workspace |
| [NEW] | `src/components/Landing.jsx` | Hero, features, how-it-works, CTA |
| [NEW] | `src/components/ImageUploader.jsx` | Upload from device + sample library grid |
| [NEW] | `src/components/StepConfigurator.jsx` | Step count slider + difficulty pills |
| [NEW] | `src/components/SketchWorkspace.jsx` | Workspace container |
| [NEW] | `src/components/SketchOverlay.jsx` | Canvas with progressive line drawing |
| [NEW] | `src/components/StepNavigation.jsx` | Prev/Next + progress bar |
| [NEW] | `src/components/InstructionCard.jsx` | AI instruction panel |
| [NEW] | `src/components/OpacitySlider.jsx` | Opacity range input |
| [NEW] | `src/components/Celebration.jsx` | Confetti on completion |
| [NEW] | `src/utils/imageProcessor.js` | OpenCV: downscale → edge detection → hierarchy-weighted contour grouping |
| [NEW] | `src/utils/geminiService.js` | Calls backend proxy (`/api/ai/analyze`) |
| [NEW] | `server/index.js` | Minimal Express server — Gemini API proxy (one route) |
| [NEW] | `server/.env` | `GEMINI_API_KEY`, `PORT=5000` |
| [NEW] | `public/samples/*.jpg` | 10 sample images |

---

## Verification Plan (Phase 0)

### Build Check
- `npm run build` — compiles without errors.

### Manual Testing
1. **Landing page** — renders hero, features, CTA. Looks premium.
2. **Upload** — upload a JPG from device, verify preview renders.
3. **Sample picker** — pick "Cat sitting", verify it loads.
4. **Configure** — select 5 steps + Beginner. Hit "Generate".
5. **OpenCV processing** — verify the image converts to a line sketch and splits into 5 progressive step groups.
6. **Gemini sync** — verify Gemini returns 5 instructions that accurately describe what each step's lines look like (not generic text).
7. **Step navigation** — click Next, verify new lines appear AND instruction text updates in sync.
8. **Opacity** — drag slider, verify overlay fades smoothly.
9. **Completion** — reach final step, verify celebration animation.
10. **Fallback** — disconnect internet mid-sketch, verify the line overlay still works (just no AI text).
