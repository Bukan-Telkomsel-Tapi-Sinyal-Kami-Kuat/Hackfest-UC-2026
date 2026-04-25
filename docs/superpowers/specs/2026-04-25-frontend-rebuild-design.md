# Frontend Rebuild — Hybrid Access, Mock Auth, PiP Monitoring

**Date:** 2026-04-25
**Status:** Approved (awaiting spec review)
**Scope:** Frontend (`/frontend`) — landing page rebuild, new module/learning routes, mock auth layer, PiP monitoring widget, design system reset.

## 1. Goals

1. User dapat menavigasi langsung ke modul belajar dari landing page tanpa harus masuk dashboard dulu (hybrid public access).
2. Saat sesi belajar aktif, monitoring kamera otomatis muncul sebagai PiP (Picture-in-Picture) floating sehingga ekspresi anak terlihat selama belajar.
3. Login/register mendukung email+password dan Gmail (Google OAuth-style button), implementasi mock UI-only yang struktur-nya siap di-swap dengan Supabase.
4. Visual minimalis: putih + soft blue, font LMS-friendly, hover/parallax/icon-mix interaktif tanpa berlebihan (tidak ada warna ekstrem, tidak ada emoji-vibes).

## 2. Non-Goals

- Real authentication backend (Supabase integration is a follow-up, not in this scope).
- Real module content (placeholder/dummy content sufficient for demo).
- Mobile-first redesign (responsive, but desktop is primary target).
- Internationalization (Bahasa Indonesia only).
- Analytics, telemetry, accessibility audit beyond semantic HTML.

## 3. Routes & Access Model

Hybrid: public preview + login-gated learning sessions.

```
PUBLIC (no auth):
  /                  Landing page (rebuilt)
  /modules           Catalog (browse modules with filter)
  /modules/[id]      Module detail/preview + "Mulai Belajar" CTA

AUTH-GATED (redirect to login if not authed):
  /learn/[id]        Active learning session — PiP monitoring auto-spawns
  /dashboard         User home (progress, modul aktif, riwayat fokus)
  /dashboard/monitoring   Standalone monitoring/history view
```

**Access transition:** clicking "Mulai Belajar" in a public route triggers `AuthModal` if not authed. After successful login, user is redirected to `/learn/[id]` (deep link preserved).

## 4. Components & Data Flow

### 4.1 Auth Layer (Mock, Supabase-ready)

`app/context/AuthContext.tsx` exports `useAuth()` hook with interface deliberately matching Supabase Auth so future migration is implementation-swap only:

```ts
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}
```

Mock implementation (`lib/auth/mockAuth.ts`):
- `signIn` validates email format + password ≥ 6 chars → stores `{ id, email, name, avatar }` in `localStorage` under key `visea_auth_user`.
- `signUp` registers new user (also localStorage-backed; checks email uniqueness against same store).
- `signInWithGoogle` returns a fixed demo user `{ email: 'demo@google.com', name: 'Demo User', avatar: <google-avatar-url> }` after a 600ms simulated delay.
- `signOut` clears localStorage key.

`AuthProvider` mounts at root layout, hydrates from localStorage on mount, exposes loading state until hydration done.

### 4.2 AuthModal (`components/auth/AuthModal.tsx`)

Single modal component with Login/Daftar tabs (animated underline indicator):
- Form fields: email, password (Daftar adds: nama, confirm password).
- Inline validation (Zod schema, error per field below input).
- "Lanjutkan dengan Google" button at top, divider "atau", then form.
- Submit → `useAuth().signIn|signUp` → on success close modal & redirect to `redirectTo` prop (default `/dashboard`).
- Close on Esc, backdrop click, or X button.

Triggered globally via `useAuthModal()` from `AuthModalContext` — any component can call `openAuthModal({ mode, redirectTo })`.

### 4.3 PiP Monitoring (`components/monitoring/PiPMonitor.tsx`)

Floating draggable widget, default 280×210px bottom-right (24px margin):
- Inner: webcam `<video>` element + small chip overlay showing focus level (high/medium/low).
- Controls: drag handle (full top bar), minimize button (collapses to 56×56 circle showing only focus dot), close button.
- Position persisted in localStorage (`visea_pip_position`).
- Renders via React Portal to `document.body` so it floats above page content.
- Visibility controlled by `PiPContext` — `usePiP()` exposes `{ isOpen, open, close, minimize }`.

