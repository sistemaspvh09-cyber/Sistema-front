"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue { active: string; setActive: (v: string) => void }
const TabsCtx = React.createContext<TabsContextValue>({ active: "", setActive: () => {} })

interface TabsProps { defaultValue: string; children: React.ReactNode; className?: string }

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue)
  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsCtx.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-xl bg-[var(--muted)] p-1", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setActive } = React.useContext(TabsCtx)
  const isActive = active === value
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = React.useContext(TabsCtx)
  if (active !== value) return null
  return <div className={cn("animate-fade-in", className)}>{children}</div>
}
