"use client"

import { useState } from "react"
import { TrendUp, Users, CurrencyDollar, Scissors } from "@phosphor-icons/react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { Header } from "@/components/layout/header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

const receitaMensal = [
  { mes: "Jan", receita: 8200,  despesas: 3400 },
  { mes: "Fev", receita: 9400,  despesas: 3600 },
  { mes: "Mar", receita: 8800,  despesas: 3300 },
  { mes: "Abr", receita: 11200, despesas: 4100 },
  { mes: "Mai", receita: 12400, despesas: 4200 },
  { mes: "Jun", receita: 10900, despesas: 3900 },
  { mes: "Jul", receita: 13600, despesas: 4500 },
  { mes: "Ago", receita: 14200, despesas: 4800 },
  { mes: "Set", receita: 12800, despesas: 4300 },
  { mes: "Out", receita: 15100, despesas: 5100 },
  { mes: "Nov", receita: 16400, despesas: 5400 },
  { mes: "Dez", receita: 19800, despesas: 6200 },
]

const servicosPie = [
  { name: "Corte + Barba", value: 42, color: "#f97316" },
  { name: "Corte",         value: 28, color: "#3b82f6" },
  { name: "Barba",         value: 15, color: "#a855f7" },
  { name: "Coloração",     value: 8,  color: "#ec4899" },
  { name: "Tratamento",    value: 5,  color: "#22c55e" },
  { name: "Outros",        value: 2,  color: "#a3a3a3" },
]

const clientesMes = [
  { mes: "Jan", novos: 12, recorrentes: 48 },
  { mes: "Fev", novos: 15, recorrentes: 52 },
  { mes: "Mar", novos: 11, recorrentes: 55 },
  { mes: "Abr", novos: 18, recorrentes: 61 },
  { mes: "Mai", novos: 14, recorrentes: 67 },
  { mes: "Jun", novos: 20, recorrentes: 72 },
]

type TooltipPayload = {
  name?: string
  value?: number | string
  color?: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl text-xs">
      <p className="mb-2 font-semibold">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[var(--muted-foreground)]">{p.name}</span>
          </span>
          <span className="font-semibold">{typeof p.value === "number" && p.value > 100 ? formatCurrency(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const kpis = [
  { title: "Receita anual", value: formatCurrency(152800), change: 24.3, icon: CurrencyDollar, color: "text-emerald-600 bg-emerald-500/10" },
  { title: "Clientes ativos", value: "284", change: 18.5, icon: Users, color: "text-blue-600 bg-blue-500/10" },
  { title: "Atendimentos", value: "1.847", change: 12.1, icon: Scissors, color: "text-purple-600 bg-purple-500/10" },
  { title: "Ticket médio", value: formatCurrency(82.75), change: 9.4, icon: TrendUp, color: "text-orange-500 bg-orange-500/10" },
]

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<"6m" | "12m">("12m")

  const dados = periodo === "6m" ? receitaMensal.slice(6) : receitaMensal

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Relatórios"
        subtitle="Análise completa de desempenho"
        action={{ label: "Exportar PDF" }}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">

        {/* KPIs anuais */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{k.title}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendUp className="h-3 w-3" />+{k.change}% vs ano anterior
              </p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="receita">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="receita">Receita</TabsTrigger>
              <TabsTrigger value="servicos">Serviços</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>
            <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1">
              {(["6m", "12m"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    periodo === p ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {p === "6m" ? "6 meses" : "12 meses"}
                </button>
              ))}
            </div>
          </div>

          {/* Receita vs Despesas */}
          <TabsContent value="receita">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm font-semibold mb-1">Receita vs Despesas</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-5">Evolução mensal com área de lucro destacada</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dados}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke="#f97316" strokeWidth={2} fill="url(#receitaGrad)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#despesaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Serviços */}
          <TabsContent value="servicos">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm font-semibold mb-1">Distribuição de serviços</p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">% do total de atendimentos</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={servicosPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {servicosPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm font-semibold mb-4">Ranking de serviços</p>
                <div className="space-y-4">
                  {servicosPie.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        <span className="font-semibold">{s.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.value}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clientes">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm font-semibold mb-1">Novos vs Recorrentes</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-5">Evolução da base de clientes</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={clientesMes}>
                  <defs>
                    <linearGradient id="novosGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="recorrentes" name="Recorrentes" stroke="#f97316" strokeWidth={2} fill="url(#recGrad)" />
                  <Area type="monotone" dataKey="novos" name="Novos" stroke="#3b82f6" strokeWidth={2} fill="url(#novosGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