Auto-behavior:
- `/learn/[id]` page calls `usePiP().open()` in `useEffect` on mount, `close()` on unmount.
- Webcam stream lifecycle managed by existing `BiometricContext` (no duplication).

### 4.4 Landing Page Sections (`app/(public)/page.tsx`)

Top-to-bottom:
1. **Navbar** (sticky, glassmorphic) — logo, anchor links (Modul, Cara Kerja, Tentang), Masuk / Daftar buttons.
2. **Hero** — h1 + subhead + dual CTA ("Lihat Modul" → `/modules`, "Daftar Gratis" → opens AuthModal). Soft-blue gradient blob in background tracks mouse with damped parallax.
3. **Modul Pilihan** — grid of 4 module preview cards (image, title, level chip, durasi). Each card links to `/modules/[id]`. Hover: lift -4px + shadow expand + scale 1.01.
4. **Cara Kerja** — 3-step row (icon + heading + 1-line description). Icons mix Lucide (line) and Phosphor duotone (accent on number badge). Stagger fade-in on scroll (Framer Motion `whileInView`).
5. **Final CTA** — soft-blue card (`bg-blue-50`), centered headline, single primary CTA button.
6. **Footer** — minimalist: logo, copyright, 3 link columns.

Removed from existing page: dark slate-900 "Dampak" section, all extreme color washes, indigo/teal/emerald color tokens (replaced with single blue scale).

### 4.5 Module Pages

`/modules` — Header + filter bar (kategori: Bahasa, Matematika, Komunikasi, Motorik) + responsive grid. Module data source: `lib/modules/data.ts` (mock array of 8-12 modules).

`/modules/[id]` — Two-column layout: thumbnail/illustration left, metadata + description + "Mulai Belajar" CTA right. Below: list of objectives/steps. CTA triggers auth check → AuthModal or redirect to `/learn/[id]`.

`/learn/[id]` — Full-bleed layout (no main navbar):
- Top bar: back button, module title, progress bar (`current step / total`).
- Content area: renders module step (slides/text/image — keep simple for mock).
- Bottom bar: prev / next step buttons.
- PiP auto-spawned (see 4.3).

### 4.6 Dashboard (`/dashboard`)

Authed-only. Sidebar reused from existing `Sidebar.tsx` (refactored to new design tokens). Sections:
- Greeting ("Halo, {name}").
- "Lanjutkan Belajar" — last accessed module card.
- "Statistik Fokus 7 Hari" — placeholder chart (no real data; static mock).
- "Modul Direkomendasikan" — 3 cards.

`/dashboard/monitoring` — Standalone monitoring view (full-screen webcam + indicator, no PiP overlay).

## 5. Design System

### 5.1 Color tokens (replace existing)

```
Surface:   #FFFFFF (primary), #F8FAFC (muted)
Border:    #E2E8F0
Text:      #0F172A (primary), #64748B (muted)

Brand (single blue scale, no indigo/teal/emerald in primary palette):
  blue-50:  #EFF6FF
  blue-100: #DBEAFE
  blue-200: #BFDBFE
  blue-500: #3B82F6
  blue-600: #2563EB  ← primary CTA
  blue-700: #1D4ED8

Accent (hover/highlight ONLY, not for blocks):
  indigo-500: #6366F1

Semantic:
  focus-high:   #22C55E (used only in monitoring chip)
  focus-medium: #F59E0B
  focus-low:    #EF4444
```

### 5.2 Typography

- **Display** (h1-h3, hero): `Plus Jakarta Sans` 600/700, tracking `-0.02em`.
- **Body** (p, small): `Inter` 400/500, line-height 1.6.
- Loaded via `next/font/google`, applied through `<html>` className with CSS variables `--font-display`, `--font-body`.

### 5.3 Effects & Interactions

- **Card hover:** `translateY(-4px)`, shadow `0 8px 24px rgba(37, 99, 235, 0.08)`, scale 1.01, transition 250ms ease.
- **Button hover:** background shift + subtle shadow, no scale.
- **Hero parallax:** background blob position = mouse offset / 30 (damped via `requestAnimationFrame`).
- **Page transitions:** Framer Motion `AnimatePresence` with fade+slide-up 200ms between routes (where applicable).
- **Scroll-in:** `whileInView` fade + translateY 20→0, once: true, stagger 80ms for grids.
- **Icon mixing:** Lucide React for nav/actions/UI (line style); Phosphor duotone (`@phosphor-icons/react`) for hero/feature accents only — never both styles on the same element.

