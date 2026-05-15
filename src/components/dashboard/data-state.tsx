"use client"

import { Button } from "@/components/ui/button"
import type { ActiveFilter } from "@/lib/supabase-records"

export function ActiveFilterTabs({
  value,
  onChange,
}: {
  value: ActiveFilter
  onChange: (value: ActiveFilter) => void
}) {
  const items: Array<{ value: ActiveFilter; label: string }> = [
    { value: "ativos", label: "Ativos" },
    { value: "inativos", label: "Inativos" },
    { value: "todos", label: "Todos" },
  ]

  return (
    <div className="flex gap-1.5">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
            value === item.value
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function DataFeedback({
  isLoading,
  error,
  isEmpty,
  onRetry,
}: {
  isLoading: boolean
  error: Error | null
  isEmpty: boolean
  onRetry: () => void
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted-foreground)]">
        Carregando dados...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        <p className="font-semibold">Não foi possível carregar os dados.</p>
        <p className="mt-1">{error.message}</p>
        <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted-foreground)]">
        Nenhum registro encontrado para os filtros atuais.
      </div>
    )
  }

  return null
}
