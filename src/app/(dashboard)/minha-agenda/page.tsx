"use client"
import { motion } from "framer-motion"
import {
  CalendarBlank, Clock, CurrencyDollar,
  CheckCircle, XCircle, Hourglass, ChartLineUp, Star
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"

const meuAgendamento = [
  { hora: "09:00", duracaoMin: 50, cliente: "Carlos Silva",   servicos: ["Corte", "Barba"], valor: 70,  status: "concluido",    obs: "" },
  { hora: "10:00", duracaoMin: 30, cliente: "Pedro Santos",   servicos: ["Corte"],          valor: 45,  status: "em_andamento", obs: "" },
  { hora: "11:00", duracaoMin: 25, cliente: "Lucas Oliveira", servicos: ["Barba"],          valor: 35,  status: "confirmado",   obs: "Cliente prefere navalha" },
  { hora: "13:00", duracaoMin: 50, cliente: "Rafael Costa",   servicos: ["Corte", "Barba"], valor: 70,  status: "agendado",     obs: "" },
  { hora: "14:30", duracaoMin: 90, cliente: "Bruno Lima",     servicos: ["Platinado"],      valor: 120, status: "agendado",     obs: "" },
  { hora: "16:30", duracaoMin: 30, cliente: "Diego Martins",  servicos: ["Corte"],          valor: 45,  status: "agendado",     obs: "" },
]

const statusCfg = {
  concluido:    { label: "Concluído",    variant: "success" as const,     dot: "bg-emerald-500", icon: CheckCircle },
  em_andamento: { label: "Atendendo",   variant: "default" as const,     dot: "bg-blue-500 animate-pulse", icon: Hourglass },
  confirmado:   { label: "Confirmado",  variant: "warning" as const,     dot: "bg-amber-500", icon: CheckCircle },
  agendado:     { label: "Agendado",    variant: "secondary" as const,   dot: "bg-zinc-400", icon: CalendarBlank },
  cancelado:    { label: "Cancelado",   variant: "destructive" as const, dot: "bg-red-500", icon: XCircle },
}

const metaMensal = { concluido: 28, meta: 35 }
const comissaoPrevista = meuAgendamento.reduce((a, v) => a + v.valor, 0) * 0.4

export default function MinhaAgendaPage() {
  const { user } = useAuthStore()
  const concluidos = meuAgendamento.filter(a => a.status === "concluido").length
  const receita = meuAgendamento.filter(a => a.status === "concluido").reduce((a, v) => a + v.valor, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Minha Agenda"
        subtitle={`${user?.nome ?? "Barbeiro"} — Terça, 14 de maio de 2026`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">

        {/* KPIs pessoais */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Atendimentos hoje", value: meuAgendamento.length,
              icon: CalendarBlank, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/30",
              sub: `${concluidos} concluídos`
            },
            {
              label: "Receita gerada", value: formatCurrency(receita),
              icon: CurrencyDollar, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/30",
              sub: "hoje"
            },
            {
              label: "Comissão prevista", value: formatCurrency(comissaoPrevista),
              icon: ChartLineUp, color: "from-orange-500 to-orange-600", shadow: "shadow-orange-500/30",
              sub: "40% sobre serviços"
            },
            {
              label: "Avaliação média", value: "4.9",
              icon: Star, color: "from-amber-400 to-amber-500", shadow: "shadow-amber-500/30",
              sub: "últimos 30 dias"
            },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${k.color} p-5 text-white shadow-xl ${k.shadow}`}
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <k.icon weight="duotone" size={22} className="mb-3 opacity-90" />
              <p className="text-xl font-bold leading-none">{k.value}</p>
              <p className="mt-1 text-xs opacity-80">{k.label}</p>
              <p className="mt-0.5 text-[10px] opacity-60">{k.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Meta mensal */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Meta mensal</p>
              <p className="text-xs text-[var(--muted-foreground)]">Atendimentos realizados em maio</p>
            </div>
            <span className="text-2xl font-bold">
              {metaMensal.concluido}
              <span className="text-base text-[var(--muted-foreground)] font-normal">/{metaMensal.meta}</span>
            </span>
          </div>
          <Progress
            value={metaMensal.concluido}
            max={metaMensal.meta}
            showLabel
            barClassName={metaMensal.concluido >= metaMensal.meta ? "bg-emerald-500" : undefined}
          />
          {metaMensal.concluido < metaMensal.meta && (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Faltam <strong className="text-[var(--foreground)]">{metaMensal.meta - metaMensal.concluido}</strong> atendimentos para atingir a meta
            </p>
          )}
        </div>

        {/* Agenda do dia */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <p className="text-sm font-semibold">Agenda de hoje</p>
            <p className="text-xs text-[var(--muted-foreground)]">{meuAgendamento.length} clientes</p>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {meuAgendamento.map((a, i) => {
              const st = statusCfg[a.status as keyof typeof statusCfg]
              const isAtual = a.status === "em_andamento"
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${isAtual ? "bg-blue-500/5 border-l-2 border-blue-500" : "hover:bg-[var(--muted)]/30"}`}
                >
                  {/* Hora */}
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-sm font-bold tabular-nums">{a.hora}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] flex items-center justify-center gap-0.5">
                      <Clock size={9} weight="bold" />{a.duracaoMin}m
                    </p>
                  </div>

                  {/* Status dot */}
                  <div className={`h-2 w-2 shrink-0 rounded-full ${st.dot}`} />

                  {/* Cliente */}
                  <Avatar name={a.cliente} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.cliente}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {a.servicos.map((s) => (
                        <span key={s} className="rounded-md bg-[var(--muted)] px-1.5 py-px text-[10px]">{s}</span>
                      ))}
                    </div>
                    {a.obs && (
                      <p className="mt-0.5 text-[10px] text-amber-500 italic">&quot;{a.obs}&quot;</p>
                    )}
                  </div>

                  {/* Valor */}
                  <p className="text-sm font-bold text-[var(--primary)] shrink-0">{formatCurrency(a.valor)}</p>

                  {/* Badge */}
                  <Badge variant={st.variant} className="shrink-0">
                    <st.icon weight="duotone" size={10} className="mr-1" />
                    {st.label}
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
