"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowRight, Buildings, CheckCircle, MapPin, PencilSimple, Phone, Plus, Scissors, Trophy, Users, XCircle } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { ActiveFilterTabs, DataFeedback } from "@/components/dashboard/data-state"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { GradientCard } from "@/components/ui/gradient-card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/client"
import { activeMatches, type ActiveFilter, type BarbeiroRow, type UnidadeRow } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useToast } from "@/components/ui/toast"

interface UnidadeForm {
  nome: string
  slug: string
  endereco: string
  cidade: string
  telefone: string
  gerente: string
  cor: string
  ativa: boolean
}

const emptyForm: UnidadeForm = {
  nome: "",
  slug: "",
  endereco: "",
  cidade: "",
  telefone: "",
  gerente: "",
  cor: "from-orange-500 to-rose-600",
  ativa: true,
}

const cores = [
  "from-orange-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-teal-500 to-emerald-600",
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function normaliseUnidade(unidade: UnidadeRow | null): UnidadeForm {
  if (!unidade) return emptyForm

  return {
    nome: unidade.nome,
    slug: unidade.slug,
    endereco: unidade.endereco ?? "",
    cidade: unidade.cidade ?? "",
    telefone: unidade.telefone ?? "",
    gerente: unidade.gerente ?? "",
    cor: unidade.cor ?? emptyForm.cor,
    ativa: unidade.ativa !== false,
  }
}

function UnidadeDrawer({
  unidade,
  open,
  onClose,
  onSave,
}: {
  unidade: UnidadeRow | null
  open: boolean
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !unidade?.id
  const [form, setForm] = useState<UnidadeForm>(() => normaliseUnidade(unidade))

  function upd<K extends keyof UnidadeForm>(key: K, value: UnidadeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Nova unidade" : "Editar unidade"} description={isNew ? "Cadastrar nova filial/franquia" : `Editando: ${unidade?.nome}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome da unidade *</label>
            <Input value={form.nome} onChange={(event) => { upd("nome", event.target.value); if (isNew) upd("slug", slugify(event.target.value)) }} placeholder="Ex: Unidade Centro" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Slug *</label>
            <Input value={form.slug} onChange={(event) => upd("slug", slugify(event.target.value))} placeholder="centro" />
            <p className="text-[10px] text-[var(--muted-foreground)]">/agendar/{form.slug || "slug"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
            <Input value={form.telefone} onChange={(event) => upd("telefone", event.target.value)} placeholder="(11) 3456-7890" />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Endereço *</label>
            <Input value={form.endereco} onChange={(event) => upd("endereco", event.target.value)} placeholder="Rua, número, bairro" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Cidade / UF</label>
            <Input value={form.cidade} onChange={(event) => upd("cidade", event.target.value)} placeholder="São Paulo, SP" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Gerente responsável</label>
            <Input value={form.gerente} onChange={(event) => upd("gerente", event.target.value)} placeholder="Nome do gerente" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Cor de identidade visual</label>
          <div className="flex flex-wrap gap-2">
            {cores.map((cor) => (
              <button
                key={cor}
                onClick={() => upd("cor", cor)}
                className={`h-8 w-16 rounded-xl bg-gradient-to-r ${cor} transition-all ${form.cor === cor ? "scale-110 ring-2 ring-[var(--foreground)] ring-offset-2" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Unidade ativa</p>
            <p className="text-xs text-[var(--muted-foreground)]">Visível nos relatórios e links públicos</p>
          </div>
          <button
            onClick={() => upd("ativa", !form.ativa)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${form.ativa ? "border-emerald-200 text-emerald-600" : "border-red-200 text-red-500"}`}
          >
            {form.ativa ? "Ativa" : "Inativa"}
          </button>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(unidade?.id ? { id: unidade.id } : {}),
              nome: form.nome.trim(),
              slug: form.slug.trim(),
              endereco: form.endereco.trim() || null,
              cidade: form.cidade.trim() || null,
              telefone: form.telefone.trim() || null,
              gerente: form.gerente.trim() || null,
              cor: form.cor,
              ativa: form.ativa,
            })
          }
          disabled={!form.nome.trim() || !form.slug.trim() || !form.endereco.trim()}
        >
          {isNew ? "Criar unidade" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function UnidadesPage() {
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<UnidadeRow | null>(null)
  const [filtroAtivo, setFiltroAtivo] = useState<ActiveFilter>("ativos")
  const unidadesKey = ["unidades"] as const

  const unidadesQuery = useQuery({
    queryKey: unidadesKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("unidades").select("*").order("nome")
      if (error) throw error
      return (data ?? []) as UnidadeRow[]
    },
  })

  const barbeirosQuery = useQuery({
    queryKey: ["barbeiros", "metricas-unidades"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("barbeiros").select("id,unidade_id,ativo")
      if (error) throw error
      return (data ?? []) as BarbeiroRow[]
    },
  })

  const upsert = useUpsertRow("unidades", unidadesKey)
  const update = useUpdateRow("unidades", unidadesKey)
  const unidades = useMemo(() => unidadesQuery.data ?? [], [unidadesQuery.data])
  const barbeiros = barbeirosQuery.data ?? []
  const filtradas = useMemo(() => unidades.filter((unidade) => activeMatches(unidade.ativa, filtroAtivo)), [filtroAtivo, unidades])

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  function openEdit(unidade: UnidadeRow) {
    setSelected(unidade)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Unidade atualizada!" : "Unidade criada!" })
    setDrawerOpen(false)
  }

  async function toggleAtiva(unidade: UnidadeRow) {
    const next = unidade.ativa === false
    const action = next ? "reativar" : "desativar"
    if (!window.confirm(`Confirmar ${action} a unidade ${unidade.nome}?`)) return
    await update.mutateAsync({ id: unidade.id, payload: { ativa: next } })
    toast({ type: "success", title: next ? "Unidade reativada!" : "Unidade desativada!", description: unidade.nome })
  }

  const ativas = unidades.filter((unidade) => unidade.ativa !== false)
  const totalBarbeiros = barbeiros.filter((barbeiro) => barbeiro.ativo !== false).length
  const melhor = ativas[0]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Multi-unidades" subtitle="Gestão de filiais e franquias" action={{ label: "Nova unidade", onClick: openNew }} />

      <div className="flex-1 space-y-6 overflow-y-auto p-4 animate-fade-in lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GradientCard title="Unidades ativas" value={String(ativas.length)} icon={Buildings} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle={`${unidades.length} total`} delay={0} />
          <GradientCard title="Barbeiros na rede" value={String(totalBarbeiros)} icon={Scissors} gradient="from-violet-500 via-purple-600 to-fuchsia-700" glowClass="glow-purple" subtitle="profissionais ativos" delay={0.06} />
          <GradientCard title="Unidades inativas" value={String(unidades.length - ativas.length)} icon={Users} gradient="from-slate-500 via-slate-600 to-zinc-700" glowClass="glow-blue" subtitle="ocultas do fluxo padrão" delay={0.12} />
          <GradientCard title="Primeira ativa" value={melhor?.nome ?? "Nenhuma"} icon={Trophy} gradient="from-amber-400 via-amber-500 to-orange-500" glowClass="glow-orange" subtitle={melhor?.cidade ?? "Sem unidade ativa"} delay={0.18} />
        </div>

        <ActiveFilterTabs value={filtroAtivo} onChange={setFiltroAtivo} />

        <DataFeedback
          isLoading={unidadesQuery.isLoading}
          error={unidadesQuery.error}
          isEmpty={!unidadesQuery.isLoading && filtradas.length === 0}
          onRetry={() => unidadesQuery.refetch()}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((unidade, index) => {
            const inactive = unidade.ativa === false
            const totalDaUnidade = barbeiros.filter((barbeiro) => barbeiro.unidade_id === unidade.id && barbeiro.ativo !== false).length

            return (
              <motion.div
                key={unidade.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group overflow-hidden rounded-2xl border bg-[var(--card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${inactive ? "opacity-55" : ""}`}
              >
                <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${unidade.cor ?? emptyForm.cor}`}>
                  <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18 backdrop-blur-md">
                      <Buildings weight="duotone" size={20} className="text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-sm font-black">{unidade.nome}</p>
                      <p className="text-[10px] opacity-80">{unidade.cidade || "Sem cidade"}</p>
                    </div>
                  </div>
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {inactive ? (
                      <span className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/70 backdrop-blur-sm"><XCircle weight="fill" size={9} />Inativa</span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"><CheckCircle weight="fill" size={9} />Ativa</span>
                    )}
                    <button onClick={() => openEdit(unidade)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <PencilSimple weight="bold" size={11} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-sm font-bold">{totalDaUnidade}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">barbeiros</p>
                    </div>
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="truncate text-sm font-bold">{unidade.slug}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">slug</p>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1 text-xs text-[var(--muted-foreground)]">
                    {unidade.endereco && <p className="flex items-center gap-1.5"><MapPin weight="duotone" size={12} />{unidade.endereco}</p>}
                    {unidade.telefone && <p className="flex items-center gap-1.5"><Phone weight="duotone" size={12} />{unidade.telefone}</p>}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {unidade.ativa !== false && (
                      <a href={`/agendar/${unidade.slug}`} target="_blank" className="flex items-center gap-1 rounded-xl bg-[var(--primary)]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20">
                        Link <ArrowRight weight="bold" size={10} />
                      </a>
                    )}
                    <Button size="sm" variant={inactive ? "secondary" : "ghost"} onClick={() => toggleAtiva(unidade)} className="ml-auto h-7 text-xs">
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
            className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current">
              <Plus weight="bold" size={18} />
            </div>
            <span className="text-sm font-medium">Nova filial</span>
          </motion.button>
        </div>
      </div>

      {drawerOpen && (
        <UnidadeDrawer
          key={selected?.id ?? "nova-unidade"}
          unidade={selected}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
