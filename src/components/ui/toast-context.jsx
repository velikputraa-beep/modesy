"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message) => {
      addToast(message, "info");
    },
    [addToast]
  );

  toast.success = (msg) => addToast(msg, "success");
  toast.error = (msg) => addToast(msg, "error");
  toast.info = (msg) => addToast(msg, "info");

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl text-xs sm:text-sm font-medium text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
                isSuccess
                  ? "bg-teal-600"
                  : isError
                  ? "bg-red-600"
                  : "bg-gray-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isSuccess ? (
                  <CheckCircle2 className="size-4.5 shrink-0 stroke-[2.5]" />
                ) : isError ? (
                  <AlertCircle className="size-4.5 shrink-0 stroke-[2.5]" />
                ) : (
                  <Info className="size-4.5 shrink-0" />
                )}
                <span>{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-white/80 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    const fallback = (msg) => console.log("[Toast]", msg);
    fallback.success = (msg) => console.log("[Toast Success]", msg);
    fallback.error = (msg) => console.log("[Toast Error]", msg);
    fallback.info = (msg) => console.log("[Toast Info]", msg);
    return { toast: fallback, addToast: () => {} };
  }
  return context;
}
