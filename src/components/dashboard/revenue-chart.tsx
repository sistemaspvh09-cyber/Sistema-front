"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { GraficoData } from "@/lib/types"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl text-xs">
      <p className="mb-2 font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-[var(--muted-foreground)] capitalize">{p.name}</span>
          </span>
          <span className="font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

interface RevenueChartProps {
  data: GraficoData[]
  periodo: "7d" | "30d" | "90d"
  onPeriodoChange: (p: "7d" | "30d" | "90d") => void
}

export function RevenueChart({ data, periodo, onPeriodoChange }: RevenueChartProps) {
  return (
    <div className="col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Receita por período</p>
          <p className="text-xs text-[var(--muted-foreground)]">Comparativo serviços vs produtos</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodoChange(p)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                periodo === p
                  ? "bg-[var(--primary)] text-white shadow-sm shadow-orange-500/30"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={3} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", radius: 6 }} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Bar dataKey="servicos" name="Serviços" fill="#f97316" radius={[6, 6, 0, 0]} />
          <Bar dataKey="produtos" name="Produtos" fill="#a3a3a3" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
