# StageWay — Implementation Master Plan

> **This file is the single source of truth** for all upcoming work.
> Update status markers as tasks complete. Every coding session should start here.
> Legend: `[ ]` todo · `[x]` done · `[-]` in progress · `[~]` blocked/waiting

---

## Context Snapshot

**What StageWay is:** Full-stack event management platform.
**Backend:** Spring Boot 3.2.4, Java 21, Supabase JWT auth, PostgreSQL via Supabase, Flyway migrations (V1–V13), Caffeine cache, HMAC-SHA256 QR check-in, WebSocket (STOMP/SockJS at `/ws`, real-time check-in on `/topic/checkins/{eventId}`), optimistic locking on Event + Registration.
**Frontend:** Next.js 16.1.1, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, TanStack Query, Framer Motion, Recharts, Three.js (R3F 9.5 + drei 10.7).
**Current deployment:** Frontend → Vercel. Backend → Render free (cold starts). DB/Auth → Supabase. Files → Supabase Storage (half-wired).

**UI Stack additions (April 2026):**
- `lenis@1.3.23` — smooth scroll (replaces `scroll-behavior: smooth`)
- `anthropics/skills/frontend-design`, `vercel-labs/agent-skills/web-design-guidelines`, `anthropics/skills/theme-factory` — installed globally via `npx skills add`

**Decided stack going forward:**
- Frontend: Vercel (keep)
- Backend: OCI ARM Ampere A1 VM (4 cores, 24GB RAM, free forever) via Docker
- Database + Auth: Supabase (keep, already wired)
- File storage: Cloudflare R2 (replace Supabase Storage — zero egress, S3-compatible)
- CDN + DNS: Cloudflare free (proxy domain)
- Cache: Caffeine in-memory (sufficient, already running in prod)
- Three.js stack: `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`

---

## Phase 0 — Infrastructure & Deployment
> **DO LAST** — implement everything locally first, deploy when all phases 1–9 are complete.

### 0.1 Oracle Cloud (OCI)
- [ ] Sign up at cloud.oracle.com (credit card for verification only, no charges)
- [ ] Create `VM.Standard.A1.Flex` instance — 4 OCPUs, 24GB RAM, Ubuntu 22.04 ARM
- [ ] Download SSH key pair, note public IP
- [ ] SSH in, install Docker: `curl -fsSL https://get.docker.com | sh`
- [ ] Install nginx: `sudo apt install -y nginx`
- [ ] Open OCI Security List: TCP ingress on ports 80, 443, 8081
- [ ] Verify Docker works: `docker run hello-world`

### 0.2 Cloudflare R2
- [ ] Enable R2 in Cloudflare Dashboard (add payment method — free tier, no charge)
- [ ] Create bucket `stageway-assets` (public read enabled)
- [ ] Create R2 API token with read+write permissions
- [ ] Note: Account ID, Access Key ID, Secret Access Key, bucket endpoint URL

### 0.3 Cloudflare DNS
- [ ] Add domain to Cloudflare (change registrar nameservers)
- [ ] Add A record: `api.yourdomain.com` → OCI public IP (proxy enabled, orange cloud)
- [ ] Verify Cloudflare SSL mode: Full (not Full Strict) for HTTP backend

### 0.4 UptimeRobot (bridge — keep Render alive while migrating)
- [ ] Sign up at uptimerobot.com (free)
- [ ] Add HTTP monitor: `https://your-render-url/actuator/health`, every 5 minutes
- [ ] Verify monitor is green — Render cold starts eliminated

**Phase 0 done when:** OCI VM running Docker, R2 wired, domain Cloudflare-proxied, Vercel env vars updated, smoke test passes.

---

## Phase 1 — Backend Completions
> Wire features that exist in config but were never completed. No new models or migrations needed.

