"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  CalendarBlank,
  EnvelopeSimple,
  MagnifyingGlass,
  PencilSimple,
  Phone,
  Plus,
  Warning,
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { ActiveFilterTabs, DataFeedback } from "@/components/dashboard/data-state"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select } from "@/components/ui/select"
import { TierBadge } from "@/components/ui/tier-badge"
import { createClient } from "@/lib/client"
import { formatCurrency } from "@/lib/utils"
import { calcPontos, calcTier, diasSemVisita, pontosParaProximoTier, statusRisco } from "@/lib/vip"
import { activeMatches, asMoney, type ActiveFilter, type ClienteRow, type UnidadeRow } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

interface ClienteForm {
  unidade_id: string
  nome: string
  telefone: string
  email: string
  nascimento: string
  observacoes: string
  ativo: boolean
}

const emptyForm: ClienteForm = {
  unidade_id: "",
  nome: "",
  telefone: "",
  email: "",
  nascimento: "",
  observacoes: "",
  ativo: true,
}

const riscoConfig = {
  ativo: { label: "Ativo", color: "text-emerald-600", dot: "bg-emerald-500" },
  atencao: { label: "Atenção", color: "text-amber-500", dot: "bg-amber-500" },
  risco: { label: "Em risco", color: "text-orange-500", dot: "bg-orange-500" },
  perdido: { label: "Perdido", color: "text-red-500", dot: "bg-red-500" },
}

function normaliseCliente(cliente: ClienteRow | null, fallbackUnidadeId: string): ClienteForm {
  if (!cliente) return { ...emptyForm, unidade_id: fallbackUnidadeId }

  return {
    unidade_id: cliente.unidade_id ?? fallbackUnidadeId,
    nome: cliente.nome,
    telefone: cliente.telefone ?? "",
    email: cliente.email ?? "",
    nascimento: cliente.nascimento ?? "",
    observacoes: cliente.observacoes ?? "",
    ativo: cliente.ativo !== false,
  }
}

