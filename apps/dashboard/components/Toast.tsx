"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let toastId = 0;

export function showToast(message: string, type: ToastType = "info") {
  const event = new CustomEvent("toast", {
    detail: { id: ++toastId, message, type },
  });
  window.dispatchEvent(event);
}

export default function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: CustomEvent<Toast>) => {
      setToasts((prev) => [...prev, e.detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== e.detail.id));
      }, 4000);
    };

    window.addEventListener("toast", handler as EventListener);
    return () => window.removeEventListener("toast", handler as EventListener);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