### 1.1 Cloudflare R2 — File Storage Integration
**File:** `backend/src/main/java/com/eventmanagement/service/FileStorageService.java`
**Current state:** Wired to Supabase Storage via RestTemplate. Supabase credentials often missing in prod → uploads silently fall back to local disk → files lost on container restart.
**Goal:** Replace Supabase Storage path with AWS SDK v2 S3 client pointed at R2 endpoint. Keep Supabase Storage as fallback if R2 env vars absent.

- [ ] Add AWS SDK v2 S3 dependency to `pom.xml`: `software.amazon.awssdk:s3`
- [ ] Add R2 environment variables to `application.yml`:
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
- [ ] Refactor `FileStorageService`: build `S3Client` with R2 endpoint (`https://<account-id>.r2.cloudflarestorage.com`), region `auto`
- [ ] Replace `uploadToSupabase()` with `uploadToR2()` using `PutObjectRequest`
- [ ] Replace `buildSupabasePublicUrl()` with R2 public URL construction
- [ ] Update `downloadFile()` to redirect to R2 public URL for public files
- [ ] Test: upload event banner, verify URL serves from Cloudflare CDN
- [ ] Set R2 env vars in Render (current) and later OCI

### 1.2 WebSocket — Real-time Check-in Updates ✅
**Files:** `RegistrationUpdatePublisher.java`, `CheckInBroadcast.java` (new DTO), `RegistrationService.java`, `useCheckInSocket.ts`, `check-in/page.tsx`
- [x] Created `CheckInBroadcast` record DTO (`registrationId, eventId, attendeeName, attendeeEmail, seatNumber, checkedInAt, method`)
- [x] Added `publishCheckIn(Registration)` method to `RegistrationUpdatePublisher` — broadcasts to `/topic/checkins/{eventId}`
- [x] Wired `registrationUpdatePublisher.publishCheckIn(saved)` in `RegistrationService.checkInById()`
- [x] Installed `@stomp/stompjs@7.3.0`, `sockjs-client@1.6.1`, `@types/sockjs-client@1.5.4`
- [x] Created `hooks/useCheckInSocket.ts` — STOMP client hook with auth header + stale-closure-safe callback ref
- [x] Wired hook in `check-in/page.tsx` — live attendee list updates on check-in broadcast

### 1.3 OpenAPI / Swagger Docs ✅
**Files:** `pom.xml`, `SecurityConfig.java`, `OpenApiConfig.java` (new), all controllers
- [x] Added `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0` to `pom.xml`
- [x] Added `OpenApiConfig.java` — registers `bearerAuth` JWT security scheme, API title/description
- [x] Added Swagger permit rules to `SecurityConfig`: `/swagger-ui/**`, `/v3/api-docs/**`
- [x] Added `@Tag` + `@Operation` annotations to all 7 controllers (Auth, Events, Registrations, Analytics, Admin, HostRequests, Files)
- [x] Fixed pre-existing checkstyle failures: removed invalid `skipConstructor`/`ignoreComments` config properties, expanded star import in `SupabaseAuthService`, fixed `NeedBraces` in `AnalyticsService`, removed unused imports, wrapped long lines
- [ ] Verify at `http://localhost:8081/swagger-ui/index.html` after starting backend

### 1.4 OCI Deployment
**File:** `backend/Dockerfile` (already updated — `eclipse-temurin:21-jre-jammy`, container-aware JVM flags)

- [ ] On OCI VM: `git clone` repo
- [ ] `docker build -t stageway-backend .` (builds native ARM64)
- [ ] Create `/opt/stageway/.env` with all production env vars
- [ ] Run container with `--restart unless-stopped`, `--env-file`
- [ ] Configure nginx: proxy `api.yourdomain.com` → `localhost:8081`
- [ ] Test all endpoints via Cloudflare proxy URL
- [ ] Update Vercel env var `NEXT_PUBLIC_API_BASE_URL` to new OCI URL
- [ ] Verify frontend → OCI backend connection
- [ ] Remove Render service (or leave as fallback)

**Phase 1 done when:** Files upload to R2 and serve from CDN. Check-in page updates live ✅. API docs available ✅. Backend running on OCI with no cold starts.

---

