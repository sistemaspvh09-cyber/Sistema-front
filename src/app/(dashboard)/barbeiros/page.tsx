"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ChartLineUp, EnvelopeSimple, PencilSimple, Phone, Plus, Scissors, Star, Trophy } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { ActiveFilterTabs, DataFeedback } from "@/components/dashboard/data-state"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { GradientCard } from "@/components/ui/gradient-card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/client"
import { formatCurrency } from "@/lib/utils"
import { activeMatches, type ActiveFilter, type BarbeiroRow, type UnidadeRow } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

const especialidadesOpt = ["Corte", "Barba", "Coloração", "Degradê", "Hidratação", "Tratamento", "Sobrancelha", "Relaxamento"]

interface BarbeiroForm {
  unidade_id: string
  nome: string
  email: string
  telefone: string
  especialidades: string[]
  ativo: boolean
  comissao: number
  meta_mensal: number
  avaliacao: number
  experiencia: string
}

const emptyForm: BarbeiroForm = {
  unidade_id: "",
  nome: "",
  email: "",
  telefone: "",
  especialidades: [],
  ativo: true,
  comissao: 35,
  meta_mensal: 30,
  avaliacao: 5,
  experiencia: "",
}

function normaliseBarbeiro(barbeiro: BarbeiroRow | null, fallbackUnidadeId: string): BarbeiroForm {
  if (!barbeiro) return { ...emptyForm, unidade_id: fallbackUnidadeId }

  return {
    unidade_id: barbeiro.unidade_id ?? fallbackUnidadeId,
    nome: barbeiro.nome,
    email: barbeiro.email ?? "",
    telefone: barbeiro.telefone ?? "",
    especialidades: barbeiro.especialidades ?? [],
    ativo: barbeiro.ativo !== false,
    comissao: barbeiro.comissao ?? 35,
    meta_mensal: barbeiro.meta_mensal ?? 30,
    avaliacao: Number(barbeiro.avaliacao ?? 5),
    experiencia: barbeiro.experiencia ?? "",
  }
}

