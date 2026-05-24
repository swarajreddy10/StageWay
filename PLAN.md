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
**Audit baseline:** 2026-05-24 (repo-wide verification rerun and status correction).

**UI Stack additions (April 2026):**
- `lenis@1.3.23` — smooth scroll (replaces `scroll-behavior: smooth`)
- `anthropics/skills/frontend-design`, `vercel-labs/agent-skills/web-design-guidelines`, `anthropics/skills/theme-factory` — installed globally via `npx skills add`

**Decided stack going forward:**
- Frontend: Vercel (keep)
- Backend runtime: OCI Compute A1 VM (`VM.Standard.A1.Flex`) with Docker
- Provisioning/IaC: Terraform (`oracle/oci` provider + OCI Resource Manager)
- Database + Auth: Supabase (keep, already wired)
- File storage: OCI Object Storage (replace Supabase Storage in phased rollout)
- Secrets: OCI Vault (or env-file + restricted OS permissions until Vault cutover)
- DNS/TLS: OCI DNS + reverse proxy TLS
- Monitoring: OCI Monitoring + Logging
- Cache: Caffeine in-memory (sufficient, already running in prod)
- Three.js stack: `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`

---

## 2026-05-24 Strategy Pivot — OCI Always Free Backend (Active)
> OCI Always Free track is the active backend plan.

### OCI Always Free baseline (verified)
- Compute: Ampere A1 Always Free allowance equivalent to **4 OCPUs + 24 GB RAM** (`3,000 OCPU-hours` and `18,000 GB-hours` per month).
- Block storage: **200 GB** combined boot + block volume in home region.
- Object storage: **20 GB total** (combined tiers) + **50,000 Object Storage API requests/month** in Always Free-only state.
- Networking: **10 TB/month outbound data transfer**.
- Load balancing: **one Always Free flexible load balancer** (10 Mbps min/max) and one Network Load Balancer.
- Always Free compute caveat: idle instances can be reclaimed by Oracle; design for recovery and reproducibility.

### Cost-efficient backend architecture (OCI)
- [ ] Single VM first: one `VM.Standard.A1.Flex` instance, start at `2 OCPU / 12 GB` and scale vertically only when needed.
- [ ] Run backend + reverse proxy in Docker Compose on the VM.
- [ ] Keep DB/Auth in Supabase (already externalized) to avoid additional paid OCI data services.
- [ ] File strategy:
  - default: keep using existing storage path until OCI Object Storage migration is ready
  - OCI target: use Object Storage within Always Free limits, with lifecycle/cleanup policy
- [ ] Use OCI Bastion/SSH hardening and least-privilege IAM policies.

### Scale plan without over-engineering
- [ ] Stage 1 (default): vertical scale inside free envelope up to `4 OCPU / 24 GB`.
- [ ] Stage 2 (only if traffic requires): split into two A1 instances (for example `2+2 OCPU`) behind Always Free LB (10 Mbps).
- [ ] Stage 3 (if exceeding free envelope consistently): evaluate paid OCI or move to paid managed container path.

### Terraform and operations model (OCI)
- [ ] Use `terraform-provider-oci` for infra definitions (`infra/` modules + env roots).
- [ ] Use OCI Resource Manager for state/job management and drift detection where possible.
- [ ] Ensure infra is reproducible to recover from reclaimed idle resources quickly.
- [ ] Add alarms for CPU, memory, 5xx, and instance health using OCI Monitoring.
- [ ] Keep quotas/guardrails with compartment quotas to prevent accidental paid resource creation.

---

## 2026-05-24 Verification Snapshot (Ground Truth)
> This section supersedes stale "all green" notes until items are re-verified.

### Frontend quality gates
- [x] `bun run lint` passes (warnings cleaned, StageScene lint blocker fixed).
- [x] `bun run typecheck` passes (tsconfig ambient-type leakage fixed).
- [x] `bun test` passes for default suite (integration tests are now explicitly opt-in via `RUN_INTEGRATION_TESTS=true`).
- [x] `bun run security:audit` passes after dependency hardening (Next.js upgraded to `16.2.6`, vulnerable transitives resolved).

