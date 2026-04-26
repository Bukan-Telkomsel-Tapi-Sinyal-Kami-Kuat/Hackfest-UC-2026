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
import { getCurrentUser, signIn, signUp, signInWithGoogle, signOut } from "@/lib/auth/realAuth";

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

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const res = await signIn(email, password);
    if (!res.error) setUser(getCurrentUser());
    return res;
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, name: string) => {
    const res = await signUp(email, password, name);
    if (!res.error) setUser(getCurrentUser());
    return res;
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    const res = await signInWithGoogle();
    return res;
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}