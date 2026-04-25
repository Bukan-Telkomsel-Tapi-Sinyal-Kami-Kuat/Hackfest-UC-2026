"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

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

export function usePiP(): PiPContextValue {
  const ctx = useContext(PiPContext);
  if (!ctx) throw new Error("usePiP must be used inside <PiPProvider>");
  return ctx;
}
