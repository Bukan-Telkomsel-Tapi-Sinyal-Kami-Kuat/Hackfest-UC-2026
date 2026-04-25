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