function BarbeiroDrawer({
  barbeiro,
  open,
  unidades,
  fallbackUnidadeId,
  onClose,
  onSave,
}: {
  barbeiro: BarbeiroRow | null
  open: boolean
  unidades: UnidadeRow[]
  fallbackUnidadeId: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !barbeiro?.id
  const [form, setForm] = useState<BarbeiroForm>(() => normaliseBarbeiro(barbeiro, fallbackUnidadeId))

  function upd<K extends keyof BarbeiroForm>(key: K, value: BarbeiroForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleEspecialidade(especialidade: string) {
    setForm((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidade)
        ? prev.especialidades.filter((item) => item !== especialidade)
        : [...prev.especialidades, especialidade],
    }))
  }

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Novo barbeiro" : "Editar barbeiro"} description={isNew ? "Cadastrar novo profissional" : `Editando: ${barbeiro?.nome}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {unidades.length > 0 && (
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Unidade *</label>
              <Select options={unidades.map((u) => ({ value: u.id, label: u.nome }))} value={form.unidade_id} onChange={(event) => upd("unidade_id", event.target.value)} />
            </div>
          )}
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome completo *</label>
            <Input value={form.nome} onChange={(event) => upd("nome", event.target.value)} placeholder="Nome do barbeiro" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">E-mail *</label>
            <Input type="email" value={form.email} onChange={(event) => upd("email", event.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
            <Input value={form.telefone} onChange={(event) => upd("telefone", event.target.value)} placeholder="(11) 9xxxx-xxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Comissão (%)</label>
            <Input type="number" value={form.comissao} onChange={(event) => upd("comissao", Number(event.target.value))} min={0} max={100} step={1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Meta mensal</label>
            <Input type="number" value={form.meta_mensal} onChange={(event) => upd("meta_mensal", Number(event.target.value))} min={0} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Avaliação</label>
            <Input type="number" value={form.avaliacao} onChange={(event) => upd("avaliacao", Number(event.target.value))} min={0} max={5} step={0.1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Experiência</label>
            <Input value={form.experiencia} onChange={(event) => upd("experiencia", event.target.value)} placeholder="Ex: 3 anos" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Especialidades</label>
          <div className="flex flex-wrap gap-1.5">
            {especialidadesOpt.map((especialidade) => (
              <button
                key={especialidade}
                onClick={() => toggleEspecialidade(especialidade)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  form.especialidades.includes(especialidade)
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                }`}
              >
                {especialidade}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Barbeiro ativo</p>
            <p className="text-xs text-[var(--muted-foreground)]">Aparece na agenda e PDV</p>
          </div>
          <Switch checked={form.ativo} onCheckedChange={(checked) => upd("ativo", checked)} />
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(barbeiro?.id ? { id: barbeiro.id } : {}),
              unidade_id: form.unidade_id || null,
              nome: form.nome.trim(),
              email: form.email.trim() || null,
              telefone: form.telefone.trim() || null,
              especialidades: form.especialidades,
              ativo: form.ativo,
              comissao: form.comissao,
              meta_mensal: form.meta_mensal,
              avaliacao: form.avaliacao,
              experiencia: form.experiencia.trim() || null,
            })
          }
          disabled={!form.nome.trim() || !form.email.trim()}
        >
          {isNew ? "Cadastrar" : "Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function BarbeirosPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<BarbeiroRow | null>(null)
  const [filtroAtivo, setFiltroAtivo] = useState<ActiveFilter>("ativos")
  const barbeirosKey = ["barbeiros"] as const

  const barbeirosQuery = useQuery({
    queryKey: barbeirosKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("barbeiros").select("*").order("nome")
      if (error) throw error
      return (data ?? []) as BarbeiroRow[]
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

  const upsert = useUpsertRow("barbeiros", barbeirosKey)
  const update = useUpdateRow("barbeiros", barbeirosKey)
  const lista = useMemo(() => barbeirosQuery.data ?? [], [barbeirosQuery.data])
  const unidades = unidadesQuery.data ?? []
  const fallbackUnidadeId = user?.unidadeId ?? unidades[0]?.id ?? ""

  const filtrados = useMemo(
    () => lista.filter((barbeiro) => activeMatches(barbeiro.ativo, filtroAtivo)),
    [filtroAtivo, lista]
  )

  function openEdit(barbeiro: BarbeiroRow) {
    setSelected(barbeiro)
    setDrawerOpen(true)
  }

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Barbeiro atualizado!" : "Barbeiro cadastrado!" })
    setDrawerOpen(false)
  }

  async function toggleAtivo(barbeiro: BarbeiroRow) {
    const next = barbeiro.ativo === false
    const action = next ? "reativar" : "desativar"
    if (!window.confirm(`Confirmar ${action} o barbeiro ${barbeiro.nome}?`)) return
    await update.mutateAsync({ id: barbeiro.id, payload: { ativo: next } })
    toast({ type: "success", title: next ? "Barbeiro reativado!" : "Barbeiro desativado!", description: barbeiro.nome })
  }

  const ativos = lista.filter((barbeiro) => barbeiro.ativo !== false)
  const metaTotal = ativos.reduce((sum, barbeiro) => sum + (barbeiro.meta_mensal ?? 0), 0)
  const comissaoMedia = ativos.length ? Math.round(ativos.reduce((sum, barbeiro) => sum + (barbeiro.comissao ?? 0), 0) / ativos.length) : 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Barbeiros" subtitle={`${lista.length} profissionais`} action={{ label: "Novo barbeiro", onClick: openNew }} />

      <div className="flex-1 space-y-5 overflow-y-auto p-4 animate-fade-in lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GradientCard title="Barbeiros ativos" value={String(ativos.length)} icon={Scissors} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle={`de ${lista.length} total`} delay={0} />
          <GradientCard title="Meta total" value={String(metaTotal)} icon={ChartLineUp} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle="atendimentos/mês" delay={0.06} />
          <GradientCard title="Comissão média" value={`${comissaoMedia}%`} icon={Trophy} gradient="from-orange-500 via-orange-600 to-rose-600" glowClass="glow-orange" subtitle="profissionais ativos" delay={0.12} />
        </div>

        <ActiveFilterTabs value={filtroAtivo} onChange={setFiltroAtivo} />

        <DataFeedback
          isLoading={barbeirosQuery.isLoading}
          error={barbeirosQuery.error}
          isEmpty={!barbeirosQuery.isLoading && filtrados.length === 0}
          onRetry={() => barbeirosQuery.refetch()}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((barbeiro, index) => {
            const inactive = barbeiro.ativo === false
            const meta = barbeiro.meta_mensal ?? 0

            return (
              <motion.div
                key={barbeiro.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group overflow-hidden rounded-2xl border bg-[var(--card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${inactive ? "opacity-60" : ""}`}
              >
                <div className="h-1 w-full" style={{ background: inactive ? "var(--muted-foreground)" : "var(--primary)" }} />
                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={barbeiro.nome} size="lg" />
                      <div>
                        <p className="text-sm font-semibold">{barbeiro.nome}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{barbeiro.experiencia || "Sem experiência informada"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAtivo(barbeiro)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inactive ? "border-emerald-200 text-emerald-600" : "border-red-200 text-red-500"}`}
                    >
                      {inactive ? "Reativar" : "Desativar"}
                    </button>
                  </div>

                  <div className="mb-3 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, ratingIndex) => (
                      <Star key={ratingIndex} weight={ratingIndex < Math.floor(Number(barbeiro.avaliacao ?? 0)) ? "fill" : "regular"} size={13} className={ratingIndex < Math.floor(Number(barbeiro.avaliacao ?? 0)) ? "text-amber-400" : "text-[var(--border)]"} />
                    ))}
                    <span className="ml-1 text-xs font-semibold">{Number(barbeiro.avaliacao ?? 0).toFixed(1)}</span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {(barbeiro.especialidades ?? []).map((especialidade) => (
                      <Badge key={especialidade} variant="secondary" className="text-[10px]">{especialidade}</Badge>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-[var(--muted-foreground)]">Meta mensal</span>
                      <span className="font-semibold">{meta} atend.</span>
                    </div>
                    <Progress value={meta} max={Math.max(meta, 30)} />
                  </div>

                  <div className="mb-3 flex items-center justify-between rounded-xl bg-[var(--muted)] px-3 py-2.5">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Comissão</p>
                      <p className="text-sm font-bold text-[var(--primary)]">{barbeiro.comissao ?? 0}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted-foreground)]">Estimativa base</p>
                      <p className="text-sm font-bold">{formatCurrency((barbeiro.comissao ?? 0) * 10)}</p>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    {barbeiro.telefone && <a href={`tel:${barbeiro.telefone}`} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><Phone weight="duotone" size={11} />{barbeiro.telefone}</a>}
                    {barbeiro.email && <a href={`mailto:${barbeiro.email}`} className="flex items-center gap-1.5 truncate text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><EnvelopeSimple weight="duotone" size={11} />{barbeiro.email}</a>}
                  </div>

                  <Button size="sm" variant="outline" className="h-7 w-full gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100" onClick={() => openEdit(barbeiro)}>
                    <PencilSimple weight="bold" size={11} />
                    Editar barbeiro
                  </Button>
                </div>
              </motion.div>
            )
          })}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={openNew}
            className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current">
              <Plus weight="bold" size={18} />
            </div>
            <span className="text-sm font-medium">Novo barbeiro</span>
          </motion.button>
        </div>
      </div>

      {drawerOpen && (
        <BarbeiroDrawer
          key={selected?.id ?? "novo-barbeiro"}
          barbeiro={selected}
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
