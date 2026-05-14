"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  size?: "sm" | "md" | "lg" | "xl"
  side?: "right" | "left"
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" }

export function Drawer({ open, onClose, children, title, description, size = "md", side = "right" }: DrawerProps) {
  React.useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open, onClose])

  const xFrom = side === "right" ? "100%" : "-100%"

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: xFrom, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: xFrom, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className={cn(
              "absolute inset-y-0 flex flex-col bg-[var(--card)] shadow-2xl w-full",
              sizes[size],
              side === "right" ? "right-0" : "left-0"
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4 shrink-0">
                <div>
                  {title && <h2 className="text-base font-semibold">{title}</h2>}
                  {description && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DrawerFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("shrink-0 flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4", className)}>
      {children}
    </div>
  )
}
