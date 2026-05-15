"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Clock, PencilSimple, Plus, Scissors } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { ActiveFilterTabs, DataFeedback } from "@/components/dashboard/data-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/client"
import { formatCurrency } from "@/lib/utils"
import { activeMatches, type ActiveFilter, type ServicoRow, type UnidadeRow } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

const catOptions = [
  { value: "corte", label: "Corte" },
  { value: "barba", label: "Barba" },
  { value: "combo", label: "Combo" },
  { value: "coloracao", label: "Coloração" },
  { value: "tratamento", label: "Tratamento" },
  { value: "outros", label: "Outros" },
]

const catColor: Record<string, string> = {
  corte: "bg-blue-500/10 text-blue-600 border-blue-200",
  barba: "bg-orange-500/10 text-orange-600 border-orange-200",
  combo: "bg-purple-500/10 text-purple-600 border-purple-200",
  coloracao: "bg-pink-500/10 text-pink-600 border-pink-200",
  tratamento: "bg-teal-500/10 text-teal-600 border-teal-200",
  outros: "bg-gray-500/10 text-gray-600 border-gray-200",
}

interface ServicoForm {
  unidade_id: string
  nome: string
  categoria: string
  preco: number
  duracao_minutos: number
  ativo: boolean
  popular: boolean
}

const emptyForm: ServicoForm = {
  unidade_id: "",
  nome: "",
  categoria: "corte",
  preco: 0,
  duracao_minutos: 30,
  ativo: true,
  popular: false,
}

function normaliseServico(servico: ServicoRow | null, fallbackUnidadeId: string): ServicoForm {
  if (!servico) return { ...emptyForm, unidade_id: fallbackUnidadeId }

  return {
    unidade_id: servico.unidade_id ?? fallbackUnidadeId,
    nome: servico.nome,
    categoria: servico.categoria,
    preco: Number(servico.preco ?? 0),
    duracao_minutos: servico.duracao_minutos,
    ativo: servico.ativo !== false,
    popular: Boolean(servico.popular),
  }
}