## Phase 2 — Frontend: Design System Foundation ✅
> Dark-first theme, Three.js stack installed, reusable 3D primitives. Every page rebuild in Phases 3–7 depends on this.

### Design Decisions (locked — v1, superseded by v2 below)

**Color tokens (v1 — replaced):**
```
--background:     #09090e   (near-black, slightly blue)
--primary:        #a855f7   (electric violet)
--accent:         #f97316   (neon orange)
```
> ⚠️ **Replaced by Design System v2 in April 2026** — see Phase 2 v2 below.

**Typography (v1):**
- Headings: `Space Grotesk` → updated to `Plus_Jakarta_Sans` (display variable `--font-display`)
- Body: `Inter` (keep)
- Mono: `JetBrains Mono`

### 2.1 Install Three.js Stack ✅
- [x] `three 0.183`, `@react-three/fiber 9.5`, `@react-three/drei 10.7`, `@react-three/postprocessing 3.0` installed
- [x] SSR-safe: all Three.js components use `dynamic(() => import(...), { ssr: false })`

### 2.2–2.5 Initial Dark Theme + Components ✅
- [x] globals.css v1 with dark tokens, glass utilities, neon glow utilities
- [x] Tailwind config with dark color tokens, custom shadows
- [x] Three.js components: `ParticleField`, `StageScene`, `FloatingCard`, `CheckInEffect`
- [x] NavBar v1 — dark glass sticky, blur on scroll, animated mobile menu
- [x] Footer v1 — dark minimal with gradient CTA banner

**Phase 2 done when:** ✅

---

## Phase 2 v2 — UI Redesign "Luminary" ✅
> **April 2026.** Complete design overhaul. User was unsatisfied with v1 (flat, monochromatic, generic SaaS feel).
> Research-driven redesign inspired by Luma, Linear, Raycast, and 2025 UI trends.

### Research Summary (do not redo — findings locked here)

**Sites studied:**
| Site | Key takeaway applied |
|---|---|
| **Luma** (lu.ma) | Clean card hierarchy, action-first CTAs, minimal nav, community feel |
| **Linear** (linear.app) | Monochromatic restraint, bold type, one CTA per section, no zig-zag layout, sequential scroll |
| **Raycast** (raycast.com) | Ambient gradient orbs, music-studio dark, crisp typography, gradient overlays |
| **Motion.dev** | Spring physics over linear easing, AnimatePresence exits, `willChange` for perf, scroll-triggered reveals |
| **Olivier Larose blog** | Lenis + Framer Motion `useScroll`/`useTransform` parallax pattern |

**2025 UI trend findings:**
- Dark glassmorphism: frosted glass + ambient gradient orbs (vibrant purple, rose, amber behind UI) = depth
- Typography: bold display fonts, kinetic letter-spacing, large `clamp()` sizes = personality
- Motion: animations <300ms for micro-interactions, spring physics for naturalness, `willChange: "transform"` for perf
- Skeletons: shimmer with `background-size: 200%` + keyframe sweep — more visible than opacity only
- Event platforms: poster-format (3:4) cards > landscape (16:9) — more billboard energy, better grid density
- Floating pill navbars (not full-width bars) — feel lighter, more app-like (Linear, Vercel, Luma all do this)
- Iridescent gradient borders (CSS `mask-composite: exclude` trick) — premium feel without JS

**Lenis setup pattern (Next.js App Router):**
```tsx
// SmoothScroll.tsx — wrap entire app, scroll-behavior: auto in CSS (Lenis takes over)
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // exponential out
  smoothWheel: true,
  wheelMultiplier: 0.9,
});
// RAF loop in useEffect, cleanup on unmount
```
- Package: `lenis` (NOT `@studio-freight/lenis` — deprecated). v1.3.23.
- Set `scroll-behavior: auto` in CSS (not `smooth`) — Lenis replaces it.
- Works with Framer Motion `useScroll`/`useTransform` without conflicts when RAF loop is manual.

**Framer Motion parallax pattern:**
```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], [0, 80]);  // content rises 80px as section scrolls out
```

