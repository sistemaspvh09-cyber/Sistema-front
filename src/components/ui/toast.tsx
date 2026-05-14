"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Info, Warning, X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (t: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastCtx = React.createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, t.duration ?? 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastCtx)
}

const config: Record<ToastType, { icon: React.ElementType; border: string; bg: string; iconColor: string; glow: string }> = {
  success: {
    icon: CheckCircle,
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  error: {
    icon: XCircle,
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    iconColor: "text-red-400",
    glow: "shadow-red-500/20",
  },
  info: {
    icon: Info,
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  warning: {
    icon: Warning,
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-80">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const cfg = config[t.type]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className={cn(
                "relative flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md",
                "bg-[var(--card)]/90",
                cfg.border,
                `shadow-lg ${cfg.glow}`
              )}
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
                <cfg.icon weight="duotone" size={18} className={cfg.iconColor} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold leading-none">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
