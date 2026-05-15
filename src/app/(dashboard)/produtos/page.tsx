"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Package, PencilSimple, MagnifyingGlass, TrendDown, Warning } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { ActiveFilterTabs, DataFeedback } from "@/components/dashboard/data-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/client"
import { formatCurrency } from "@/lib/utils"
import { activeMatches, type ActiveFilter, type ProdutoRow, type UnidadeRow } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

interface ProdutoForm {
  unidade_id: string
  nome: string
  categoria: string
  preco: number
  custo: number
  estoque: number
  estoque_minimo: number
  ativo: boolean
}

const categorias = ["Todos", "Finalizador", "Barba", "Cabelo", "Tratamento", "Outro"]
const categoriaOptions = categorias.filter((categoria) => categoria !== "Todos").map((categoria) => ({ value: categoria, label: categoria }))
const emptyForm: ProdutoForm = {
  unidade_id: "",
  nome: "",
  categoria: "Finalizador",
  preco: 0,
  custo: 0,
  estoque: 0,
  estoque_minimo: 3,
  ativo: true,
}

function estoqueStatus(estoque: number, minimo: number) {
  if (estoque === 0) return { label: "Sem estoque", variant: "destructive" as const }
  if (estoque <= minimo) return { label: "Estoque baixo", variant: "warning" as const }
  return { label: "Normal", variant: "success" as const }
}

function normaliseProduto(produto: ProdutoRow | null, fallbackUnidadeId: string): ProdutoForm {
  if (!produto) return { ...emptyForm, unidade_id: fallbackUnidadeId }

  return {
    unidade_id: produto.unidade_id ?? fallbackUnidadeId,
    nome: produto.nome,
    categoria: produto.categoria ?? "Outro",
    preco: Number(produto.preco ?? 0),
    custo: Number(produto.custo ?? 0),
    estoque: produto.estoque ?? 0,
    estoque_minimo: produto.estoque_minimo ?? 3,
    ativo: produto.ativo !== false,
  }
}