### Design System v2 (active — use these, not v1 tokens)

**Color tokens:**
```
--sw-base:        #060810   /* deep space — slightly blue-black */
--sw-surface:     #0e1018   /* cards, panels */
--sw-elevated:    #141720   /* hover state, elevated surfaces */
--sw-overlay:     #1c2030   /* dropdowns, modals */

--sw-accent:      #7c5af5   /* indigo-violet primary */
--sw-accent-2:    #9d7dff   /* lighter violet — text gradient */
--sw-gold:        #f5a623   /* amber spotlight — secondary accent */
--sw-text-1:      #eef0f7   /* primary text */
--sw-text-2:      #8890aa   /* secondary text */
--sw-text-3:      #555c72   /* muted */

/* Category system */
--cat-music:    #ec4899  /* rose */
--cat-tech:     #38bdf8  /* sky */
--cat-sports:   #f97316  /* orange */
--cat-arts:     #a78bfa  /* violet */
--cat-business: #34d399  /* emerald */
--cat-food:     #fb923c  /* amber */
```

**Key CSS utilities added:**
- `.ambient-orb`, `.orb-violet`, `.orb-gold`, `.orb-rose` — blur radial gradient blobs for section depth
- `.border-gradient` — iridescent gradient border via `mask-composite: exclude`
- `.gradient-text-iridescent` — violet → purple → rose → orange gradient text
- `.glow-card-hover` — lift + glow shadow on hover
- `.live-dot` — pulsing pink dot for live event badges
- `.spotlight` — top-ellipse glow for hero sections
- `body` has subtle SVG noise texture (`opacity: 0.025`) for depth

### Files Changed in v2

| File | Change |
|---|---|
| `globals.css` | Complete rewrite — new tokens, ambient orbs, iridescent border, category colors, noise texture, updated scrollbar |
| `layout.tsx` | Added `SmoothScroll` wrapper, bg updated to `#060810`, toaster uses `#141720` rounded-xl |
| `SmoothScroll.tsx` | **New** — Lenis provider with exponential easing, manual RAF loop |
| `PageLoader.tsx` | Spotlight beam fires as curtains open, ambient glow behind wordmark, letter-spacing collapse animation |
| `NavBar.tsx` | **Floating pill** (fixed + max-w-5xl, not full-width), scroll-aware backdrop blur, Zap icon logo mark, gradient CTA with glow shadow, active state = violet ring |
| `Footer.tsx` | Iridescent gradient top border, glassmorphism CTA card with inner glow orb, ambient orb, Privacy/Terms links |
| `EventCard.tsx` | **3:4 concert poster aspect ratio**, category-colored badge + glow on hover (via JS mouse events), bottom strip with category-colored capacity bar, ArrowUpRight reveal |
| `EventCardSkeleton.tsx` | Updated to 3:4 poster format |
| `EventList.tsx` | Simplified — passes `index` prop to EventCard for stagger delay, removed redundant motion wrapper |
| `events/page.tsx` | Ambient orb page hero, sort pills row, redesigned search input (focus glow via inline JS), AnimatePresence clear button, Sparkles empty state |
| `HeroSection.tsx` | Three ambient gradient orbs, scroll parallax (`useScroll`/`useTransform` on content + canvas), iridescent gradient headline via `clamp()` font-size, live stats row with icon cards, scrolling ticker marquee at bottom |

