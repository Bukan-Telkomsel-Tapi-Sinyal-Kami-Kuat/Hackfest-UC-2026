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
