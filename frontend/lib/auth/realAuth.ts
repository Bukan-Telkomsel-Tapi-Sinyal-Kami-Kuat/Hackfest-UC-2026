import type { AuthResult, User, UserRole } from "@/types/auth";

export const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("visea_token");
}

export function setToken(token: string): void {
  localStorage.setItem("visea_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("visea_token");
  localStorage.removeItem("visea_auth_user");
}

export function apiHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetchAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: { ...apiHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const data = await apiFetchAuth<{ access_token: string; userId: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    const user: User = {
      id: data.userId,
      email,
      name: email,
      role: (data.role as UserRole) ?? "PARENT",
      createdAt: Date.now(),
    };
    localStorage.setItem("visea_auth_user", JSON.stringify(user));
    return { error: null };
  } catch (err: any) {
    const msg = err?.message ?? "";
    if (msg.includes("401")) return { error: { code: "invalid_credentials", message: "Email atau kata sandi salah." } };
    return { error: { code: "unknown", message: "Terjadi kesalahan server." } };
  }
}

export async function signUp(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const data = await apiFetchAuth<{ access_token: string; userId: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    setToken(data.access_token);
    const user: User = {
      id: data.userId,
      email,
      name,
      role: (data.role as UserRole) ?? "PARENT",
      createdAt: Date.now(),
    };
    localStorage.setItem("visea_auth_user", JSON.stringify(user));
    return { error: null };
  } catch (err: any) {
    const msg = err?.message ?? "";
    if (msg.includes("400")) return { error: { code: "email_in_use", message: "Email sudah terdaftar." } };
    return { error: { code: "unknown", message: "Terjadi kesalahan server." } };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  // Google OAuth flow would need backend redirect URL
  // For now, redirect to backend Google OAuth endpoint
  window.location.href = `${BACKEND}/auth/google`;
  return { error: null };
}

export async function signOut(): Promise<void> {
  clearToken();
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("visea_auth_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}