### Backend quality gates
- [x] `./mvnw -q checkstyle:check` passes.
- [~] `./mvnw -q test` passes **when required env vars are present** (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `QR_SECRET`); fails without test-safe defaults.

### Architecture and documentation consistency
- [ ] Single-source-of-truth docs still drift from runtime reality (legacy Redis/Cloudinary/Railway/Heroku/Kafka/Upstash references remain in docs/scripts).
- [ ] Single backend parity (local dev and prod on same OCI-target architecture) is not fully documented/automated yet.

### Verified official references (used for this plan update)
- Tailwind docs: https://tailwindcss.com/docs/content-configuration
- Tailwind dark mode: https://tailwindcss.com/docs/dark-mode
- shadcn/ui docs: https://ui.shadcn.com/docs
- shadcn CLI docs: https://ui.shadcn.com/docs/cli
- Motion for React docs: https://motion.dev/docs/react
- Next.js Image remote patterns: https://nextjs.org/docs/app/api-reference/components/image
- Spring Boot externalized config: https://docs.spring.io/spring-boot/reference/features/external-config.html
- Spring Security CORS: https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html
- Spring Security WebSocket: https://docs.spring.io/spring-security/reference/7.0/servlet/integrations/websocket.html
- Supabase JWT/Auth docs: https://supabase.com/docs/guides/auth/jwts
- OCI Free Tier docs:
  - https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm
  - https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
  - https://www.oracle.com/cloud/free/faq/
  - https://www.oracle.com/cloud/pricing/
- OCI scaling/ops docs:
  - https://docs.public.content.oci.oraclecloud.com/iaas/Content/Compute/Tasks/autoscalinginstancepools.htm
  - https://docs.oracle.com/en-us/iaas/Content/General/service-limits/overview.htm
  - https://docs.public.content.oci.oraclecloud.com/en-us/iaas/Content/Quotas/home.htm
  - https://docs.oracle.com/iaas/Content/ResourceManager/Concepts/resource-manager-and-terraform.htm
  - https://docs.oracle.com/iaas/Content/ResourceManager/Tasks/detect-drift.htm
  - https://docs.oracle.com/en-us/iaas/Content/Balance/Tasks/managingloadbalancer_topic-Creating_Load_Balancers.htm
  - https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/loggingoverview.htm
  - https://docs.public.oneportal.content.oci.oraclecloud.com/en-us/iaas/Content/Monitoring/Concepts/monitoringoverview.htm
- Terraform docs (official):
  - https://docs.oracle.com/iaas/Content/ResourceManager/Concepts/resource-manager-and-terraform.htm
  - https://docs.oracle.com/iaas/Content/ResourceManager/Tasks/detect-drift.htm
  - https://registry.terraform.io/providers/oracle/oci/latest/docs
  - https://developer.hashicorp.com/terraform/language/files/dependency-lock
  - https://developer.hashicorp.com/terraform/cli/commands/fmt
  - https://developer.hashicorp.com/terraform/cli/commands/validate
  - https://developer.hashicorp.com/terraform/cli/commands/test
  - https://developer.hashicorp.com/terraform/language/modules/develop/structure
  - https://developer.hashicorp.com/terraform/language/state/sensitive-data
  - https://registry.terraform.io/providers/oracle/oci/latest/docs/resources/core_instance
  - https://registry.terraform.io/providers/oracle/oci/latest/docs/resources/objectstorage_bucket
  - https://registry.terraform.io/providers/oracle/oci/latest/docs/resources/load_balancer_load_balancer
- OWASP ASVS and cheat sheets:
  - https://devguide.owasp.org/en/03-requirements/05-asvs/
  - https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

## Phase 0 — Infrastructure & Deployment
> **DO LAST** — implement everything locally first, deploy when all phases 1–9 are complete.

### 0.0 Cost-Efficient OCI Baseline (Personal Project)
> Target: best Always Free usage / lowest ongoing cost for backend.

- [ ] Keep runtime inside Always Free envelope (up to `4 OCPU / 24 GB` across A1 instances).
- [ ] Start with one A1 instance (`2 OCPU / 12 GB`) and scale vertically first.
- [ ] Stay in one home region and avoid cross-region transfer.
- [ ] Keep object storage under Always Free limits with lifecycle cleanup.
- [ ] Set cost guardrails with compartments, quotas, and budgets.