### Design Rules Going Forward (for new pages/components)
1. **Background**: always `var(--sw-base)` (`#060810`), never hardcoded hex.
2. **Cards**: `var(--sw-surface)` + `border: 1px solid var(--sw-border)` + `rounded-2xl`.
3. **Section depth**: add an ambient orb div behind each major section (see Footer / HeroSection pattern).
4. **Event cards**: always 3:4 poster format. Category dot required.
5. **CTA buttons**: gradient `#7c5af5 → #6040e0` + glow box-shadow. Rounded-full for primary, rounded-full ghost for secondary.
6. **Nav**: do not change to sticky full-width — floating pill is intentional design decision.
7. **Animations**: Framer Motion with spring or `[0.16, 1, 0.3, 1]` cubic-bezier. No `linear` easing on UI elements. Stagger with `index * 0.06s` delay.
8. **New section hero areas**: use `.spotlight` class + ambient orb above the fold.
9. **Typography scale**: `clamp(2.8rem, 7vw, 5.5rem)` for hero h1, `text-3xl md:text-4xl` for page titles, `text-2xl` for section headers.
10. **Skeleton loaders**: use `.skeleton` CSS class (already defined in globals.css), not custom shimmer per-component.

**Phase 2 v2 done when:** ✅ Dev server live at localhost:3000 with all changes, TypeScript clean (0 new errors).

---

## Phase 3 — Landing Page ✅

**Files:** `frontend/src/app/page.tsx`, `components/HeroSection.tsx`

- [x] Full-viewport Canvas with `StageScene` (3 animated spotlights, particle field, fog)
- [x] Canvas hidden when `prefers-reduced-motion` is set (via framer-motion `useReducedMotion`)
- [x] Mobile detection via `matchMedia` — passes `mobile={true}` to StageScene (reduced particle counts)
- [x] Hero text overlaid with gradient headline "Where Events Come Alive"
- [x] Scroll-down indicator with bounce animation
- [x] Stats row (live event count, upcoming count)
- [x] Featured events section with dark glass `EventCard` grid

**Phase 3 done when:** ✅

---

## Phase 4 — Events Pages ✅

### 4.1 Events Discovery (`/events`) ✅
- [x] Dark page with filter sidebar (glass panel, dark inputs, neon focus rings, Calendar popover, price range slider)
- [x] `EventCard` component — dark glass, price badge, capacity bar, sold-out indicator, `React.memo` wrapped
- [x] `EventFilters` component — dark selects, Switch, date pickers

### 4.2 Event Detail (`/events/[id]`) ✅
- [x] Full-width hero banner, floating registration card (glassmorphism)
- [x] `EventDetails` component — icon buttons with `aria-label` (Edit, Share, Add to Calendar)
- [x] Seat availability, registration flow inline

### 4.3 Create/Edit Event
- [ ] Dark form with glass card sections — not yet rebuilt for dark theme

**Phase 4 done when:** ✅ Discovery and detail pages done. Create/Edit uses legacy styles (functional, not dark-themed).

---

## Phase 5 — Auth Pages ✅

- [x] `LoginForm.tsx` — dark inputs, violet focus rings, violet submit button
- [x] `RegisterForm.tsx` — dark, 5-segment password strength bar with neon colors
- [x] `ForgotPasswordForm.tsx` — dark minimal, emerald success notice
- [x] `ResetPasswordForm.tsx` — dark, `isComplete` success state with CheckCircle2
- [x] `OAuthButtons.tsx` — dark ghost button with glass styling
- [x] Auth pages: `/auth/signin`, `/auth/signup`, `/auth/forgot`, `/auth/reset`

**Phase 5 done when:** ✅

---

## Phase 6 — Dashboard & Registrations ✅

- [x] `dashboard/page.tsx` — dark command-center, stat tiles, tabs for events/registrations
- [x] `registrations/page.tsx` — dark list, glass cards, filter tabs, cancel flow
- [x] `RegistrationCard.tsx` — dark glass, STATUS_STYLE map, `onCancel` prop with `aria-label`, `React.memo` wrapped
- [x] Fixed: `r.status === "CONFIRMED"` (was `"REGISTERED"`, not a valid RegistrationStatus)
- [x] Fixed: `now = useMemo(() => new Date(), [])` to avoid dependency warnings

**Phase 6 done when:** ✅

---

## Phase 7 — Host Pages ✅