function ServicoDrawer({
  servico,
  open,
  unidades,
  fallbackUnidadeId,
  onClose,
  onSave,
}: {
  servico: ServicoRow | null
  open: boolean
  unidades: UnidadeRow[]
  fallbackUnidadeId: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !servico?.id
  const [form, setForm] = useState<ServicoForm>(() => normaliseServico(servico, fallbackUnidadeId))

  function upd<K extends keyof ServicoForm>(key: K, value: ServicoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const color = catColor[form.categoria] ?? catColor.outros

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Novo serviço" : "Editar serviço"}
      description={isNew ? "Cadastre o serviço no Supabase" : `Editando: ${servico?.nome}`}
    >
      <div className="space-y-4">
        {unidades.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Unidade *</label>
            <Select options={unidades.map((u) => ({ value: u.id, label: u.nome }))} value={form.unidade_id} onChange={(event) => upd("unidade_id", event.target.value)} />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome do serviço *</label>
          <Input value={form.nome} onChange={(event) => upd("nome", event.target.value)} placeholder="Ex: Corte Masculino" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Categoria *</label>
            <Select options={catOptions} value={form.categoria} onChange={(event) => upd("categoria", event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Duração (min) *</label>
            <Input type="number" value={form.duracao_minutos} onChange={(event) => upd("duracao_minutos", Number(event.target.value))} min={5} step={5} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Preço (R$) *</label>
            <Input type="number" value={form.preco} onChange={(event) => upd("preco", Number(event.target.value))} min={0} step={0.5} />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Serviço ativo</p>
              <p className="text-xs text-[var(--muted-foreground)]">Aparece no PDV e agendamentos</p>
            </div>
            <Switch checked={form.ativo} onCheckedChange={(checked) => upd("ativo", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Popular / Destaque</p>
              <p className="text-xs text-[var(--muted-foreground)]">Exibido em primeiro no PDV</p>
            </div>
            <Switch checked={form.popular} onCheckedChange={(checked) => upd("popular", checked)} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">Preview no PDV</p>
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${color}`}>
            <Scissors weight="duotone" size={14} />
            {form.nome || "Nome do serviço"}
            <span className="ml-1 font-bold text-[var(--primary)]">{formatCurrency(form.preco)}</span>
            <span className="flex items-center gap-0.5 text-xs opacity-70"><Clock size={11} />{form.duracao_minutos}min</span>
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(servico?.id ? { id: servico.id } : {}),
              unidade_id: form.unidade_id || null,
              nome: form.nome.trim(),
              categoria: form.categoria,
              preco: form.preco,
              duracao_minutos: form.duracao_minutos,
              ativo: form.ativo,
              popular: form.popular,
            })
          }
          disabled={!form.nome.trim() || form.preco <= 0 || form.duracao_minutos <= 0}
        >
          {isNew ? "Criar serviço" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function ServicosPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [catFiltro, setCatFiltro] = useState("todos")
  const [filtroAtivo, setFiltroAtivo] = useState<ActiveFilter>("ativos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<ServicoRow | null>(null)
  const servicosKey = ["servicos"] as const

  const servicosQuery = useQuery({
    queryKey: servicosKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("servicos").select("*").order("nome")
      if (error) throw error
      return (data ?? []) as ServicoRow[]
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

  const upsert = useUpsertRow("servicos", servicosKey)
  const update = useUpdateRow("servicos", servicosKey)
  const lista = useMemo(() => servicosQuery.data ?? [], [servicosQuery.data])
  const unidades = unidadesQuery.data ?? []
  const fallbackUnidadeId = user?.unidadeId ?? unidades[0]?.id ?? ""

  const filtrados = useMemo(
    () =>
      lista.filter((servico) => {
        const matchCat = catFiltro === "todos" || servico.categoria === catFiltro
        const matchAtivo = activeMatches(servico.ativo, filtroAtivo)
        return matchCat && matchAtivo
      }),
    [catFiltro, filtroAtivo, lista]
  )

  function openEdit(servico: ServicoRow) {
    setSelected(servico)
    setDrawerOpen(true)
  }

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Serviço atualizado!" : "Serviço criado!" })
    setDrawerOpen(false)
  }

  async function toggleAtivo(servico: ServicoRow) {
    const next = servico.ativo === false
    const action = next ? "reativar" : "desativar"
    if (!window.confirm(`Confirmar ${action} o serviço ${servico.nome}?`)) return
    await update.mutateAsync({ id: servico.id, payload: { ativo: next } })
    toast({ type: "success", title: next ? "Serviço reativado!" : "Serviço desativado!", description: servico.nome })
  }

  const cats = ["todos", ...catOptions.map((item) => item.value)]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Serviços" subtitle={`${lista.filter((servico) => servico.ativo !== false).length} ativos`} action={{ label: "Novo serviço", onClick: openNew }} />

      <div className="flex-1 overflow-y-auto p-4 animate-fade-in lg:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <ActiveFilterTabs value={filtroAtivo} onChange={setFiltroAtivo} />
          {cats.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFiltro(cat)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                catFiltro === cat
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
              }`}
            >
              {cat === "todos" ? "Todos" : catOptions.find((item) => item.value === cat)?.label}
              <span className={`rounded-full px-1.5 py-px text-[9px] font-bold ${catFiltro === cat ? "bg-white/20 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                {cat === "todos" ? lista.length : lista.filter((servico) => servico.categoria === cat).length}
              </span>
            </button>
          ))}
        </div>

        <DataFeedback
          isLoading={servicosQuery.isLoading}
          error={servicosQuery.error}
          isEmpty={!servicosQuery.isLoading && filtrados.length === 0}
          onRetry={() => servicosQuery.refetch()}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((servico, index) => {
            const color = catColor[servico.categoria] ?? catColor.outros
            const inactive = servico.ativo === false
            return (
              <motion.div
                key={servico.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group overflow-hidden rounded-2xl border bg-[var(--card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${inactive ? "opacity-55" : ""}`}
              >
                <div className={`h-1 w-full ${inactive ? "bg-[var(--muted)]" : "bg-[var(--primary)]"}`} />
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${color}`}>
                      <Scissors weight="duotone" size={16} />
                    </div>
                    <div className="flex items-center gap-2">
                      {servico.popular && <Badge variant="default" className="px-1.5 py-px text-[9px]">Top</Badge>}
                      <button
                        onClick={() => toggleAtivo(servico)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inactive ? "border-emerald-200 text-emerald-600" : "border-red-200 text-red-500"}`}
                      >
                        {inactive ? "Reativar" : "Desativar"}
                      </button>
                    </div>
                  </div>

                  <p className="mb-1 text-sm font-semibold">{servico.nome}</p>
                  <Badge variant="secondary" className="mb-3 text-[10px]">
                    {catOptions.find((item) => item.value === servico.categoria)?.label ?? servico.categoria}
                  </Badge>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-[var(--primary)]">{formatCurrency(Number(servico.preco ?? 0))}</span>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Clock weight="duotone" size={12} />
                      {servico.duracao_minutos}min
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="h-7 w-full gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100" onClick={() => openEdit(servico)}>
                    <PencilSimple weight="bold" size={11} />
                    Editar serviço
                  </Button>
                </div>
              </motion.div>
            )
          })}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={openNew}
            className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current">
              <Plus weight="bold" size={18} />
            </div>
            <span className="text-sm font-medium">Novo serviço</span>
          </motion.button>
        </div>
      </div>

      {drawerOpen && (
        <ServicoDrawer
          key={selected?.id ?? "novo-servico"}
          servico={selected}
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