### 5.4 Component primitives (`components/ui/`)

Stateless presentational primitives consumed by features:
- `Button` (variant: primary | secondary | ghost; size: sm | md | lg).
- `Card` (variant: default | interactive — interactive adds hover effects).
- `Input` (with label + error slot).
- `Tabs` (controlled, animated underline).
- `Modal` (portal + backdrop + Esc/click handlers).

## 6. File Structure

```
frontend/
  app/
    (public)/
      layout.tsx           # public navbar wrapper
      page.tsx             # rebuilt landing
      modules/
        page.tsx
        [id]/page.tsx
    (authed)/
      layout.tsx           # auth guard (redirects if no user); no shell chrome here
      learn/
        layout.tsx         # full-bleed layout, no sidebar
        [id]/page.tsx
      dashboard/
        layout.tsx         # sidebar + main content layout
        page.tsx
        monitoring/page.tsx
    layout.tsx             # root: providers, fonts
    globals.css            # design tokens
  components/
    auth/AuthModal.tsx
    monitoring/PiPMonitor.tsx
    landing/{Navbar,Hero,ModulePreview,HowItWorks,FinalCTA,Footer}.tsx
    modules/{ModuleCard,ModuleFilter,ModuleDetail}.tsx
    learn/{LearnTopBar,LearnContent,LearnNav}.tsx
    dashboard/{DashboardSidebar,DashboardHome}.tsx
    ui/{Button,Card,Input,Tabs,Modal}.tsx
  context/
    AuthContext.tsx
    AuthModalContext.tsx
    PiPContext.tsx
    BiometricContext.tsx   # existing, kept
  lib/
    auth/mockAuth.ts
    modules/data.ts
    utils/cn.ts            # className merge helper
  types/
    auth.ts
    module.ts
    biometric.ts           # existing
```

Note: existing `app/components/` and `app/context/` directories are moved up to `frontend/components/` and `frontend/context/` (cleaner Next.js 16 convention; tsconfig path `@/*` maps to `./*`).

## 7. Migration / Cleanup

Existing files affected:
- `app/page.tsx` — fully rewritten as landing using new sections.
- `app/dashboard/page.tsx` — moved to `app/(authed)/dashboard/page.tsx`, refactored.
- `app/components/layout/Sidebar.tsx` → `components/dashboard/DashboardSidebar.tsx`, restyled.
- `app/components/layout/DashboardShell.tsx` — replaced by `(authed)/layout.tsx`.
- `app/context/BiometricContext.tsx` → `context/BiometricContext.tsx`.
- `app/types/biometric.ts` → `types/biometric.ts`.
- `tsconfig.json` paths: revert `@/*` from `./app/*` back to `./*` since `components/`, `context/`, `lib/`, `types/` will live at the frontend root (sibling to `app/`), not inside it.
- `app/globals.css` — token block rewritten per §5.1.

## 8. Error Handling

- Auth: form errors shown inline (Zod field errors); network/unknown errors shown as toast at top of modal. Mock auth never throws non-validation errors.
- Module not found (`/modules/[id]` invalid id): render 404 component with "Kembali ke katalog" CTA.
- Webcam permission denied in PiP: PiP renders placeholder + "Izinkan kamera" button that re-requests permission.
- Auth required for `/learn/*` and `/dashboard/*`: `(authed)/layout.tsx` checks `useAuth().user` — if null and not loading, redirect to `/` and open AuthModal with `redirectTo` set to current path.

## 9. Testing Strategy

- Manual smoke: visit each route, exercise auth flow (login/register/google/logout), enter `/learn/[id]` and verify PiP spawns + closes on exit.
- Type check: `npx tsc --noEmit` must pass with zero errors.
- Build: `npm run build` must succeed.
- No automated unit/integration tests in this scope (UI-mock; tests come with Supabase integration).

## 10. Open Questions

None at design time. Implementation may surface choices around:
- Specific Plus Jakarta Sans / Inter weight subset to load (decide during implementation to keep bundle small).
- Phosphor icons package size impact — fallback to Lucide-only if bundle grows materially.

These are implementation-detail decisions, not design changes.