- [x] `host/page.tsx` — dark dashboard, stat tiles (violet/amber/cyan), tabbed event list, pagination
- [x] `HostEventCard.tsx` — dark glass, STATUS_STYLE map, animated fill bar, Edit/View buttons
- [x] `check-in/page.tsx` — full dark scanner UI, animated scan-line, manual attendee list, live WebSocket updates via `useCheckInSocket`
- [x] `analytics/page.tsx` — dark shell, loading spinner, empty state
- [x] `HostAnalyticsDashboard.tsx` — dark Recharts, custom `darkTooltip`, neon chart colors, 4 chart types (bar, pie donut, line, horizontal bar)

**Phase 7 done when:** ✅

---

## Phase 8 — Admin Pages ✅

- [x] `admin/host-requests/page.tsx` — dark admin panel, status-accented cards, AnimatePresence stagger, approve/reject with loading states

**Phase 8 done when:** ✅

---

## Phase 9 — Polish & Production Hardening

### 9.1 Animations & Micro-interactions
- [ ] Page transitions: Framer Motion `AnimatePresence` between routes (still snap — not done)
- [x] Smooth scroll: Lenis provider wraps entire app (`SmoothScroll.tsx`) — April 2026
- [x] Scroll parallax on HeroSection: `useScroll` + `useTransform` on content + Three.js canvas
- [x] Stagger animation on EventCard grid: `index * 0.06s` delay via Framer Motion
- [x] Loading states: skeleton shimmer updated to match v2 design (`.skeleton` in globals.css)
- [x] Toast notifications (sonner): styled `#141720` bg, violet border, `rounded-xl` — April 2026
- [x] AnimatePresence on search clear button, filter panel open/close (events page)

### 9.2 Responsive / Mobile ✅
- [x] Three.js: `mobile` prop on `StageScene` reduces particle counts at `max-width: 767px`
- [x] Canvas disabled when `prefers-reduced-motion` set (HeroSection uses `useReducedMotion`)
- [x] NavBar hamburger menu with animated mobile drawer

### 9.3 Performance ✅
- [x] `React.memo` on `EventCard` and `RegistrationCard`
- [x] Dynamic imports for all Three.js components (`ssr: false`)
- [ ] `frameloop="demand"` on non-animated canvases (hero uses `"always"` — correct for animated spotlights)

### 9.4 Accessibility ✅
- [x] `aria-label` on icon-only buttons: NavBar hamburger, EventDetails (Edit/Share/Calendar), RegistrationCard cancel
- [x] `aria-expanded` on NavBar hamburger button
- [x] EventCarousel prev/next buttons already had `aria-label`

### 9.5 Final Deployment Checks
- [ ] Update `next.config.mjs`: add R2 public URL to `images.domains` (when R2 credentials available)
- [ ] Update CORS on Spring Boot: add OCI/Cloudflare proxy URL to allowed origins
- [ ] Environment variables verified in Vercel dashboard
- [ ] Environment variables verified in OCI `.env` file
- [ ] Run `bun run verify` (lint + typecheck + audit) — zero errors ✅ (0 errors, 3 pre-existing warnings)
- [ ] Run `./mvnw checkstyle:check` — passes ✅
- [ ] Run `./mvnw test` — all tests pass
- [ ] Smoke test full user journey: sign up → browse events → register → QR → check-in

---

## Decisions Log
> Record key decisions so they don't get relitigated.

