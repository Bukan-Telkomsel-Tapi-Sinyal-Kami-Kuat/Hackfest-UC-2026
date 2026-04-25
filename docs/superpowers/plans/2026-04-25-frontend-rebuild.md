# Frontend Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the frontend with a hybrid public/authed access model, mock auth (Supabase-ready), PiP monitoring during learning sessions, and a minimalist white + soft-blue design system.

**Architecture:** Next.js 16 App Router with route groups `(public)` and `(authed)`. Auth state in React Context with mock localStorage backend; provider interface mirrors Supabase Auth so future migration is implementation-swap only. PiP monitoring is a portal-rendered floating widget controlled by global `PiPContext`, auto-spawned by `/learn/[id]`.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript, Tailwind 4 + custom CSS tokens, Framer Motion (page/stagger animations), Lucide React + Phosphor Icons (icon mix), Zod (form validation), `clsx` + `tailwind-merge` (className utility).

**Spec:** `docs/superpowers/specs/2026-04-25-frontend-rebuild-design.md`

**Test approach:** Per spec §9, no automated unit tests in this scope. Verification per task = `npx tsc --noEmit` passes + visual sanity in browser. Final task runs full `npm run build`.

---

## Phase 1 — Foundation

### Task 1: Install new dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install runtime + dev dependencies**

Run:
```bash
cd frontend && npm install framer-motion @phosphor-icons/react zod clsx tailwind-merge
```

Expected: dependencies added to `package.json`.

- [ ] **Step 2: Verify install**

Run:
```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors (existing tsconfig should still be valid).

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "deps: add framer-motion, phosphor-icons, zod, clsx, tailwind-merge"
```

---

### Task 2: Migrate folder structure (move out of `app/`)

**Goal:** Per spec §6/§7, move `components/`, `context/`, `types/` out of `app/` to `frontend/` root so route groups can be added cleanly.

**Files:**
- Move: `frontend/app/components/` → `frontend/components/`
- Move: `frontend/app/context/` → `frontend/context/`
- Move: `frontend/app/types/` → `frontend/types/`
- Modify: `frontend/tsconfig.json`
- Delete: `frontend/app/components/`, `frontend/app/context/`, `frontend/app/types/` (after move)

- [ ] **Step 1: Move folders**

Run:
```bash
cd frontend && \
  mv app/components components && \
  mv app/context context && \
  mv app/types types
```

- [ ] **Step 2: Revert tsconfig path alias**

Edit `frontend/tsconfig.json` — replace `"@/*": ["./app/*"]` with `"@/*": ["./*"]`:

```json
"paths": {
  "@/*": ["./*"]
}
```

- [ ] **Step 3: Type-check**

Run:
```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors. Existing imports like `@/components/layout/Sidebar` and `@/types/biometric` resolve to the new top-level paths.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(frontend): move components/context/types to root, restore @/* alias"
```

---

### Task 3: Replace globals.css with new design tokens

**Files:**
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Rewrite globals.css**

Replace the entire file content with:

```css
@import "tailwindcss";

@theme {
  --color-surface:        #FFFFFF;
  --color-surface-muted:  #F8FAFC;
  --color-border:         #E2E8F0;
  --color-text-primary:   #0F172A;
  --color-text-muted:     #64748B;
  --color-text-subtle:    #94A3B8;

  --color-blue-50:  #EFF6FF;
  --color-blue-100: #DBEAFE;
  --color-blue-200: #BFDBFE;
  --color-blue-300: #93C5FD;
  --color-blue-400: #60A5FA;
  --color-blue-500: #3B82F6;
  --color-blue-600: #2563EB;
  --color-blue-700: #1D4ED8;
  --color-blue-800: #1E40AF;

  --color-indigo-500: #6366F1;

  --color-focus-high:   #22C55E;
  --color-focus-medium: #F59E0B;
  --color-focus-low:    #EF4444;

  --font-display: var(--font-jakarta), "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body:    var(--font-inter), "Inter", system-ui, sans-serif;

  --radius-sm:   0.5rem;
  --radius-md:   0.75rem;
  --radius-lg:   1rem;
  --radius-xl:   1.5rem;
  --radius-pill: 9999px;

  --shadow-sm:    0 1px 2px 0 rgb(15 23 42 / 0.04);
  --shadow-md:    0 4px 12px 0 rgb(15 23 42 / 0.06);
  --shadow-lg:    0 8px 24px 0 rgb(37 99 235 / 0.08);
  --shadow-focus: 0 0 0 3px rgb(37 99 235 / 0.18);

  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

::-webkit-scrollbar        { width: 8px; height: 8px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: #CBD5E1; border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up { animation: fade-in-up 250ms ease both; }
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/globals.css
git commit -m "feat(design): reset CSS tokens to soft-blue palette + LMS typography"
```

---

### Task 4: Update root layout with fonts + providers placeholder

**Files:**
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VISEA — Belajar Adaptif untuk Anak Berkebutuhan Khusus",
  description:
    "Platform pendidikan inklusif berbasis Computer Vision dan AI untuk mendampingi orang tua mengajar anak di rumah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Type-check + dev smoke**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/layout.tsx
git commit -m "feat(layout): load Plus Jakarta Sans + Inter via next/font"
```

---

## Phase 2 — UI Primitives

### Task 5: Create `cn()` className utility

**Files:**
- Create: `frontend/lib/utils/cn.ts`

- [ ] **Step 1: Write file**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/utils/cn.ts
git commit -m "feat(ui): add cn() className utility"
```

---

### Task 6: Create UI primitives — Button, Card, Input, Tabs, Modal

**Files:**
- Create: `frontend/components/ui/Button.tsx`
- Create: `frontend/components/ui/Card.tsx`
- Create: `frontend/components/ui/Input.tsx`
- Create: `frontend/components/ui/Tabs.tsx`
- Create: `frontend/components/ui/Modal.tsx`

- [ ] **Step 1: `Button.tsx`**

