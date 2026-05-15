"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { CalendarBlank, Check, Clock, Hourglass, PencilSimple, X } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { DataFeedback } from "@/components/dashboard/data-state"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/client"
import { formatCurrency } from "@/lib/utils"
import type { AgendamentoRow, BarbeiroRow, ClienteRow, StatusAgendamento } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

interface AgendamentoForm {
  unidade_id: string
  cliente_id: string
  barbeiro_id: string
  data: string
  hora_inicio: string
  duracao_min: number
  status: StatusAgendamento
  valor_total: number
  observacoes: string
}

const statusCfg: Record<StatusAgendamento, { label: string; variant: "success" | "default" | "warning" | "secondary" | "destructive"; dot: string; icon: React.ElementType }> = {
  concluido: { label: "Concluído", variant: "success", dot: "bg-emerald-500", icon: Check },
  em_andamento: { label: "Atendendo", variant: "default", dot: "bg-blue-500", icon: Hourglass },
  confirmado: { label: "Confirmado", variant: "warning", dot: "bg-amber-500", icon: Check },
  agendado: { label: "Agendado", variant: "secondary", dot: "bg-zinc-400", icon: CalendarBlank },
  cancelado: { label: "Cancelado", variant: "destructive", dot: "bg-red-500", icon: X },
  faltou: { label: "Faltou", variant: "destructive", dot: "bg-red-500", icon: X },
}

const statusOptions: Array<{ value: StatusAgendamento; label: string }> = [
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
  { value: "faltou", label: "Faltou" },
]

const horasGrid = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normaliseAgendamento(agendamento: AgendamentoRow | null, fallbackUnidadeId: string): AgendamentoForm {
  if (!agendamento) {
    return {
      unidade_id: fallbackUnidadeId,
      cliente_id: "",
      barbeiro_id: "",
      data: today(),
      hora_inicio: "09:00",
      duracao_min: 30,
      status: "agendado",
      valor_total: 0,
      observacoes: "",
    }
  }

  return {
    unidade_id: agendamento.unidade_id ?? fallbackUnidadeId,
    cliente_id: agendamento.cliente_id ?? "",
    barbeiro_id: agendamento.barbeiro_id ?? "",
    data: agendamento.data,
    hora_inicio: agendamento.hora_inicio.slice(0, 5),
    duracao_min: agendamento.duracao_min ?? 30,
    status: agendamento.status,
    valor_total: Number(agendamento.valor_total ?? 0),
    observacoes: agendamento.observacoes ?? "",
  }
}