### 0.1 OCI Account and Region Readiness
- [ ] Confirm account is active and home region has `VM.Standard.A1.Flex` capacity.
- [ ] Create cost budget alerts before first production deploy.
- [ ] Record service limits for compute, block volume, LB, and object storage.

### 0.2 Network and Security Foundation
- [ ] Create VCN, public subnet for reverse proxy, and secure NSG/security list rules.
- [ ] Open only required ingress (`80`, `443`, `8081` if direct test).
- [ ] Configure Bastion/SSH access and lock down admin access paths.

### 0.2.1 Terraform Foundation (Infrastructure as Code First)
- [ ] Add `infra/` root with standard module structure:
  - `infra/bootstrap`
  - `infra/modules/*`
  - `infra/envs/dev` and `infra/envs/prod`
- [ ] Pin Terraform and `oracle/oci` provider versions; commit `.terraform.lock.hcl`.
- [ ] Keep infra plan deterministic: `terraform fmt -check`, `terraform validate`, `terraform test` in CI.
- [ ] Use OCI Resource Manager for Terraform job execution and drift detection.
- [ ] Mark secret inputs as sensitive; never commit plaintext secrets/tfstate.

### 0.3 Compute Runtime
- [ ] Provision `VM.Standard.A1.Flex` instance with Ubuntu and Docker.
- [ ] Configure persistent volume mounts for app data/log rotation.
- [ ] Deploy backend + reverse proxy via Docker Compose.

### 0.4 Object Storage and Backups
- [ ] Create bucket(s) for app assets/backups in OCI Object Storage.
- [ ] Define lifecycle policy for stale objects and backup retention.
- [ ] Configure app-level CORS/public URL rules as required.

### 0.5 DNS and TLS
- [ ] Point `api.yourdomain.com` to OCI public endpoint/LB.
- [ ] Configure TLS termination (reverse proxy and certificate renewal).

### 0.6 Monitoring and Alerts
- [ ] Enable OCI Logging and Monitoring for backend host and app.
- [ ] Add alarms for CPU, memory, 5xx spikes, and host health.
- [ ] Add uptime checks and incident notification channel.

**Phase 0 done when:** OCI backend is reachable via custom domain/TLS, infra is Terraform-managed, alerts are active, and smoke test passes.

---

## Phase 1 — Backend Completions
> Wire features that exist in config but were never completed. No new models or migrations needed.

### 1.1 OCI Object Storage — File Storage Integration
**File:** `backend/src/main/java/com/eventmanagement/service/FileStorageService.java`
**Current state:** Wired to Supabase Storage via RestTemplate. Supabase credentials often missing in prod → uploads silently fall back to local disk → files lost on container restart.
**Goal:** Replace Supabase Storage path with OCI Object Storage client flow. Keep Supabase path as temporary fallback until OCI rollout is complete.

- [ ] Add OCI Object Storage SDK dependency in `pom.xml` (Oracle Java SDK module for Object Storage)
- [ ] Add OCI storage env variables to `application.yml`:
  - `OCI_REGION`, `OCI_NAMESPACE`, `OCI_BUCKET`, `OCI_TENANCY_OCID`, `OCI_USER_OCID`, `OCI_FINGERPRINT`, `OCI_PRIVATE_KEY_PATH`
- [ ] Refactor `FileStorageService` to upload/download via OCI Object Storage APIs.
- [ ] Replace Supabase public URL builder with OCI object URL/signed URL strategy.
- [ ] Update `downloadFile()` to use signed URL or controlled proxy route.
- [ ] Test: upload event banner, verify URL serves correctly from OCI Object Storage flow.
- [ ] Store OCI credentials securely (Vault or restricted host secret file with rotation plan).

