import { Header } from "@/components/layout/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChartClient } from "./revenue-chart-client"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"

const grafico = [
  { label: "Seg", receita: 980,  servicos: 780,  produtos: 200 },
  { label: "Ter", receita: 1240, servicos: 1000, produtos: 240 },
  { label: "Qua", receita: 860,  servicos: 700,  produtos: 160 },
  { label: "Qui", receita: 1520, servicos: 1200, produtos: 320 },
  { label: "Sex", receita: 1890, servicos: 1500, produtos: 390 },
  { label: "Sáb", receita: 2340, servicos: 1900, produtos: 440 },
  { label: "Dom", receita: 420,  servicos: 380,  produtos: 40  },
]

const agenda = [
  { hora: "09:00", cliente: "Carlos Silva",   servico: "Corte + Barba", barbeiro: "João",   status: "concluido" },
  { hora: "10:00", cliente: "Pedro Santos",   servico: "Corte",         barbeiro: "Marcos", status: "em_andamento" },
  { hora: "11:00", cliente: "Lucas Oliveira", servico: "Barba",         barbeiro: "João",   status: "confirmado" },
  { hora: "13:00", cliente: "Rafael Costa",   servico: "Corte + Barba", barbeiro: "Marcos", status: "agendado" },
  { hora: "14:30", cliente: "Bruno Lima",     servico: "Platinado",     barbeiro: "João",   status: "agendado" },
]

const statusVariant: Record<string, "success" | "default" | "warning" | "secondary"> = {
  concluido: "success", em_andamento: "default", confirmado: "warning", agendado: "secondary",
}
const statusLabel: Record<string, string> = {
  concluido: "Concluído", em_andamento: "Em andamento", confirmado: "Confirmado", agendado: "Agendado",
}

const topServicos = [
  { nome: "Corte + Barba", total: 42, valor: 2940 },
  { nome: "Corte",         total: 38, valor: 1710 },
  { nome: "Barba",         total: 21, valor:  735 },
  { nome: "Coloração",     total: 8,  valor:  960 },
  { nome: "Tratamento",    total: 5,  valor:  300 },
]

const barbeiros = [
  { nome: "João Mendes",   vendas: 28, meta: 35, receita: 2240 },
  { nome: "Marcos Silva",  vendas: 22, meta: 35, receita: 1870 },
  { nome: "Rafael Torres", vendas: 15, meta: 25, receita: 1290 },
]

export default function DashboardPage() {
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header title="Dashboard" subtitle={hoje.charAt(0).toUpperCase() + hoje.slice(1)} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">

        {/* KPIs */}
        <StatsCards />

        {/* Gráfico + Top Serviços */}
        <div className="grid gap-5 lg:grid-cols-3">
          <RevenueChartClient data={grafico} />

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-1 text-sm font-semibold">Top serviços</p>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">Esta semana</p>
            <div className="space-y-4">
              {topServicos.map((s, i) => (
                <div key={s.nome}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--muted-foreground)] w-4">{i + 1}</span>
                      <span className="text-sm font-medium">{s.nome}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--primary)]">{formatCurrency(s.valor)}</span>
                  </div>
                  <Progress value={s.total} max={42} />
                  <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">{s.total} atend.</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agenda + Barbeiros */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Agenda do dia — 2/3 */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <p className="text-sm font-semibold">Agenda de hoje</p>
              <a href="/agendamentos" className="text-xs font-medium text-[var(--primary)] hover:underline">Ver todos →</a>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {agenda.map((a) => (
                <div key={a.hora} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--muted)]/40 transition-colors">
                  <span className="w-11 shrink-0 text-sm font-medium tabular-nums text-[var(--muted-foreground)]">{a.hora}</span>
                  <Avatar name={a.cliente} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.cliente}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{a.servico} · {a.barbeiro}</p>
                  </div>
                  <Badge variant={statusVariant[a.status]}>{statusLabel[a.status]}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Barbeiros — 1/3 */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <p className="text-sm font-semibold">Barbeiros</p>
              <p className="text-xs text-[var(--muted-foreground)]">Meta mensal</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {barbeiros.map((b) => (
                <div key={b.nome} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    <Avatar name={b.nome} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.nome}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{formatCurrency(b.receita)}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--foreground)]">{b.vendas}/{b.meta}</span>
                  </div>
                  <Progress value={b.vendas} max={b.meta} showLabel />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