function AgendamentoDrawer({
  agendamento,
  open,
  clientes,
  barbeiros,
  fallbackUnidadeId,
  onClose,
  onSave,
}: {
  agendamento: AgendamentoRow | null
  open: boolean
  clientes: ClienteRow[]
  barbeiros: BarbeiroRow[]
  fallbackUnidadeId: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !agendamento?.id
  const [form, setForm] = useState<AgendamentoForm>(() => normaliseAgendamento(agendamento, fallbackUnidadeId))

  function upd<K extends keyof AgendamentoForm>(key: K, value: AgendamentoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Novo agendamento" : "Editar agendamento"} description={isNew ? "Preencha os dados do agendamento" : `Editando: ${agendamento?.clientes?.nome ?? "agendamento"}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Data *</label>
            <Input type="date" value={form.data} onChange={(event) => upd("data", event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Hora *</label>
            <Input type="time" value={form.hora_inicio} onChange={(event) => upd("hora_inicio", event.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Cliente *</label>
            <Select
              placeholder="Selecione um cliente"
              options={clientes.map((cliente) => ({ value: cliente.id, label: cliente.nome }))}
              value={form.cliente_id}
              onChange={(event) => upd("cliente_id", event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Barbeiro *</label>
            <Select
              placeholder="Selecione"
              options={barbeiros.map((barbeiro) => ({ value: barbeiro.id, label: barbeiro.nome }))}
              value={form.barbeiro_id}
              onChange={(event) => {
                const barbeiro = barbeiros.find((item) => item.id === event.target.value)
                upd("barbeiro_id", event.target.value)
                upd("unidade_id", barbeiro?.unidade_id ?? fallbackUnidadeId)
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Status</label>
            <Select options={statusOptions} value={form.status} onChange={(event) => upd("status", event.target.value as StatusAgendamento)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Duração (min)</label>
            <Input type="number" value={form.duracao_min} onChange={(event) => upd("duracao_min", Number(event.target.value))} min={15} step={5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Valor (R$)</label>
            <Input type="number" value={form.valor_total} onChange={(event) => upd("valor_total", Number(event.target.value))} min={0} step={0.5} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(event) => upd("observacoes", event.target.value)}
              rows={2}
              placeholder="Preferências do cliente..."
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(agendamento?.id ? { id: agendamento.id } : {}),
              unidade_id: form.unidade_id || fallbackUnidadeId || null,
              cliente_id: form.cliente_id,
              barbeiro_id: form.barbeiro_id,
              data: form.data,
              hora_inicio: form.hora_inicio,
              duracao_min: form.duracao_min,
              status: form.status,
              valor_total: form.valor_total,
              observacoes: form.observacoes.trim() || null,
              origem: "sistema",
            })
          }
          disabled={!form.cliente_id || !form.barbeiro_id || !form.data || !form.hora_inicio}
        >
          {isNew ? "Agendar" : "Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

function CalendarioSemanal({ agendamentos }: { agendamentos: AgendamentoRow[] }) {
  const hoje = new Date()
  const diasArr = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(hoje)
    date.setDate(hoje.getDate() - hoje.getDay() + index)
    return {
      data: date.toISOString().slice(0, 10),
      dia: diasSemana[index],
      num: date.getDate(),
      isHoje: date.toDateString() === hoje.toDateString(),
    }
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="grid grid-cols-8 border-b border-[var(--border)]">
        <div className="px-2 py-3 text-xs text-[var(--muted-foreground)]" />
        {diasArr.map((dia) => (
          <div key={dia.data} className={`border-l border-[var(--border)] py-3 text-center ${dia.isHoje ? "bg-[var(--primary)]/5" : ""}`}>
            <p className="text-xs text-[var(--muted-foreground)]">{dia.dia}</p>
            <p className={`mt-0.5 text-sm font-bold ${dia.isHoje ? "text-[var(--primary)]" : ""}`}>{dia.num}</p>
          </div>
        ))}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {horasGrid.map((hora) => (
          <div key={hora} className="grid min-h-[52px] grid-cols-8 border-b border-[var(--border)]">
            <div className="shrink-0 px-2 py-2 text-right text-xs text-[var(--muted-foreground)]">{hora}</div>
            {diasArr.map((dia) => {
              const slots = agendamentos.filter((agendamento) => agendamento.data === dia.data && agendamento.hora_inicio.slice(0, 5) === hora)
              return (
                <div key={dia.data} className={`border-l border-[var(--border)] p-1 ${dia.isHoje ? "bg-[var(--primary)]/3" : ""}`}>
                  {slots.map((agendamento) => (
                    <div key={agendamento.id} className="mb-0.5 truncate rounded-md border-l-2 border-[var(--primary)] bg-[var(--muted)] px-1.5 py-1 text-[10px] font-medium text-[var(--muted-foreground)]">
                      {agendamento.clientes?.nome?.split(" ")[0] ?? "Cliente"}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgendamentosPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | "todos">("todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<AgendamentoRow | null>(null)
  const agendamentosKey = ["agendamentos"] as const

  const agendamentosQuery = useQuery({
    queryKey: agendamentosKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*, clientes(id,nome,telefone), barbeiros(id,nome)")
        .order("data", { ascending: true })
        .order("hora_inicio", { ascending: true })

      if (error) throw error
      return (data ?? []) as AgendamentoRow[]
    },
  })

  const clientesQuery = useQuery({
    queryKey: ["clientes", "select"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("clientes").select("*").neq("ativo", false).order("nome")
      if (error) throw error
      return (data ?? []) as ClienteRow[]
    },
  })

  const barbeirosQuery = useQuery({
    queryKey: ["barbeiros", "select"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("barbeiros").select("*").neq("ativo", false).order("nome")
      if (error) throw error
      return (data ?? []) as BarbeiroRow[]
    },
  })

  const upsert = useUpsertRow("agendamentos", agendamentosKey)
  const update = useUpdateRow("agendamentos", agendamentosKey)
  const agendamentos = useMemo(() => agendamentosQuery.data ?? [], [agendamentosQuery.data])
  const clientes = clientesQuery.data ?? []
  const barbeiros = barbeirosQuery.data ?? []
  const fallbackUnidadeId = user?.unidadeId ?? barbeiros[0]?.unidade_id ?? ""

  const filtrados = useMemo(
    () =>
      agendamentos.filter((agendamento) => {
        const matchBusca = (agendamento.clientes?.nome ?? "").toLowerCase().includes(busca.toLowerCase())
        const matchStatus = filtroStatus === "todos" || agendamento.status === filtroStatus
        return matchBusca && matchStatus
      }),
    [agendamentos, busca, filtroStatus]
  )

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  function openEdit(agendamento: AgendamentoRow) {
    setSelected(agendamento)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Agendamento atualizado!" : "Agendamento criado!" })
    setDrawerOpen(false)
  }

  async function cancelar(agendamento: AgendamentoRow) {
    if (!window.confirm(`Confirmar cancelamento do agendamento de ${agendamento.clientes?.nome ?? "cliente"}?`)) return
    await update.mutateAsync({ id: agendamento.id, payload: { status: "cancelado" } })
    toast({ type: "success", title: "Agendamento cancelado" })
  }

  const faturado = agendamentos.filter((agendamento) => agendamento.status === "concluido").reduce((sum, agendamento) => sum + Number(agendamento.valor_total ?? 0), 0)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Agendamentos" subtitle="Gestão da agenda" action={{ label: "Novo agendamento", onClick: openNew }} />

      <div className="flex-1 space-y-4 overflow-y-auto p-4 animate-fade-in lg:p-6">
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: "Total", value: agendamentos.length },
            { label: "Concluídos", value: agendamentos.filter((agendamento) => agendamento.status === "concluido").length, color: "text-emerald-600" },
            { label: "Pendentes", value: agendamentos.filter((agendamento) => agendamento.status === "agendado").length, color: "text-amber-500" },
            { label: "Faturado", value: formatCurrency(faturado), color: "text-[var(--primary)]" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-xl font-bold ${stat.color ?? ""}`}>{stat.value}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="lista">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="calendario">Calendário</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <Input leftIcon={<CalendarBlank weight="duotone" size={13} />} placeholder="Buscar cliente..." value={busca} onChange={(event) => setBusca(event.target.value)} className="h-8 w-44 text-xs" />
              <div className="flex gap-1">
                {([{ value: "todos", label: "Todos" }, ...statusOptions] as Array<{ value: StatusAgendamento | "todos"; label: string }>).map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFiltroStatus(item.value)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                      filtroStatus === item.value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="lista">
            <DataFeedback
              isLoading={agendamentosQuery.isLoading}
              error={agendamentosQuery.error}
              isEmpty={!agendamentosQuery.isLoading && filtrados.length === 0}
              onRetry={() => agendamentosQuery.refetch()}
            />

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="divide-y divide-[var(--border)]">
                {filtrados.map((agendamento, index) => {
                  const status = statusCfg[agendamento.status]
                  return (
                    <motion.div key={agendamento.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--muted)]/30">
                      <div className="w-12 shrink-0 text-center">
                        <p className="text-sm font-bold tabular-nums">{agendamento.hora_inicio.slice(0, 5)}</p>
                        <p className="flex items-center justify-center gap-0.5 text-[10px] text-[var(--muted-foreground)]">
                          <Clock weight="duotone" size={9} />
                          {agendamento.duracao_min ?? 30}m
                        </p>
                      </div>
                      <div className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                      <Avatar name={agendamento.clientes?.nome ?? "Cliente"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{agendamento.clientes?.nome ?? "Cliente não informado"}</p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">{agendamento.data} · {agendamento.barbeiros?.nome ?? "Sem barbeiro"}</p>
                        {agendamento.observacoes && <p className="text-[10px] italic text-amber-500">&quot;{agendamento.observacoes}&quot;</p>}
                      </div>
                      <span className="hidden shrink-0 text-sm font-bold text-[var(--primary)] sm:block">{formatCurrency(Number(agendamento.valor_total ?? 0))}</span>
                      <Badge variant={status.variant} className="hidden shrink-0 sm:flex">{status.label}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(agendamento)} className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100">
                        <PencilSimple weight="bold" size={13} />
                      </Button>
                      {agendamento.status !== "cancelado" && (
                        <Button size="sm" variant="ghost" onClick={() => cancelar(agendamento)} className="h-7 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                          Cancelar
                        </Button>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarioSemanal agendamentos={agendamentos} />
          </TabsContent>
        </Tabs>
      </div>

      {drawerOpen && (
        <AgendamentoDrawer
          key={selected?.id ?? "novo-agendamento"}
          agendamento={selected}
          open={drawerOpen}
          clientes={clientes}
          barbeiros={barbeiros}
          fallbackUnidadeId={fallbackUnidadeId}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