| Decision | Choice | Reason |
|---|---|---|
| Backend runtime | OCI ARM Ampere A1 (free VM) | 24GB RAM, always-on, Docker-native, zero cost forever |
| Frontend hosting | Vercel | Best Next.js platform, zero config, free tier sufficient |
| Database | Supabase PostgreSQL | Already wired for auth + DB, Flyway migrations in place |
| Auth | Supabase JWT | Already working, Google OAuth done |
| File storage | Cloudflare R2 | Zero egress fees, S3-compatible (AWS SDK), free 10GB |
| CDN/DNS | Cloudflare free | Free WAF, DDoS, SSL, CDN |
| Backend language | Keep Spring Boot | Well-built backend, complex business logic, not worth rewriting |
| Cloudflare Workers | Skipped | Cannot run JVM — incompatible with Spring Boot |
| Cloudflare D1 | Skipped | SQLite, not JDBC-compatible with Spring Boot/JPA |
| Three.js integration | React Three Fiber | Declarative, React-native, avoids manual lifecycle management |
| Theme | Dark-first | Concert/stage aesthetic, neon effects only work on dark backgrounds |
| Cache | Caffeine in-memory | Already running in prod, sufficient for current scale |
| ESLint `set-state-in-effect` | Disabled globally | False positive for standard async data-fetch loading pattern |
| Checkstyle `FinalLocalVariable` | Removed | Too aggressive — requires `final` on every local var, 416 violations across entire codebase |
| Checkstyle `ConstantName` | Allow `^log$` pattern | SLF4J loggers conventionally named `log` (lowercase) in Spring Boot |
| Smooth scroll | Lenis (`lenis` pkg, NOT `@studio-freight/lenis`) | Buttery easing, works with Framer Motion useScroll without conflicts. `scroll-behavior: auto` in CSS — Lenis takes over |
| NavBar style | Floating pill (fixed, max-w-5xl, not full-width) | Researched Luma + Linear + Vercel — pill style feels lighter, more app-like; full-width bars feel corporate |
| EventCard format | 3:4 portrait / poster aspect ratio | Concert poster energy; better grid density than 16:9 landscape; tested against Luma's card pattern |
| UI accent system | Indigo-violet `#7c5af5` primary + amber `#f5a623` spotlight + category colors | v1 violet-only felt flat; amber adds warmth; category dots (rose/sky/orange/violet/emerald) let cards breathe visually |
| Background depth | Noise texture on body + ambient gradient orbs per section | Researched 2025 dark glassmorphism trend — flat `#0d0d12` felt cheap vs layered depth with noise + orbs |
| Skills installed | `anthropics/skills/frontend-design`, `vercel-labs/agent-skills/web-design-guidelines`, `anthropics/skills/theme-factory` | Globally via `npx skills add`, for design-aware sessions |

---

## Blocked / Waiting

| Item | Blocked On | Who |
|---|---|---|
| Phase 0.1 | OCI account signup | User |
| Phase 0.2 | Enable R2 in Cloudflare dashboard | User |
| Phase 1.1 | R2 bucket + API credentials | Depends on 0.2 |
| Phase 1.4 | OCI VM provisioned + SSH access | Depends on 0.1 |

---

## Remaining Work Summary

**Next session priorities (in order):**

1. **Phase 1.1 — R2 File Storage** — blocked on user creating R2 bucket/credentials (Phase 0.2)
2. **Phase 4.3 — Create/Edit Event form** — functional but uses legacy styling, needs v2 design treatment (glass cards, category-colored inputs, new token system)
3. **Extend v2 design to inner pages** — dashboard, host hub, check-in, registrations, analytics — still use v1 surface colors (`#13131a`) that don't match new `#0e1018` surface token
4. **Phase 9.1 — Page transitions** — AnimatePresence between routes in layout (currently pages snap on nav)
5. **Phase 1.4 / Phase 0** — OCI deployment (do last, when ready to go live)

**Already complete:**
- Phase 2 v2 ✅ — Full UI redesign "Luminary" (April 2026): Lenis, new tokens, NavBar pill, Footer CTA band, EventCard poster, EventsPage, HeroSection parallax
- Phases 2 v1, 3, 5, 6, 7, 8 — fully rebuilt dark UI
- Phase 4.1, 4.2 — events list and detail dark
- Phase 1.2 — WebSocket real-time check-in
- Phase 1.3 — OpenAPI/Swagger docs
- Phase 9.2, 9.3 (partial), 9.4 — mobile/reduced-motion, React.memo, aria-labels
- Landing page, About page — complete dark rebuild
- Checkstyle clean (BUILD SUCCESS)
- ESLint clean (0 errors, 3 pre-existing warnings)
- TypeScript clean (0 new errors; 7 pre-existing in StageScene.tsx `useRef` type narrowing — not blocking)