function ClienteDrawer({
  cliente,
  open,
  unidades,
  fallbackUnidadeId,
  onClose,
  onSave,
}: {
  cliente: ClienteRow | null
  open: boolean
  unidades: UnidadeRow[]
  fallbackUnidadeId: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !cliente?.id
  const [form, setForm] = useState<ClienteForm>(() => normaliseCliente(cliente, fallbackUnidadeId))

  function upd<K extends keyof ClienteForm>(key: K, value: ClienteForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const visitas = cliente?.total_visitas ?? 0
  const gasto = asMoney(cliente?.total_gasto)
  const tier = calcTier(visitas, gasto)
  const prox = pontosParaProximoTier(visitas, gasto)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Novo cliente" : "Editar cliente"}
      description={isNew ? "Cadastre um cliente no Supabase" : `Editando: ${cliente?.nome}`}
      size="md"
    >
      <div className="space-y-4 pb-4">
        {!isNew && (
          <div className={`rounded-2xl border ${tier.corBorda} bg-gradient-to-r ${tier.corGradient} p-4 text-white`}>
            <div className="mb-2 flex items-center justify-between">
              <TierBadge tier={tier} size="sm" />
              <span className="text-sm font-bold">{calcPontos(gasto, tier)} pts</span>
            </div>
            {prox.tier && (
              <>
                <p className="mb-1.5 text-xs opacity-80">
                  Faltam {prox.faltamVisitas} visitas e {formatCurrency(prox.faltamGasto)} para {prox.tier.label}
                </p>
                <Progress value={(prox.progressoVisitas + prox.progressoGasto) / 2} barClassName="bg-white/60" />
              </>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {unidades.length > 0 && (
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Unidade *</label>
              <Select
                options={unidades.map((u) => ({ value: u.id, label: u.nome }))}
                value={form.unidade_id}
                onChange={(event) => upd("unidade_id", event.target.value)}
              />
            </div>
          )}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome completo *</label>
            <Input value={form.nome} onChange={(event) => upd("nome", event.target.value)} placeholder="Nome do cliente" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone *</label>
            <Input value={form.telefone} onChange={(event) => upd("telefone", event.target.value)} placeholder="(11) 9xxxx-xxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nascimento</label>
            <Input type="date" value={form.nascimento} onChange={(event) => upd("nascimento", event.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">E-mail</label>
            <Input type="email" value={form.email} onChange={(event) => upd("email", event.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Total visitas</label>
            <Input value={String(visitas)} readOnly className="opacity-70" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Total gasto</label>
            <Input value={formatCurrency(gasto)} readOnly className="opacity-70" />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(event) => upd("observacoes", event.target.value)}
              rows={3}
              placeholder="Preferências, alergias, etc."
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(cliente?.id ? { id: cliente.id } : {}),
              unidade_id: form.unidade_id || null,
              nome: form.nome.trim(),
              telefone: form.telefone.trim(),
              email: form.email.trim() || null,
              nascimento: form.nascimento || null,
              observacoes: form.observacoes.trim() || null,
              ativo: form.ativo,
            })
          }
          disabled={!form.nome.trim() || !form.telefone.trim()}
        >
          {isNew ? "Cadastrar" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function ClientesPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [busca, setBusca] = useState("")
  const [filtroTier, setFiltroTier] = useState("todos")
  const [filtroAtivo, setFiltroAtivo] = useState<ActiveFilter>("ativos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<ClienteRow | null>(null)
  const clientesKey = ["clientes"] as const

  const clientesQuery = useQuery({
    queryKey: clientesKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data ?? []) as ClienteRow[]
    },
  })

  const unidadesQuery = useQuery({
    queryKey: ["unidades", "select"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("unidades").select("*").order("nome")
      if (error) throw error
      return (data ?? []) as UnidadeRow[]
    },
  })

  const upsert = useUpsertRow("clientes", clientesKey)
  const update = useUpdateRow("clientes", clientesKey)
  const unidades = unidadesQuery.data ?? []
  const fallbackUnidadeId = user?.unidadeId ?? unidades[0]?.id ?? ""
  const clientes = useMemo(() => clientesQuery.data ?? [], [clientesQuery.data])

  const filtrados = useMemo(
    () =>
      clientes.filter((cliente) => {
        const buscaNormalizada = busca.toLowerCase()
        const matchBusca =
          cliente.nome.toLowerCase().includes(buscaNormalizada) ||
          (cliente.telefone ?? "").includes(busca)
        const tier = calcTier(cliente.total_visitas ?? 0, asMoney(cliente.total_gasto)).tier
        const matchTier = filtroTier === "todos" || tier === filtroTier
        const matchAtivo = activeMatches(cliente.ativo, filtroAtivo)
        return matchBusca && matchTier && matchAtivo
      }),
    [busca, clientes, filtroAtivo, filtroTier]
  )

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  function openEdit(cliente: ClienteRow) {
    setSelected(cliente)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Cliente atualizado!" : "Cliente cadastrado!" })
    setDrawerOpen(false)
  }

  async function toggleActive(cliente: ClienteRow) {
    const next = cliente.ativo === false
    const action = next ? "reativar" : "desativar"
    if (!window.confirm(`Confirmar ${action} o cliente ${cliente.nome}?`)) return

    await update.mutateAsync({ id: cliente.id, payload: { ativo: next } })
    toast({ type: "success", title: next ? "Cliente reativado!" : "Cliente desativado!", description: cliente.nome })
  }

  const totalGasto = clientes.filter((c) => c.ativo !== false).reduce((sum, cliente) => sum + asMoney(cliente.total_gasto), 0)
  const platinum = clientes.filter((cliente) => calcTier(cliente.total_visitas ?? 0, asMoney(cliente.total_gasto)).tier === "platinum").length

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Clientes" subtitle={`${clientes.length} clientes`} action={{ label: "Novo cliente", onClick: openNew }} />

      <div className="flex-1 space-y-5 overflow-y-auto p-4 animate-fade-in lg:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total", value: clientes.length, color: "" },
            { label: "Platinum", value: platinum, color: "text-violet-500" },
            { label: "Ativos", value: clientes.filter((cliente) => cliente.ativo !== false).length, color: "text-emerald-600" },
            { label: "Faturamento", value: formatCurrency(totalGasto), color: "text-[var(--primary)]" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input leftIcon={<MagnifyingGlass weight="duotone" size={14} />} placeholder="Buscar..." value={busca} onChange={(event) => setBusca(event.target.value)} className="w-52" />
          <ActiveFilterTabs value={filtroAtivo} onChange={setFiltroAtivo} />
          <div className="flex flex-wrap gap-1.5">
            {[["todos", "Todos"], ["bronze", "Bronze"], ["silver", "Prata"], ["gold", "Ouro"], ["platinum", "Platinum"]].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFiltroTier(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  filtroTier === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <DataFeedback
          isLoading={clientesQuery.isLoading}
          error={clientesQuery.error}
          isEmpty={!clientesQuery.isLoading && filtrados.length === 0}
          onRetry={() => clientesQuery.refetch()}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((cliente, index) => {
            const tier = calcTier(cliente.total_visitas ?? 0, asMoney(cliente.total_gasto))
            const dias = cliente.ultima_visita ? diasSemVisita(cliente.ultima_visita) : 999
            const risco = statusRisco(dias)
            const riscoC = riscoConfig[risco]
            const pontos = calcPontos(asMoney(cliente.total_gasto), tier)
            const inactive = cliente.ativo === false

            return (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group overflow-hidden rounded-2xl border bg-[var(--card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${tier.corBorda} ${inactive ? "opacity-55" : ""}`}
              >
                <div className={`h-1 w-full bg-gradient-to-r ${tier.corGradient}`} />
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <Avatar name={cliente.nome} size="md" />
                    <div className="flex flex-col items-end gap-1">
                      <TierBadge tier={tier} size="xs" />
                      <div className={`flex items-center gap-1 text-[10px] font-medium ${riscoC.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${riscoC.dot}`} />
                        {inactive ? "Inativo" : riscoC.label}
                      </div>
                    </div>
                  </div>

                  <p className="truncate text-sm font-semibold">{cliente.nome}</p>
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <Phone weight="duotone" size={11} />
                      {cliente.telefone || "Sem telefone"}
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-1.5 truncate text-xs text-[var(--muted-foreground)]">
                        <EnvelopeSimple weight="duotone" size={11} />
                        {cliente.email}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <CalendarBlank weight="duotone" size={11} />
                      {cliente.ultima_visita ? (dias === 0 ? "Hoje" : dias === 1 ? "Ontem" : `${dias}d atrás`) : "Sem visitas"}
                    </div>
                    {cliente.observacoes && (
                      <div className="flex items-center gap-1.5 truncate text-xs italic text-amber-500">
                        <Warning weight="duotone" size={11} className="shrink-0" />
                        {cliente.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-sm font-bold">{cliente.total_visitas ?? 0}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">visitas</p>
                    </div>
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-xs font-bold text-[var(--primary)]">{formatCurrency(asMoney(cliente.total_gasto))}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">gasto</p>
                    </div>
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-sm font-bold">{pontos}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">pontos</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="sm" variant="outline" className="h-7 flex-1 gap-1 text-xs" onClick={() => openEdit(cliente)}>
                      <PencilSimple size={11} weight="bold" />
                      Editar
                    </Button>
                    <Button size="sm" variant={inactive ? "secondary" : "ghost"} className="h-7 px-2 text-xs" onClick={() => toggleActive(cliente)}>
                      {inactive ? "Reativar" : "Desativar"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={openNew}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current">
              <Plus weight="bold" size={18} />
            </div>
            <span className="text-sm font-medium">Novo cliente</span>
          </motion.button>
        </div>
      </div>

      {drawerOpen && (
        <ClienteDrawer
          key={selected?.id ?? "novo-cliente"}
          cliente={selected}
          open={drawerOpen}
          unidades={unidades}
          fallbackUnidadeId={fallbackUnidadeId}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