function ProdutoDrawer({
  produto,
  open,
  unidades,
  fallbackUnidadeId,
  onClose,
  onSave,
}: {
  produto: ProdutoRow | null
  open: boolean
  unidades: UnidadeRow[]
  fallbackUnidadeId: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !produto?.id
  const [form, setForm] = useState<ProdutoForm>(() => normaliseProduto(produto, fallbackUnidadeId))

  function upd<K extends keyof ProdutoForm>(key: K, value: ProdutoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const margem = form.preco > 0 ? Math.round(((form.preco - form.custo) / form.preco) * 100) : 0

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Novo produto" : "Editar produto"} description={isNew ? "Cadastre o produto no Supabase" : `Editando: ${produto?.nome}`}>
      <div className="space-y-4">
        {unidades.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Unidade *</label>
            <Select options={unidades.map((u) => ({ value: u.id, label: u.nome }))} value={form.unidade_id} onChange={(event) => upd("unidade_id", event.target.value)} />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome *</label>
          <Input value={form.nome} onChange={(event) => upd("nome", event.target.value)} placeholder="Nome do produto" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Categoria</label>
            <Select options={categoriaOptions} value={form.categoria} onChange={(event) => upd("categoria", event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Estoque mínimo</label>
            <Input type="number" value={form.estoque_minimo} onChange={(event) => upd("estoque_minimo", Number(event.target.value))} min={0} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Preço de venda (R$) *</label>
            <Input type="number" value={form.preco} onChange={(event) => upd("preco", Number(event.target.value))} min={0} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Custo (R$)</label>
            <Input type="number" value={form.custo} onChange={(event) => upd("custo", Number(event.target.value))} min={0} step={0.5} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Estoque atual</label>
            <Input type="number" value={form.estoque} onChange={(event) => upd("estoque", Number(event.target.value))} min={0} />
          </div>
        </div>

        {form.preco > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium">Margem de lucro</span>
              <span className={`text-sm font-bold ${margem >= 40 ? "text-emerald-600" : margem >= 20 ? "text-amber-500" : "text-red-500"}`}>{margem}%</span>
            </div>
            <Progress value={margem} max={80} barClassName={margem >= 40 ? "bg-emerald-500" : margem >= 20 ? "bg-amber-500" : "bg-red-500"} />
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Produto ativo</p>
            <p className="text-xs text-[var(--muted-foreground)]">Aparece no PDV</p>
          </div>
          <Switch checked={form.ativo} onCheckedChange={(checked) => upd("ativo", checked)} />
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(produto?.id ? { id: produto.id } : {}),
              unidade_id: form.unidade_id || null,
              nome: form.nome.trim(),
              categoria: form.categoria,
              preco: form.preco,
              custo: form.custo,
              estoque: form.estoque,
              estoque_minimo: form.estoque_minimo,
              ativo: form.ativo,
            })
          }
          disabled={!form.nome.trim() || form.preco <= 0}
        >
          {isNew ? "Cadastrar" : "Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function ProdutosPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [busca, setBusca] = useState("")
  const [catFiltro, setCatFiltro] = useState("Todos")
  const [filtroAtivo, setFiltroAtivo] = useState<ActiveFilter>("ativos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<ProdutoRow | null>(null)
  const produtosKey = ["produtos"] as const

  const produtosQuery = useQuery({
    queryKey: produtosKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("produtos").select("*").order("nome")
      if (error) throw error
      return (data ?? []) as ProdutoRow[]
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

  const upsert = useUpsertRow("produtos", produtosKey)
  const update = useUpdateRow("produtos", produtosKey)
  const produtos = useMemo(() => produtosQuery.data ?? [], [produtosQuery.data])
  const unidades = unidadesQuery.data ?? []
  const fallbackUnidadeId = user?.unidadeId ?? unidades[0]?.id ?? ""

  const filtrados = useMemo(
    () =>
      produtos.filter((produto) => {
        const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase())
        const matchCat = catFiltro === "Todos" || produto.categoria === catFiltro
        const matchAtivo = activeMatches(produto.ativo, filtroAtivo)
        return matchBusca && matchCat && matchAtivo
      }),
    [busca, catFiltro, filtroAtivo, produtos]
  )

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  function openEdit(produto: ProdutoRow) {
    setSelected(produto)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Produto atualizado!" : "Produto cadastrado!" })
    setDrawerOpen(false)
  }

  async function toggleAtivo(produto: ProdutoRow) {
    const next = produto.ativo === false
    const action = next ? "reativar" : "desativar"
    if (!window.confirm(`Confirmar ${action} o produto ${produto.nome}?`)) return
    await update.mutateAsync({ id: produto.id, payload: { ativo: next } })
    toast({ type: "success", title: next ? "Produto reativado!" : "Produto desativado!", description: produto.nome })
  }

  const semEstoque = produtos.filter((produto) => produto.ativo !== false && (produto.estoque ?? 0) === 0).length
  const baixo = produtos.filter((produto) => produto.ativo !== false && (produto.estoque ?? 0) > 0 && (produto.estoque ?? 0) <= (produto.estoque_minimo ?? 0)).length

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Produtos" subtitle="Controle de estoque" action={{ label: "Novo produto", onClick: openNew }} />

      <div className="flex-1 space-y-4 overflow-y-auto p-4 animate-fade-in lg:p-6">
        {(semEstoque > 0 || baixo > 0) && (
          <div className="flex flex-wrap gap-3">
            {semEstoque > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                <Warning weight="duotone" size={16} className="shrink-0" />
                <strong>{semEstoque}</strong> sem estoque
              </div>
            )}
            {baixo > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                <TrendDown weight="duotone" size={16} className="shrink-0" />
                <strong>{baixo}</strong> com estoque baixo
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Input leftIcon={<MagnifyingGlass weight="duotone" size={14} />} placeholder="Buscar produto..." value={busca} onChange={(event) => setBusca(event.target.value)} className="w-56" />
          <ActiveFilterTabs value={filtroAtivo} onChange={setFiltroAtivo} />
          <div className="flex flex-wrap gap-1.5">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setCatFiltro(categoria)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  catFiltro === categoria
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        <DataFeedback
          isLoading={produtosQuery.isLoading}
          error={produtosQuery.error}
          isEmpty={!produtosQuery.isLoading && filtrados.length === 0}
          onRetry={() => produtosQuery.refetch()}
        />

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                {["Produto", "Categoria", "Preço", "Margem", "Estoque", "Status", ""].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtrados.map((produto) => {
                const estoque = produto.estoque ?? 0
                const minimo = produto.estoque_minimo ?? 0
                const status = estoqueStatus(estoque, minimo)
                const preco = Number(produto.preco ?? 0)
                const custo = Number(produto.custo ?? 0)
                const margem = preco > 0 ? Math.round(((preco - custo) / preco) * 100) : 0
                const inactive = produto.ativo === false

                return (
                  <tr key={produto.id} className={`transition-colors hover:bg-[var(--muted)]/30 ${inactive ? "opacity-55" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)]">
                          <Package weight="duotone" size={15} className="text-[var(--muted-foreground)]" />
                        </div>
                        <span className="font-medium">{produto.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{produto.categoria ?? "Outro"}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-[var(--primary)]">{formatCurrency(preco)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-xs font-semibold">{margem}%</span>
                        <Progress value={margem} max={80} className="w-16" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${estoque === 0 ? "text-red-500" : estoque <= minimo ? "text-amber-500" : ""}`}>{estoque}</span>
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">/ mín {minimo}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={status.variant}>{inactive ? "Inativo" : status.label}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(produto)} className="h-7 w-7 p-0">
                          <PencilSimple weight="bold" size={13} />
                        </Button>
                        <Button size="sm" variant={inactive ? "secondary" : "ghost"} onClick={() => toggleAtivo(produto)} className="h-7 text-xs">
                          {inactive ? "Reativar" : "Desativar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && (
        <ProdutoDrawer
          key={selected?.id ?? "novo-produto"}
          produto={selected}
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
