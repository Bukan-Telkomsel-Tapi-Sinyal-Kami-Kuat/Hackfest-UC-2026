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