```tsx
"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-blue-600)] text-white hover:bg-[var(--color-blue-700)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
  secondary:
    "bg-[var(--color-blue-50)] text-[var(--color-blue-700)] hover:bg-[var(--color-blue-100)]",
  ghost:
    "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]",
  outline:
    "bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-blue-400)] hover:text-[var(--color-blue-700)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, disabled, children, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  )
);
Button.displayName = "Button";
```

- [ ] **Step 2: `Card.tsx`**

```tsx
"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]",
        interactive &&
          "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-blue-200)] cursor-pointer",
        className
      )}
      {...rest}
    />
  )
);
Card.displayName = "Card";
```

- [ ] **Step 3: `Input.tsx`**

```tsx
"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-[var(--radius-md)] border bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)] transition-all duration-150 focus:outline-none focus:shadow-[var(--shadow-focus)]",
            error
              ? "border-[var(--color-focus-low)]"
              : "border-[var(--color-border)] focus:border-[var(--color-blue-500)]",
            className
          )}
          {...rest}
        />
        {error && <span className="text-xs text-[var(--color-focus-low)]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
```

- [ ] **Step 4: `Tabs.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      className={cn(
        "relative inline-flex p-1 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)]",
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative z-10 px-5 h-9 text-sm font-semibold rounded-full transition-colors duration-200",
              active ? "text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {active && (
              <motion.span
                layoutId="tabs-indicator"
                className="absolute inset-0 -z-10 bg-[var(--color-blue-600)] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: `Modal.tsx`**

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-md rounded-[var(--radius-xl)] bg-white shadow-2xl overflow-hidden",
              className
            )}
          >
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="absolute top-4 right-4 grid place-items-center w-9 h-9 rounded-full bg-[var(--color-surface-muted)] hover:bg-[var(--color-blue-50)] text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

- [ ] **Step 6: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/ui/
git commit -m "feat(ui): add Button, Card, Input, Tabs, Modal primitives"
```

---

## Phase 3 — Auth Layer

### Task 7: Define auth types

**Files:**
- Create: `frontend/types/auth.ts`

- [ ] **Step 1: Write file**

```ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: number;
}

export interface AuthError {
  message: string;
  code?: "invalid_credentials" | "email_in_use" | "validation" | "unknown";
}

export interface AuthResult {
  error: AuthError | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/types/auth.ts
git commit -m "feat(auth): define User, AuthError, AuthResult types"
```

---

### Task 8: Create mock auth implementation

**Files:**
- Create: `frontend/lib/auth/mockAuth.ts`

- [ ] **Step 1: Write file**

```ts
import type { AuthResult, User } from "@/types/auth";

const USER_KEY = "visea_auth_user";
const REGISTRY_KEY = "visea_auth_registry";

interface RegistryEntry {
  user: User;
  password: string;
}

function readRegistry(): Record<string, RegistryEntry> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeRegistry(reg: Record<string, RegistryEntry>) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
}

function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockSignIn(email: string, password: string): Promise<AuthResult> {
  await delay(400);
  const reg = readRegistry();
  const entry = reg[email.toLowerCase()];
  if (!entry || entry.password !== password) {
    return { error: { code: "invalid_credentials", message: "Email atau kata sandi salah." } };
  }
  setCurrentUser(entry.user);
  return { error: null };
}

export async function mockSignUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  await delay(500);
  const reg = readRegistry();
  const key = email.toLowerCase();
  if (reg[key]) {
    return { error: { code: "email_in_use", message: "Email sudah terdaftar." } };
  }
  const user: User = {
    id: `u_${Date.now()}`,
    email,
    name,
    createdAt: Date.now(),
  };
  reg[key] = { user, password };
  writeRegistry(reg);
  setCurrentUser(user);
  return { error: null };
}

export async function mockSignInWithGoogle(): Promise<AuthResult> {
  await delay(600);
  const user: User = {
    id: "u_google_demo",
    email: "demo@google.com",
    name: "Demo User",
    avatar: "https://lh3.googleusercontent.com/a/default-user=s64",
    createdAt: Date.now(),
  };
  setCurrentUser(user);
  return { error: null };
}

export async function mockSignOut(): Promise<void> {
  await delay(150);
  setCurrentUser(null);
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/auth/mockAuth.ts
git commit -m "feat(auth): mock auth backend with localStorage registry"
```

---

### Task 9: Create AuthContext

**Files:**
- Create: `frontend/context/AuthContext.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthResult, User } from "@/types/auth";
import {
  getCurrentUser,
  mockSignIn,
  mockSignInWithGoogle,
  mockSignOut,
  mockSignUp,
} from "@/lib/auth/mockAuth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await mockSignIn(email, password);
    if (!res.error) setUser(getCurrentUser());
    return res;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const res = await mockSignUp(email, password, name);
    if (!res.error) setUser(getCurrentUser());
    return res;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const res = await mockSignInWithGoogle();
    if (!res.error) setUser(getCurrentUser());
    return res;
  }, []);

  const signOut = useCallback(async () => {
    await mockSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/context/AuthContext.tsx
git commit -m "feat(auth): AuthProvider + useAuth hook"
```

---

### Task 10: Create AuthModalContext

**Files:**
- Create: `frontend/context/AuthModalContext.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type AuthMode = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  redirectTo?: string;
}

interface AuthModalContextValue extends AuthModalState {
  openAuthModal: (opts?: { mode?: AuthMode; redirectTo?: string }) => void;
  closeAuthModal: () => void;
  setMode: (m: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthModalState>({ isOpen: false, mode: "login" });

  const openAuthModal: AuthModalContextValue["openAuthModal"] = useCallback((opts) => {
    setState({ isOpen: true, mode: opts?.mode ?? "login", redirectTo: opts?.redirectTo });
  }, []);

  const closeAuthModal = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const setMode = useCallback((m: AuthMode) => {
    setState((s) => ({ ...s, mode: m }));
  }, []);

  return (
    <AuthModalContext.Provider value={{ ...state, openAuthModal, closeAuthModal, setMode }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside <AuthModalProvider>");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/context/AuthModalContext.tsx
git commit -m "feat(auth): AuthModalProvider for global modal control"
```

