"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Plus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "@/components/layout/sidebar"
import { NotificationPanel } from "@/components/layout/notification-panel"
import { CommandPalette } from "@/components/ui/command-palette"

interface HeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          <h1 className="text-base lg:text-lg font-bold leading-none tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)] hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Command palette */}
        <CommandPalette />

        {action && (
          <Button size="sm" className="gap-1.5 h-8 text-xs hidden sm:flex" onClick={action.onClick}>
            <Plus weight="bold" size={13} />
            {action.label}
          </Button>
        )}

        <NotificationPanel />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <Sun weight="duotone" size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon weight="duotone" size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </header>
  )
}