### 1.2 WebSocket — Real-time Check-in Updates ✅ (Feature Complete, Hardening Pending)
**Files:** `RegistrationUpdatePublisher.java`, `CheckInBroadcast.java` (new DTO), `RegistrationService.java`, `useCheckInSocket.ts`, `check-in/page.tsx`
- [x] Created `CheckInBroadcast` record DTO (`registrationId, eventId, attendeeName, attendeeEmail, seatNumber, checkedInAt, method`)
- [x] Added `publishCheckIn(Registration)` method to `RegistrationUpdatePublisher` — broadcasts to `/topic/checkins/{eventId}`
- [x] Wired `registrationUpdatePublisher.publishCheckIn(saved)` in `RegistrationService.checkInById()`
- [x] Installed `@stomp/stompjs@7.3.0`, `sockjs-client@1.6.1`, `@types/sockjs-client@1.5.4`
- [x] Created `hooks/useCheckInSocket.ts` — STOMP client hook with auth header + stale-closure-safe callback ref
- [x] Wired hook in `check-in/page.tsx` — live attendee list updates on check-in broadcast
- [ ] Remove `attendeeEmail` from broadcast payload unless strictly required by role/UX.
- [ ] Add explicit message-level authorization policy for STOMP destinations (`/app/**`, `/topic/**`) and deny-by-default for inbound message types.
- [ ] Tighten WebSocket allowed origins to strict environment allowlist (no broad wildcard patterns).
- [ ] Add security regression tests for unauthorized subscribe/publish attempts.

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

- [ ] Provision A1 VM and base OS hardening via Terraform.
- [ ] Deploy backend container and reverse proxy via Docker Compose.
- [ ] Configure secrets/env vars via OCI-friendly secure path (Vault or protected env-file).
- [ ] Configure health endpoint checks and restart policies.
- [ ] Test all endpoints via OCI public URL.
- [ ] Bind custom domain `api.yourdomain.com` + TLS cert.
- [ ] Update Vercel env var `NEXT_PUBLIC_API_BASE_URL` to OCI API URL.
- [ ] Verify frontend → OCI backend connection.
- [ ] Remove Render service after cutover and rollback window
- [ ] Keep rollback strategy documented (previous image tag + compose rollback steps).

**Phase 1 done when:** Files upload to OCI Object Storage (or approved interim fallback), check-in page updates live ✅, API docs available ✅, backend runs stably on OCI with no free-dyno cold starts.

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
- [~] Partially modernized, but still not fully on Design System v2 tokens/motion/accessibility parity.
- [ ] Finalize create/edit flow to full v2 system (token usage, spacing scale, motion, input states, validation UX consistency).

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
- [ ] Update `next.config.mjs`: add storage/public asset domain used in OCI file flow
- [ ] Update CORS on Spring Boot: add OCI API custom domain + Vercel frontend domain
- [ ] Environment variables verified in Vercel dashboard
- [ ] Environment variables verified on OCI host/runtime
- [x] Run `bun run verify` (lint + typecheck) — passes after frontend quality cleanup.
- [x] Run `bun run security:audit` — passes after frontend dependency upgrade sprint.
- [x] Run `./mvnw checkstyle:check` — passes (verified 2026-05-24).
- [~] Run `./mvnw test` — passes with required env vars injected; needs stable test defaults for zero-config local run.
- [ ] Smoke test full user journey: sign up → browse events → register → QR → check-in

### 9.6 Enterprise Hardening, Simplification, and SSOT
> Priority is reliability and clarity without over-engineering.

- [ ] Remove stale infra references from docs/scripts and align all docs to one current stack (Vercel + OCI + Supabase + Object Storage + Caffeine).
- [ ] Enforce one backend topology for local/prod parity:
  - local: Spring Boot + Supabase services + same env contract
  - prod: Spring Boot container on OCI host with same env contract
- [ ] Add test-safe backend defaults/profile for required auth/storage placeholders so `mvn test` runs clean locally without manual env hacks.
- [x] Stabilize frontend test baseline:
  - integration tests are opt-in (`RUN_INTEGRATION_TESTS=true`)
  - browser API mocks hardened for Bun runtime
  - CI now runs explicit quality gate (`verify` + tests) and separate security audit job
- [ ] Resolve duplicate/fragmented client infrastructure (single QueryClient source, remove dead client state bootstrapping).
- [ ] Add minimal E2E happy-path coverage (auth → browse → register → check-in) and run in CI.

### 9.7 Terraform and Infra Operations Hardening
- [ ] Add CI checks for IaC quality:
  - `terraform fmt -check -recursive`
  - `terraform validate`
  - `terraform test` (module-level tests where useful)