---

### Task 11: Create AuthModal component

**Files:**
- Create: `frontend/components/auth/AuthModal.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Minimal 6 karakter."),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nama minimal 2 karakter."),
});

export function AuthModal() {
  const { isOpen, mode, redirectTo, closeAuthModal, setMode } = useAuthModal();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setSubmitError(null);
  }

  function handleClose() {
    reset();
    closeAuthModal();
  }

  function postSuccess() {
    reset();
    closeAuthModal();
    if (redirectTo) router.push(redirectTo);
    else router.push("/dashboard");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const schema = mode === "login" ? loginSchema : registerSchema;
    const data = mode === "login" ? { email, password } : { email, password, name };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const res =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, name);
    setSubmitting(false);
    if (res.error) {
      setSubmitError(res.error.message);
      return;
    }
    postSuccess();
  }

  async function onGoogle() {
    setSubmitError(null);
    setSubmitting(true);
    const res = await signInWithGoogle();
    setSubmitting(false);
    if (res.error) {
      setSubmitError(res.error.message);
      return;
    }
    postSuccess();
  }

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="p-8">
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-[var(--color-blue-600)] text-white font-extrabold text-xl mb-5">
          V
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
          {mode === "login" ? "Masuk ke VISEA" : "Buat Akun Baru"}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {mode === "login"
            ? "Lanjutkan sesi belajar anak Anda."
            : "Mulai pendidikan adaptif untuk anak Anda."}
        </p>

        <div className="mb-6">
          <Tabs
            tabs={[
              { value: "login", label: "Masuk" },
              { value: "register", label: "Daftar" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setErrors({});
              setSubmitError(null);
            }}
          />
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={onGoogle}
          disabled={submitting}
          className="w-full mb-4"
        >
          <GoogleIcon />
          Lanjutkan dengan Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-subtle)] font-medium">ATAU</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <Input
              label="Nama"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Kata sandi"
            type="password"
            placeholder="Min. 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {submitError && (
            <div className="text-sm text-[var(--color-focus-low)] bg-red-50 rounded-lg px-3 py-2">
              {submitError}
            </div>
          )}
          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full mt-2">
            {mode === "login" ? "Masuk" : "Daftar Sekarang"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/auth/AuthModal.tsx
git commit -m "feat(auth): AuthModal with email/password + Google OAuth (mock)"
```

---

## Phase 4 — Module Data

### Task 12: Define module types and mock data

**Files:**
- Create: `frontend/types/module.ts`
- Create: `frontend/lib/modules/data.ts`

- [ ] **Step 1: `types/module.ts`**

```ts
export type ModuleCategory = "bahasa" | "matematika" | "komunikasi" | "motorik";
export type ModuleLevel = "Dasar" | "Menengah" | "Lanjutan";

export interface ModuleStep {
  title: string;
  body: string;
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  category: ModuleCategory;
  level: ModuleLevel;
  duration: string;
  cover: string;
  summary: string;
  objectives: string[];
  steps: ModuleStep[];
}
```

- [ ] **Step 2: `lib/modules/data.ts`**

