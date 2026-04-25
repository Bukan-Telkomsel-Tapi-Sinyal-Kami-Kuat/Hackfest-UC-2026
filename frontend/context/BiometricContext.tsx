"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { BiometricState, DEFAULT_BIOMETRIC_STATE } from "@/types/biometric";

interface BiometricContextValue {
  biometric: BiometricState;
  updateBiometric: (patch: Partial<BiometricState>) => void;
  reset: () => void;
}

const BiometricContext = createContext<BiometricContextValue | null>(null);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const [biometric, setBiometric] = useState<BiometricState>(DEFAULT_BIOMETRIC_STATE);

  const updateBiometric = useCallback((patch: Partial<BiometricState>) => {
    setBiometric((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setBiometric(DEFAULT_BIOMETRIC_STATE);
  }, []);

  return (
    <BiometricContext.Provider value={{ biometric, updateBiometric, reset }}>
      {children}
    </BiometricContext.Provider>
  );
}

export function useBiometric(): BiometricContextValue {
  const ctx = useContext(BiometricContext);
  if (!ctx) {
    throw new Error("useBiometric must be used inside <BiometricProvider>");
  }
  return ctx;
}