- [ ] Enforce PR workflow:
  - plan on PR
  - apply only on protected branch/manual approval
- [ ] Add drift detection cadence (scheduled `terraform plan` in read-only mode).
- [ ] Prevent state/secrets leaks:
  - block `terraform.tfstate` and `.tfvars` secret files from git
  - review outputs to avoid exposing secret values
- [ ] Define rollback runbook:
  - rollback by redeploying previous image tag
  - validate health endpoint and websocket reconnect behavior after rollback

---

## Decisions Log
> Record key decisions so they don't get relitigated.

| Decision | Choice | Reason |
|---|---|---|
| Active backend cloud (current) | OCI Always Free (A1 VM path) | Maximize zero-cost runway for StageWay backend |
| Backend runtime | OCI Compute A1 + Docker Compose | Simple, predictable, and stays inside Always Free targets |
| Frontend hosting | Vercel | Best Next.js platform, zero config, free tier sufficient |
| Database | Supabase PostgreSQL | Already wired for auth + DB, Flyway migrations in place |
| Auth | Supabase JWT | Already working, Google OAuth done |
| File storage | OCI Object Storage | Stays in OCI ecosystem and aligns with Always Free limits |
| DNS/TLS | OCI DNS + reverse proxy TLS | Minimal moving parts and direct control |
| Secrets | OCI Vault or restricted host secret file | Practical security with gradual hardening path |
| Infra provisioning | Terraform + OCI provider + Resource Manager | Repeatable infra with drift detection |
| Backend language | Keep Spring Boot | Well-built backend, complex business logic, not worth rewriting |
| OCI scale model | Vertical-first within 4 OCPU/24GB, then optional 2-node + free LB | Best cost efficiency for personal-project traffic |
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
| Single backend strategy | Same Spring Boot backend contract for local + prod (OCI target) | Reduces environment drift, lowers debugging complexity, keeps one source of truth |

---

## Blocked / Waiting

| Item | Blocked On | Who |
|---|---|---|
| OCI pivot baseline | Home region capacity for A1 shape / provisioning success | User |
| OCI Terraform bootstrap | Initial OCI tenancy/user/policy wiring for Terraform workflows | Depends on OCI IAM setup |
| Phase 0.2 | VCN + security baseline completion | Depends on tenancy limits/policies |
| Phase 0.4 / 1.1 | Object Storage bucket policy + signed URL strategy finalized | User + Depends on 0.4 |
| Phase 1.4 | OCI deploy path hardened (TLS, alarms, rollback) | Depends on 0.3, 0.5, 0.6 |

---

## Remaining Work Summary

**Next session priorities (in order):**

1. **Finalize backend test determinism** — make `mvn test` green without manual env injection.
2. **OCI Always Free bootstrap** — provision A1 VM in home region and validate free-tier resource fit.
3. **OCI Terraform foundation** — define OCI modules/stacks and reproducible infra recovery workflow.
4. **Phase 9.6 SSOT cleanup** — remove stale infra guidance and enforce one documented stack/runtime path.
5. **Phase 1.2 hardening** — tighten WebSocket auth/origin policy and reduce broadcast PII.
6. **Phase 1.1 storage path decision** — keep current path or migrate to OCI Object Storage within free limits.
7. **Phase 4.3 + transitions** — complete create/edit v2 parity and route transitions.
8. **OCI backend production hardening** — monitoring alarms, backups, and optional free LB when needed.

**Already complete:**
- Phase 2 v2 ✅ — Full UI redesign "Luminary" (April 2026): Lenis, new tokens, NavBar pill, Footer CTA band, EventCard poster, EventsPage, HeroSection parallax
- Phases 2 v1, 3, 5, 6, 7, 8 — fully rebuilt dark UI
- Phase 4.1, 4.2 — events list and detail dark
- Phase 1.2 — WebSocket real-time check-in
- Phase 1.3 — OpenAPI/Swagger docs
- Phase 9.2, 9.3 (partial), 9.4 — mobile/reduced-motion, React.memo, aria-labels
- Landing page, About page — complete dark rebuild
- Checkstyle clean (BUILD SUCCESS)
- Backend tests pass with injected env placeholders