```ts
import type { LearningModule, ModuleCategory } from "@/types/module";

export const CATEGORIES: { value: ModuleCategory; label: string }[] = [
  { value: "bahasa", label: "Bahasa" },
  { value: "matematika", label: "Matematika" },
  { value: "komunikasi", label: "Komunikasi" },
  { value: "motorik", label: "Motorik" },
];

export const MODULES: LearningModule[] = [
  {
    id: "m01",
    slug: "mengenal-huruf",
    title: "Mengenal Huruf A-Z",
    category: "bahasa",
    level: "Dasar",
    duration: "10 menit",
    cover: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    summary: "Belajar mengenali bentuk dan bunyi huruf melalui gambar interaktif.",
    objectives: [
      "Mengidentifikasi 26 huruf alfabet",
      "Mengaitkan huruf dengan bunyi awal kata",
      "Meningkatkan fokus visual selama 10 menit",
    ],
    steps: [
      { title: "Sapaan Pembuka", body: "Halo! Hari ini kita akan belajar huruf. Siap?" },
      { title: "Huruf A", body: "A seperti Apel. Coba ucapkan: A — A — Apel." },
      { title: "Huruf B", body: "B seperti Bola. Coba ucapkan: B — B — Bola." },
      { title: "Latihan", body: "Tunjuk huruf A pada gambar di layar." },
    ],
  },
  {
    id: "m02",
    slug: "berhitung-1-10",
    title: "Berhitung 1 sampai 10",
    category: "matematika",
    level: "Dasar",
    duration: "12 menit",
    cover: "linear-gradient(135deg,#EFF6FF,#93C5FD)",
    summary: "Mengenalkan konsep angka 1-10 dengan visual blok dan jari.",
    objectives: ["Menyebut angka 1-10 berurutan", "Menghitung benda kecil"],
    steps: [
      { title: "Angka 1", body: "Satu jari. Tunjukkan satu jari ke kamera." },
      { title: "Angka 2", body: "Dua bola. Hitung bersama: 1, 2." },
    ],
  },
  {
    id: "m03",
    slug: "ekspresi-wajah",
    title: "Mengenal Ekspresi Wajah",
    category: "komunikasi",
    level: "Menengah",
    duration: "15 menit",
    cover: "linear-gradient(135deg,#DBEAFE,#EFF6FF)",
    summary: "Mengenali ekspresi senang, sedih, dan marah pada gambar.",
    objectives: ["Mengenali 3 ekspresi dasar", "Menamai emosi sederhana"],
    steps: [
      { title: "Senang", body: "Wajah ini tersenyum. Dia sedang senang." },
      { title: "Sedih", body: "Wajah ini turun. Dia sedang sedih." },
    ],
  },
  {
    id: "m04",
    slug: "motorik-halus-jari",
    title: "Latihan Motorik Halus Jari",
    category: "motorik",
    level: "Dasar",
    duration: "8 menit",
    cover: "linear-gradient(135deg,#BFDBFE,#DBEAFE)",
    summary: "Gerakan jari mengikuti petunjuk visual untuk koordinasi mata-tangan.",
    objectives: ["Menggerakkan jari sesuai pola", "Meningkatkan koordinasi"],
    steps: [
      { title: "Buka tutup", body: "Buka telapak tangan, lalu kepalkan." },
      { title: "Hitung jari", body: "Tunjuk satu jari, dua jari, tiga jari." },
    ],
  },
  {
    id: "m05",
    slug: "warna-dasar",
    title: "Mengenal Warna Dasar",
    category: "bahasa",
    level: "Dasar",
    duration: "10 menit",
    cover: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
    summary: "Mengenal warna merah, biru, kuning, hijau melalui gambar.",
    objectives: ["Menyebut 4 warna dasar"],
    steps: [{ title: "Merah", body: "Apel berwarna merah." }],
  },
  {
    id: "m06",
    slug: "menyusun-kalimat",
    title: "Menyusun Kalimat Sederhana",
    category: "bahasa",
    level: "Menengah",
    duration: "14 menit",
    cover: "linear-gradient(135deg,#BFDBFE,#93C5FD)",
    summary: "Latihan menyusun subjek-predikat dari kata acak.",
    objectives: ["Memahami pola S-P-O sederhana"],
    steps: [{ title: "Subjek", body: "Siapa yang melakukan? Kucing. Tikus. Anak." }],
  },
  {
    id: "m07",
    slug: "salam-perkenalan",
    title: "Salam dan Perkenalan",
    category: "komunikasi",
    level: "Dasar",
    duration: "8 menit",
    cover: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    summary: "Latihan menyapa dan memperkenalkan diri.",
    objectives: ["Mengucapkan salam", "Menyebut nama sendiri"],
    steps: [{ title: "Halo", body: "Coba sapa: Halo, nama saya..." }],
  },
  {
    id: "m08",
    slug: "menggambar-bentuk",
    title: "Menggambar Bentuk Dasar",
    category: "motorik",
    level: "Menengah",
    duration: "12 menit",
    cover: "linear-gradient(135deg,#EFF6FF,#BFDBFE)",
    summary: "Mengikuti pola lingkaran, kotak, dan segitiga di udara.",
    objectives: ["Menggerakkan tangan mengikuti pola"],
    steps: [{ title: "Lingkaran", body: "Putar tangan membentuk lingkaran." }],
  },
];

export function getModuleBySlug(slug: string): LearningModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getModulesByCategory(cat: ModuleCategory | "all"): LearningModule[] {
  return cat === "all" ? MODULES : MODULES.filter((m) => m.category === cat);
}
```

- [ ] **Step 3: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/types/module.ts frontend/lib/modules/data.ts
git commit -m "feat(modules): add module types + 8 mock modules"
```

---

## Phase 5 — PiP Monitoring Layer

### Task 13: Create PiPContext

**Files:**
- Create: `frontend/context/PiPContext.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface PiPContextValue {
  isOpen: boolean;
  isMinimized: boolean;
  open: () => void;
  close: () => void;
  toggleMinimize: () => void;
}

const PiPContext = createContext<PiPContextValue | null>(null);

export function PiPProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleMinimize = useCallback(() => setIsMinimized((m) => !m), []);

  return (
    <PiPContext.Provider value={{ isOpen, isMinimized, open, close, toggleMinimize }}>
      {children}
    </PiPContext.Provider>
  );
}

export function usePiP() {
  const ctx = useContext(PiPContext);
  if (!ctx) throw new Error("usePiP must be used inside <PiPProvider>");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/context/PiPContext.tsx
git commit -m "feat(pip): PiPProvider for global PiP state"
```

---

### Task 14: Create PiPMonitor component

**Files:**
- Create: `frontend/components/monitoring/PiPMonitor.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, X, Maximize2, Camera } from "lucide-react";
import { usePiP } from "@/context/PiPContext";
import { useBiometric } from "@/context/BiometricContext";
import { cn } from "@/lib/utils/cn";

const POSITION_KEY = "visea_pip_position";

interface Position {
  x: number;
  y: number;
}

function loadPosition(): Position {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return { x: 24, y: 24 };
    return JSON.parse(raw);
  } catch {
    return { x: 24, y: 24 };
  }
}

export function PiPMonitor() {
  const { isOpen, isMinimized, close, toggleMinimize } = usePiP();
  const { biometric } = useBiometric();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [pos, setPos] = useState<Position>(() => loadPosition());

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (!cancelled) setPermissionDenied(true);
      }
    }
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (typeof document === "undefined" || !isOpen) return null;

  const focusColor =
    biometric.focusLevel === "high"
      ? "var(--color-focus-high)"
      : biometric.focusLevel === "medium"
      ? "var(--color-focus-medium)"
      : biometric.focusLevel === "low"
      ? "var(--color-focus-low)"
      : "#94A3B8";

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="pip"
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={(_, info) => {
          const next = { x: pos.x - info.offset.x, y: pos.y - info.offset.y };
          setPos(next);
          localStorage.setItem(POSITION_KEY, JSON.stringify(next));
        }}
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ right: pos.x, bottom: pos.y }}
        className="fixed z-40 select-none"
      >
        {isMinimized ? (
          <button
            onClick={toggleMinimize}
            aria-label="Expand monitoring"
            className="grid place-items-center w-14 h-14 rounded-full bg-white shadow-[var(--shadow-lg)] border border-[var(--color-border)] hover:scale-105 transition-transform"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: focusColor, boxShadow: `0 0 12px ${focusColor}` }}
            />
          </button>
        ) : (
          <div
            className={cn(
              "w-[280px] rounded-[var(--radius-lg)] bg-slate-900 shadow-[var(--shadow-lg)] overflow-hidden border border-slate-800"
            )}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Camera className="w-3.5 h-3.5" />
                Monitoring
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMinimize}
                  className="grid place-items-center w-6 h-6 rounded-md hover:bg-white/10 text-white/80"
                  aria-label="Minimize"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={close}
                  className="grid place-items-center w-6 h-6 rounded-md hover:bg-white/10 text-white/80"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="relative aspect-[4/3] bg-black">
              {permissionDenied ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 text-xs p-3 text-center">
                  <Maximize2 className="w-5 h-5" />
                  Izin kamera ditolak.
                  <button
                    onClick={() => {
                      setPermissionDenied(false);
                    }}
                    className="text-[var(--color-blue-300)] underline mt-1"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <div
                className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "rgba(15,23,42,0.6)",
                  color: focusColor,
                  border: `1px solid ${focusColor}`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: focusColor }}
                />
                Fokus {biometric.focusLevel}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/monitoring/PiPMonitor.tsx
