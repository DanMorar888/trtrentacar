"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  /** Durată în ms după care se închide automat; 0 = nu se închide automat */
  autoClose?: number;
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-800 text-white",
};

export function Toast({
  visible,
  message,
  type = "success",
  onClose,
  autoClose = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!visible || autoClose <= 0) return;
    const t = setTimeout(onClose, autoClose);
    return () => clearTimeout(t);
  }, [visible, autoClose, onClose]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-start gap-3 rounded-lg px-4 py-3 pr-10 shadow-lg ${typeStyles[type]}`}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
        aria-label="Închide"
      >
        ×
      </button>
    </div>
  );
}
