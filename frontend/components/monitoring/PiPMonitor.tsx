"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";
import { usePiP } from "@/context/PiPContext";
import { useBiometric } from "@/context/BiometricContext";
import { cn } from "@/lib/utils/cn";
import type { FocusLevel } from "@/types/biometric";

const STORAGE_KEY = "pip-position";

const focusConfig: Record<FocusLevel, { label: string; className: string }> = {
  high: { label: "Fokus Tinggi", className: "bg-[var(--color-focus-high)]" },
  medium: { label: "Fokus Sedang", className: "bg-[var(--color-focus-medium)]" },
  low: { label: "Fokus Rendah", className: "bg-[var(--color-focus-low)]" },
  unknown: { label: "Memantau...", className: "bg-gray-400" },
};

function loadPosition(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { x: window.innerWidth - 268, y: 24 };
}

export function PiPMonitor() {
  const { isOpen, isMinimized, close, toggleMinimize } = usePiP();
  const { biometric } = useBiometric();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [position, setPosition] = useState(loadPosition);
  const [camError, setCamError] = useState(false);

  const focus = focusConfig[biometric.focusLevel];

  // Start/stop webcam with PiP visibility
  useEffect(() => {
    if (!isOpen || isMinimized) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamError(false);
      })
      .catch(() => setCamError(true));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [isOpen, isMinimized]);

  function handleDragEnd(_: unknown, info: { offset: { x: number; y: number } }) {
    const next = { x: position.x + info.offset.x, y: position.y + info.offset.y };
    setPosition(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pip"
          drag
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          style={{ x: position.x, y: position.y, position: "fixed", top: 0, left: 0, zIndex: 9999 }}
          className="w-60 rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] border border-[var(--color-border)] bg-white select-none cursor-grab active:cursor-grabbing"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-[var(--color-border)]">
            <span className="text-xs font-semibold text-[var(--color-text-primary)] font-[var(--font-display)]">
              Pemantauan
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                aria-label={isMinimized ? "Perbesar" : "Perkecil"}
                className="p-1 rounded hover:bg-[var(--color-blue-50)] text-[var(--color-text-muted)] transition-colors"
              >
                {isMinimized ? <Maximize2 size={12} /> : <Minus size={12} />}
              </button>
              <button
                onClick={close}
                aria-label="Tutup pemantauan"
                className="p-1 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Webcam feed */}
                <div className="relative bg-gray-900 aspect-video">
                  {camError ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs text-center px-3">
                      Kamera tidak tersedia
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  )}
                </div>

                {/* Focus chip */}
                <div className="px-3 py-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full flex-shrink-0",
                      focus.className
                    )}
                  />
                  <span className="text-xs text-[var(--color-text-primary)]">{focus.label}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