git commit -m "feat(pip): PiPMonitor draggable webcam widget with focus indicator"
```

---

### Task 15: Mount providers + PiPMonitor in root layout

**Files:**
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { PiPProvider } from "@/context/PiPContext";
import { BiometricProvider } from "@/context/BiometricContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { PiPMonitor } from "@/components/monitoring/PiPMonitor";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VISEA — Belajar Adaptif untuk Anak Berkebutuhan Khusus",
  description:
    "Platform pendidikan inklusif berbasis Computer Vision dan AI untuk mendampingi orang tua mengajar anak di rumah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <AuthModalProvider>
            <BiometricProvider>
              <PiPProvider>
                {children}
                <AuthModal />
                <PiPMonitor />
              </PiPProvider>
            </BiometricProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/layout.tsx
git commit -m "feat(layout): mount Auth/PiP/Biometric providers in root"
```

---

## Phase 6 — Public Routes (Landing + Modules)

### Task 16: Public layout + Navbar

**Files:**
- Create: `frontend/app/(public)/layout.tsx`
- Create: `frontend/components/landing/Navbar.tsx`

- [ ] **Step 1: `components/landing/Navbar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  return (
    <nav className="fixed top-0 inset-x-0 z-30 bg-white/75 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-blue-600)] text-white font-extrabold">
            V
          </div>
          <span className="font-bold text-lg tracking-tight">VISEA</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--color-text-muted)]">
          <Link href="/modules" className="hover:text-[var(--color-blue-700)] transition-colors">Modul</Link>
          <a href="#cara-kerja" className="hover:text-[var(--color-blue-700)] transition-colors">Cara Kerja</a>
          <a href="#tentang" className="hover:text-[var(--color-blue-700)] transition-colors">Tentang</a>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuthModal({ mode: "login" })}>
                Masuk
              </Button>
              <Button variant="primary" size="sm" onClick={() => openAuthModal({ mode: "register" })}>
                Daftar
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: `app/(public)/layout.tsx`**

```tsx
import { Navbar } from "@/components/landing/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
    </>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/components/landing/Navbar.tsx frontend/app/\(public\)/layout.tsx
git commit -m "feat(public): public layout + Navbar with auth-aware buttons"
```

---

### Task 17: Landing page sections — Hero with parallax

**Files:**
- Create: `frontend/components/landing/Hero.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "@/context/AuthModalContext";

export function Hero() {
  const blobRef = useRef<HTMLDivElement>(null);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    let raf = 0;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    function onMove(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      target = { x: (e.clientX - cx) / 30, y: (e.clientY - cy) / 30 };
    }

    function tick() {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 overflow-hidden">
      <div
        ref={blobRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-70 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--color-blue-200), transparent 60%), radial-gradient(circle at 70% 70%, var(--color-blue-100), transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-3xl text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-blue-50)] text-[var(--color-blue-700)] text-xs font-semibold mb-6">
          <Sparkle size={14} weight="duotone" />
          Pendidikan Inklusif Berbasis AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] leading-[1.1] mb-6">
          Belajar adaptif,
          <br />
          <span className="text-[var(--color-blue-600)]">untuk setiap anak.</span>
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto mb-10">
          VISEA membantu orang tua mendampingi anak berkebutuhan khusus dengan modul belajar yang
          menyesuaikan ekspresi dan fokus anak secara real-time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/modules">
            <Button variant="primary" size="lg">
              Lihat Modul
              <ArrowRight size={16} weight="bold" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => openAuthModal({ mode: "register" })}>
            Daftar Gratis
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/landing/Hero.tsx
git commit -m "feat(landing): Hero section with damped mouse parallax"
```

---

### Task 18: Landing page — ModulePreview, HowItWorks, FinalCTA, Footer

**Files:**
- Create: `frontend/components/landing/ModulePreview.tsx`
- Create: `frontend/components/landing/HowItWorks.tsx`
- Create: `frontend/components/landing/FinalCTA.tsx`
- Create: `frontend/components/landing/Footer.tsx`

- [ ] **Step 1: `ModulePreview.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MODULES } from "@/lib/modules/data";

export function ModulePreview() {
  const featured = MODULES.slice(0, 4);
  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Modul Pilihan</h2>
          <p className="text-[var(--color-text-muted)] max-w-md">
            Mulai dengan modul rekomendasi kami. Tidak perlu daftar untuk melihat isinya.
          </p>
        </div>
        <Link
          href="/modules"
          className="text-sm font-semibold text-[var(--color-blue-700)] hover:text-[var(--color-blue-800)] inline-flex items-center gap-1.5"
        >
          Lihat Semua Modul
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link href={`/modules/${m.slug}`}>
              <Card interactive className="overflow-hidden h-full">
                <div className="aspect-[5/3] w-full" style={{ background: m.cover }} />
                <div className="p-5">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5 mb-2">
                    {m.category}
                  </span>
                  <h3 className="font-bold text-base mb-1.5">{m.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{m.summary}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs text-[var(--color-text-subtle)]">
                    <span>{m.level}</span>
                    <span>•</span>
                    <span>{m.duration}</span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `HowItWorks.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { Camera, BookOpen, ChartLineUp } from "@phosphor-icons/react";

const STEPS = [
  {
    icon: Camera,
    title: "Kamera Memantau Fokus",
    body: "Computer Vision membaca pose, arah mata, dan ekspresi anak secara real-time.",
  },
  {
    icon: BookOpen,
    title: "Modul Menyesuaikan",
    body: "Konten otomatis disesuaikan saat anak terlihat lelah atau kehilangan fokus.",
  },
  {
    icon: ChartLineUp,
    title: "Orang Tua Mendapat Panduan",
    body: "Sistem memberi saran konkret: ganti media, beri jeda, atau ulangi konsep.",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="px-6 py-24 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Cara Kerja</h2>
        <p className="text-[var(--color-text-muted)]">
          Tiga langkah sederhana — tidak butuh keahlian teknis.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative p-7 rounded-[var(--radius-xl)] bg-white border border-[var(--color-border)] hover:border-[var(--color-blue-200)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="absolute -top-3 -left-3 grid place-items-center w-10 h-10 rounded-full bg-[var(--color-blue-600)] text-white text-sm font-bold shadow-[var(--shadow-md)]">
                {i + 1}
              </div>
              <Icon size={28} weight="duotone" className="text-[var(--color-blue-600)] mb-4" />
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{s.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `FinalCTA.tsx`**

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="tentang" className="px-6 pb-24">
      <div className="max-w-5xl mx-auto rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-blue-50)] to-white border border-[var(--color-blue-100)] p-10 md:p-14 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto">
          Mulai pendampingan belajar yang lebih percaya diri hari ini.
        </h2>
        <p className="text-[var(--color-text-muted)] max-w-xl mx-auto mb-8">
          Akses ke katalog modul gratis. Daftar hanya saat Anda siap mulai sesi belajar dengan kamera.
        </p>
        <Link href="/modules">
          <Button variant="primary" size="lg">
            Mulai Sekarang
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2.5">
          <div className="grid place-items-center w-7 h-7 rounded-md bg-[var(--color-blue-600)] text-white font-bold text-xs">V</div>
          <span className="font-semibold text-[var(--color-text-primary)]">VISEA</span>
          <span className="opacity-60">© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[var(--color-blue-700)]">Privasi</a>
          <a href="#" className="hover:text-[var(--color-blue-700)]">Syarat</a>
          <a href="#" className="hover:text-[var(--color-blue-700)]">Kontak</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/components/landing/
git commit -m "feat(landing): ModulePreview, HowItWorks, FinalCTA, Footer sections"
```

---

### Task 19: Rewrite landing page

**Files:**
- Create: `frontend/app/(public)/page.tsx`
- Delete: `frontend/app/page.tsx` (move into `(public)`)

- [ ] **Step 1: Move + rewrite**

Delete the old `frontend/app/page.tsx` and create `frontend/app/(public)/page.tsx`:

```tsx
import { Hero } from "@/components/landing/Hero";
import { ModulePreview } from "@/components/landing/ModulePreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ModulePreview />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Remove old page**

```bash
rm frontend/app/page.tsx
```

- [ ] **Step 3: Type-check + dev smoke**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors. Open `/` in dev — landing should render with new sections.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(landing): rebuild landing page with new sections, remove old page"
```

---

### Task 20: Module catalog page

**Files:**
- Create: `frontend/components/modules/ModuleCard.tsx`
- Create: `frontend/components/modules/ModuleFilter.tsx`
- Create: `frontend/app/(public)/modules/page.tsx`

- [ ] **Step 1: `ModuleCard.tsx`**

```tsx
"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { LearningModule } from "@/types/module";

export function ModuleCard({ module: m }: { module: LearningModule }) {
  return (
    <Link href={`/modules/${m.slug}`}>
      <Card interactive className="overflow-hidden h-full">
        <div className="aspect-[5/3] w-full" style={{ background: m.cover }} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5">
              {m.category}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] rounded-full px-2 py-0.5">
              {m.level}
            </span>
          </div>
          <h3 className="font-bold text-base mb-1.5">{m.title}</h3>
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">{m.summary}</p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-subtle)]">
            <Clock className="w-3.5 h-3.5" />
            {m.duration}
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: `ModuleFilter.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/lib/modules/data";
import type { ModuleCategory } from "@/types/module";

interface Props {
  value: ModuleCategory | "all";
  onChange: (v: ModuleCategory | "all") => void;
}

export function ModuleFilter({ value, onChange }: Props) {
  const items: { value: ModuleCategory | "all"; label: string }[] = [
    { value: "all", label: "Semua" },
    ...CATEGORIES,
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            "px-4 h-9 rounded-full text-sm font-semibold transition-colors border",
            value === it.value
              ? "bg-[var(--color-blue-600)] text-white border-[var(--color-blue-600)]"
              : "bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-blue-700)] hover:border-[var(--color-blue-200)]"
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `app/(public)/modules/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModuleFilter } from "@/components/modules/ModuleFilter";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { getModulesByCategory } from "@/lib/modules/data";
import type { ModuleCategory } from "@/types/module";

export default function ModulesPage() {
  const [filter, setFilter] = useState<ModuleCategory | "all">("all");
  const list = getModulesByCategory(filter);

  return (
    <section className="px-6 py-12 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Katalog Modul</h1>
        <p className="text-[var(--color-text-muted)] max-w-xl">
          Jelajahi modul belajar yang dirancang untuk anak berkebutuhan khusus. Tidak perlu daftar untuk melihat.
        </p>
      </header>
      <div className="mb-8">
        <ModuleFilter value={filter} onChange={setFilter} />
      </div>
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {list.map((m) => (
          <motion.div key={m.id} layout>
            <ModuleCard module={m} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/components/modules/ frontend/app/\(public\)/modules/page.tsx
git commit -m "feat(modules): catalog page with filter + ModuleCard"
```

---

### Task 21: Module detail page

**Files:**
- Create: `frontend/app/(public)/modules/[id]/page.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getModuleBySlug } from "@/lib/modules/data";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

export default function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const m = getModuleBySlug(id);
  const router = useRouter();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  if (!m) {
    return (
      <section className="px-6 py-24 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-3">Modul tidak ditemukan</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Modul yang Anda cari mungkin sudah dihapus atau tautan salah.
        </p>
        <Button variant="primary" onClick={() => router.push("/modules")}>
          Kembali ke Katalog
        </Button>
      </section>
    );
  }

  function startLearning() {
    if (!user) {
      openAuthModal({ mode: "login", redirectTo: `/learn/${m!.slug}` });
      return;
    }
    router.push(`/learn/${m!.slug}`);
  }

  return (
    <section className="px-6 py-10 max-w-5xl mx-auto">
      <button
        onClick={() => router.push("/modules")}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div
          className="aspect-[4/3] rounded-[var(--radius-xl)] border border-[var(--color-border)]"
          style={{ background: m.cover }}
        />
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2.5 py-1">
              {m.category}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{m.level}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{m.title}</h1>
          <p className="text-[var(--color-text-muted)] mb-6">{m.summary}</p>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-8">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {m.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="w-4 h-4" />
              {m.steps.length} langkah
            </span>
          </div>
          <Button variant="primary" size="lg" onClick={startLearning}>
            Mulai Belajar
          </Button>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-bold mb-4">Tujuan Pembelajaran</h2>
        <ul className="space-y-2.5">
          {m.objectives.map((o, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="grid place-items-center w-5 h-5 rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-700)] text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--color-text-primary)]">{o}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/app/\(public\)/modules/\[id\]/page.tsx
git commit -m "feat(modules): module detail page with auth-gated 'Mulai Belajar' CTA"
```

---

## Phase 7 — Authed Routes (Dashboard + Learn)

### Task 22: Authed layout (auth guard)

**Files:**
- Create: `frontend/app/(authed)/layout.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal({ mode: "login", redirectTo: pathname });
      router.replace("/");
    }
  }, [user, loading, openAuthModal, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-[var(--color-text-muted)]">Memuat…</div>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/app/\(authed\)/layout.tsx
git commit -m "feat(authed): auth guard layout — redirects + opens modal if no user"
```

---

### Task 23: Dashboard layout + sidebar

**Files:**
- Create: `frontend/components/dashboard/DashboardSidebar.tsx`
- Create: `frontend/app/(authed)/dashboard/layout.tsx`

- [ ] **Step 1: `DashboardSidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Video, BookOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/modules", label: "Modul", icon: BookOpen },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function onLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[var(--color-border)] flex flex-col p-5">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
        <div className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-blue-600)] text-white font-extrabold">
          V
        </div>
        <span className="font-bold text-lg tracking-tight">VISEA</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-blue-50)] text-[var(--color-blue-700)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] pt-4 mt-4">
        <div className="px-3 mb-3">
          <div className="text-sm font-semibold truncate">{user?.name ?? "—"}</div>
          <div className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-focus-low)] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: `app/(authed)/dashboard/layout.tsx`**

```tsx
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-surface-muted)]">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/components/dashboard/ frontend/app/\(authed\)/dashboard/layout.tsx
git commit -m "feat(dashboard): sidebar + dashboard layout"
```

---

### Task 24: Dashboard home + monitoring page

**Files:**
- Create: `frontend/app/(authed)/dashboard/page.tsx`
- Create: `frontend/app/(authed)/dashboard/monitoring/page.tsx`
- Delete: `frontend/app/dashboard/page.tsx` (old)
- Delete: `frontend/components/layout/DashboardShell.tsx`, `frontend/components/layout/Sidebar.tsx` (old)

- [ ] **Step 1: `app/(authed)/dashboard/page.tsx`**

```tsx
"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { MODULES } from "@/lib/modules/data";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const recommended = MODULES.slice(0, 3);
  const continueModule = MODULES[0];

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Halo, {user?.name ?? "Pengguna"} 👋</h1>
        <p className="text-[var(--color-text-muted)]">Lanjutkan pendampingan belajar anak Anda.</p>
      </header>

      <Card className="overflow-hidden mb-10">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-stretch">
          <div className="aspect-video md:aspect-auto" style={{ background: continueModule.cover }} />
          <div className="p-6">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5">
              Lanjutkan
            </span>
            <h2 className="text-xl font-bold mt-2 mb-1">{continueModule.title}</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
              {continueModule.summary}
            </p>
            <Link href={`/learn/${continueModule.slug}`}>
              <Button variant="primary" size="md">
                Lanjut Belajar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="mb-10">
        <h2 className="text-lg font-bold mb-1">Statistik Fokus 7 Hari</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Ringkasan tingkat fokus anak selama sesi belajar.
        </p>
        <Card className="p-6">
          <div className="flex items-end gap-2 h-32">
            {[42, 65, 38, 72, 80, 55, 68].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[var(--color-blue-500)]"
                  style={{ height: `${v}%`, opacity: 0.85 }}
                />
                <span className="text-[10px] text-[var(--color-text-subtle)]">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[var(--color-blue-600)]" />
          <h2 className="text-lg font-bold">Direkomendasikan untuk Anda</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommended.map((m) => (
            <Link key={m.id} href={`/modules/${m.slug}`}>
              <Card interactive className="overflow-hidden h-full">
                <div className="aspect-[5/3]" style={{ background: m.cover }} />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{m.summary}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `app/(authed)/dashboard/monitoring/page.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useBiometric } from "@/context/BiometricContext";

export default function MonitoringPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [denied, setDenied] = useState(false);
  const { biometric } = useBiometric();

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (!cancelled) setDenied(true);
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Monitoring</h1>
        <p className="text-[var(--color-text-muted)]">
          Pantauan kamera dan tingkat fokus saat sesi belajar.
        </p>
      </header>

      <Card className="overflow-hidden mb-6">
        <div className="aspect-video bg-slate-900 relative">
          {denied ? (
            <div className="absolute inset-0 grid place-items-center text-white/80 text-sm">
              Izin kamera ditolak.
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Tingkat Fokus
          </div>
          <div className="text-2xl font-bold capitalize">{biometric.focusLevel}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Update Terakhir
          </div>
          <div className="text-2xl font-bold">
            {biometric.lastUpdatedAt
              ? new Date(biometric.lastUpdatedAt).toLocaleTimeString("id-ID")
              : "—"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Eye Openness
          </div>
          <div className="text-2xl font-bold">
            {biometric.eyeOpenness !== null ? biometric.eyeOpenness.toFixed(2) : "—"}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Remove old dashboard + layout components**

```bash
rm -rf frontend/app/dashboard
rm -rf frontend/components/layout
```

- [ ] **Step 4: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add -A
git commit -m "feat(dashboard): home + monitoring pages, remove old dashboard files"
```

---

### Task 25: Learning session page with auto-PiP

**Files:**
- Create: `frontend/app/(authed)/learn/layout.tsx`
- Create: `frontend/app/(authed)/learn/[id]/page.tsx`

- [ ] **Step 1: `app/(authed)/learn/layout.tsx`**

```tsx
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--color-surface-muted)]">{children}</div>;
}
```

- [ ] **Step 2: `app/(authed)/learn/[id]/page.tsx`**

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getModuleBySlug } from "@/lib/modules/data";
import { usePiP } from "@/context/PiPContext";

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const m = getModuleBySlug(id);
  const router = useRouter();
  const { open, close } = usePiP();
  const [step, setStep] = useState(0);

  useEffect(() => {
    open();
    return () => close();
  }, [open, close]);

  if (!m) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-3">Modul tidak ditemukan</h1>
          <Button variant="primary" onClick={() => router.push("/modules")}>
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    );
  }

  const total = m.steps.length;
  const current = m.steps[step];
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-[var(--color-border)] px-6 h-16 flex items-center gap-4">
        <button
          onClick={() => router.push(`/modules/${m.slug}`)}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold truncate">{m.title}</span>
            <span className="text-[var(--color-text-muted)]">
              Langkah {step + 1} dari {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-blue-600)]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-6 py-12">
        <Card className="w-full max-w-2xl p-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue-700)] mb-3">
                Langkah {step + 1}
              </div>
              <h2 className="text-3xl font-bold mb-4">{current.title}</h2>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">{current.body}</p>
            </motion.div>
          </AnimatePresence>
        </Card>
      </main>

      <footer className="bg-white border-t border-[var(--color-border)] px-6 h-20 flex items-center justify-between">
        <Button
          variant="outline"
          size="md"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </Button>
        {step === total - 1 ? (
          <Button variant="primary" size="md" onClick={() => router.push("/dashboard")}>
            Selesai
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={() => setStep((s) => Math.min(total - 1, s + 1))}>
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```bash
cd frontend && npx tsc --noEmit
git add frontend/app/\(authed\)/learn/
git commit -m "feat(learn): learning session page with auto-spawned PiP monitor"
```

---

## Phase 8 — Verification

### Task 26: Final type-check + production build

**Files:**
- None (verification only)

- [ ] **Step 1: Run full type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Run production build**

```bash
cd frontend && npm run build
```

Expected: build succeeds. If errors, fix them in this task before completing.

- [ ] **Step 3: Manual smoke test (dev server)**

```bash
cd frontend && npm run dev
```

In browser at `http://localhost:3067`, verify:
- `/` — Landing renders: hero parallax tracks mouse, modul preview clickable, sections fade in on scroll.
- Click "Daftar" → AuthModal opens. Switch tabs login/register. Validation works on empty submit.
- Register flow: fill form → submit → redirect to `/dashboard`.
- Click logo → back to landing. Click "Modul" → catalog. Filter chips switch lists.
- Click a module card → detail page. Click "Mulai Belajar" while logged out → AuthModal with redirectTo.
- Login → redirected to `/learn/[slug]`. PiP appears bottom-right with webcam (or permission prompt). Drag PiP, minimize/expand, close. Re-open by navigating away and back.
- Sidebar nav: Beranda, Modul, Monitoring all reachable. Logout returns to `/`.

If any step fails, file a follow-up task with reproduction steps and fix before claiming completion.

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: post-build adjustments from smoke test"
```

(Skip if no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** Each spec section maps to tasks:
  - §3 Routes → Tasks 16, 19, 20, 21, 22, 23, 24, 25
  - §4.1 Auth Layer → Tasks 7, 8, 9, 10, 11
  - §4.2 AuthModal → Task 11
  - §4.3 PiP Monitoring → Tasks 13, 14, 15
  - §4.4 Landing sections → Tasks 17, 18, 19
  - §4.5 Module pages → Tasks 20, 21, 25
  - §4.6 Dashboard → Tasks 22, 23, 24
  - §5 Design system → Tasks 3, 4, 5, 6
  - §6 File structure → Task 2 (folder move) + per-task file paths
  - §7 Migration → Tasks 2, 19 (delete old page), 24 (delete old dashboard/layout)
  - §8 Error handling → Modal not-found in Tasks 21, 25; auth redirect in Task 22; webcam denial in Task 14
  - §9 Testing → Task 26
- **Type consistency:** `useAuth()` returns same shape across consumers (Navbar, AuthModal, AuthedLayout, DashboardSidebar). `usePiP()` consistent in PiPMonitor + LearnPage. Module data accessor names (`getModuleBySlug`, `getModulesByCategory`) used consistently.
- **No placeholders:** All steps have concrete code, exact paths, exact commands.
