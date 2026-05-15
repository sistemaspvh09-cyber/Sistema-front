"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, CurrencyDollar, PencilSimple, Plus, Receipt, TrendDown, TrendUp } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { ActiveFilterTabs, DataFeedback } from "@/components/dashboard/data-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { GradientCard } from "@/components/ui/gradient-card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { activeMatches, type ActiveFilter, type TransacaoRow, type UnidadeRow } from "@/lib/supabase-records"
import { useUpdateRow, useUpsertRow } from "@/lib/use-supabase-crud"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
type TipoTransacao = "receita" | "despesa"

interface TransacaoForm {
  unidade_id: string
  tipo: TipoTransacao
  descricao: string
  valor: number
  data: string
  categoria: string
  metodo: string
  ativo: boolean
}

const categoriasReceita = ["Serviço", "Produto", "Gorjeta", "Outro"]
const categoriasDespesa = ["Aluguel", "Energia", "Insumos", "Salários", "Manutenção", "Impostos", "Marketing", "Outro"]
const metodos = ["pix", "credito", "debito", "dinheiro", "transferencia"]
const metodoLabel: Record<string, string> = {
  pix: "PIX",
  credito: "Crédito",
  debito: "Débito",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  "": "—",
}
const metodoVariant: Record<string, BadgeVariant> = {
  pix: "success",
  credito: "default",
  debito: "warning",
  dinheiro: "secondary",
  transferencia: "secondary",
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normaliseTransacao(transacao: TransacaoRow | null, fallbackUnidadeId: string): TransacaoForm {
  if (!transacao) {
    return {
      unidade_id: fallbackUnidadeId,
      tipo: "receita",
      descricao: "",
      valor: 0,
      data: today(),
      categoria: "Serviço",
      metodo: "pix",
      ativo: true,
    }
  }

  return {
    unidade_id: transacao.unidade_id ?? fallbackUnidadeId,
    tipo: transacao.tipo,
    descricao: transacao.descricao,
    valor: Number(transacao.valor ?? 0),
    data: transacao.data,
    categoria: transacao.categoria ?? (transacao.tipo === "receita" ? "Serviço" : "Aluguel"),
    metodo: transacao.metodo ?? "pix",
    ativo: transacao.ativo !== false,
  }
}

function TransacaoDrawer({
  transacao,
  open,
  unidades,
  fallbackUnidadeId,
  onClose,
  onSave,
}: {
  transacao: TransacaoRow | null
  open: boolean
  unidades: UnidadeRow[]
  fallbackUnidadeId: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => void
}) {
  const isNew = !transacao?.id
  const [form, setForm] = useState<TransacaoForm>(() => normaliseTransacao(transacao, fallbackUnidadeId))

  function upd<K extends keyof TransacaoForm>(key: K, value: TransacaoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setTipo(tipo: TipoTransacao) {
    setForm((prev) => ({
      ...prev,
      tipo,
      categoria: tipo === "receita" ? "Serviço" : "Aluguel",
    }))
  }

  const categorias = form.tipo === "receita" ? categoriasReceita : categoriasDespesa
  const categoriaOptions = categorias.map((categoria) => ({ value: categoria, label: categoria }))
  const metodoOptions = metodos.map((metodo) => ({ value: metodo, label: metodoLabel[metodo] }))

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Nova transação" : "Editar transação"} description={isNew ? "Registre uma receita ou despesa manualmente" : ""} size="md">
      <div className="space-y-4">
        {unidades.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Unidade *</label>
            <Select options={unidades.map((u) => ({ value: u.id, label: u.nome }))} value={form.unidade_id} onChange={(event) => upd("unidade_id", event.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(["receita", "despesa"] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipo(tipo)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                form.tipo === tipo
                  ? tipo === "receita"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-red-500 bg-red-500/10 text-red-500"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40"
              }`}
            >
              {tipo === "receita" ? <ArrowUpRight weight="bold" size={16} /> : <ArrowDownRight weight="bold" size={16} />}
              {tipo === "receita" ? "Receita" : "Despesa"}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Descrição *</label>
          <Input value={form.descricao} onChange={(event) => upd("descricao", event.target.value)} placeholder="Ex: Venda de serviço, conta de energia..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Valor (R$) *</label>
            <Input type="number" value={form.valor} onChange={(event) => upd("valor", Number(event.target.value))} min={0} step={0.01} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Data *</label>
            <Input type="date" value={form.data} onChange={(event) => upd("data", event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Categoria</label>
            <Select options={categoriaOptions} value={form.categoria} onChange={(event) => upd("categoria", event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Método</label>
            <Select options={metodoOptions} value={form.metodo} onChange={(event) => upd("metodo", event.target.value)} />
          </div>
        </div>

        {form.valor > 0 && form.descricao && (
          <div className={`rounded-xl border p-3 ${form.tipo === "receita" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"}`}>
            <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">Preview</p>
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-medium">{form.descricao}</span>
              <span className={`text-base font-bold ${form.tipo === "receita" ? "text-emerald-600" : "text-red-500"}`}>
                {form.tipo === "receita" ? "+" : "-"}{formatCurrency(form.valor)}
              </span>
            </div>
          </div>
        )}
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() =>
            onSave({
              ...(transacao?.id ? { id: transacao.id } : {}),
              unidade_id: form.unidade_id || null,
              tipo: form.tipo,
              descricao: form.descricao.trim(),
              valor: form.valor,
              data: form.data,
              categoria: form.categoria,
              metodo: form.metodo,
              ativo: form.ativo,
            })
          }
          disabled={!form.descricao.trim() || form.valor <= 0 || !form.data}
        >
          {isNew ? "Registrar" : "Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function FinanceiroPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<TransacaoRow | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | "todos">("todos")
  const [filtroAtivo, setFiltroAtivo] = useState<ActiveFilter>("ativos")
  const transacoesKey = ["transacoes"] as const

  const transacoesQuery = useQuery({
    queryKey: transacoesKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("transacoes").select("*").order("data", { ascending: false })
      if (error) throw error
      return (data ?? []) as TransacaoRow[]
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

  const upsert = useUpsertRow("transacoes", transacoesKey)
  const update = useUpdateRow("transacoes", transacoesKey)
  const transacoes = useMemo(() => transacoesQuery.data ?? [], [transacoesQuery.data])
  const unidades = unidadesQuery.data ?? []
  const fallbackUnidadeId = user?.unidadeId ?? unidades[0]?.id ?? ""

  const filtradas = useMemo(
    () =>
      transacoes.filter((transacao) => {
        const matchTipo = filtroTipo === "todos" || transacao.tipo === filtroTipo
        const matchAtivo = activeMatches(transacao.ativo, filtroAtivo)
        return matchTipo && matchAtivo
      }),
    [filtroAtivo, filtroTipo, transacoes]
  )

  const transacoesAtivas = transacoes.filter((transacao) => transacao.ativo !== false)
  const receitaTotal = transacoesAtivas.filter((transacao) => transacao.tipo === "receita").reduce((sum, transacao) => sum + Number(transacao.valor ?? 0), 0)
  const despesaTotal = transacoesAtivas.filter((transacao) => transacao.tipo === "despesa").reduce((sum, transacao) => sum + Number(transacao.valor ?? 0), 0)
  const lucro = receitaTotal - despesaTotal
  const margem = receitaTotal > 0 ? Math.round((lucro / receitaTotal) * 100) : 0

  function openNew() {
    setSelected(null)
    setDrawerOpen(true)
  }

  function openEdit(transacao: TransacaoRow) {
    setSelected(transacao)
    setDrawerOpen(true)
  }

  async function handleSave(payload: Record<string, unknown>) {
    await upsert.mutateAsync(payload)
    toast({ type: "success", title: selected ? "Transação atualizada!" : "Transação registrada!" })
    setDrawerOpen(false)
  }

  async function toggleAtivo(transacao: TransacaoRow) {
    const next = transacao.ativo === false
    const action = next ? "reativar" : "desativar"
    if (!window.confirm(`Confirmar ${action} esta transação?`)) return
    await update.mutateAsync({ id: transacao.id, payload: { ativo: next } })
    toast({ type: "success", title: next ? "Transação reativada!" : "Transação desativada!" })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header title="Financeiro" subtitle="Controle financeiro completo" action={{ label: "Nova transação", onClick: openNew }} />

      <div className="flex-1 space-y-5 overflow-y-auto p-4 animate-fade-in lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GradientCard title="Receita do mês" value={formatCurrency(receitaTotal)} icon={TrendUp} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" delay={0} />
          <GradientCard title="Despesas do mês" value={formatCurrency(despesaTotal)} icon={TrendDown} gradient="from-red-500 via-rose-500 to-pink-600" glowClass="glow-rose" delay={0.06} />
          <GradientCard title="Lucro líquido" value={formatCurrency(lucro)} icon={CurrencyDollar} gradient="from-orange-500 via-orange-600 to-amber-600" glowClass="glow-orange" delay={0.12} />
          <GradientCard title="Margem de lucro" value={`${margem}%`} icon={Receipt} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" delay={0.18} />
        </div>

        <Tabs defaultValue="transacoes">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="transacoes">Transações</TabsTrigger>
              <TabsTrigger value="fluxo">Fluxo de caixa</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap gap-1.5">
              <ActiveFilterTabs value={filtroAtivo} onChange={setFiltroAtivo} />
              {[{ value: "todos", label: "Todos" }, { value: "receita", label: "Receitas" }, { value: "despesa", label: "Despesas" }].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFiltroTipo(item.value as TipoTransacao | "todos")}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    filtroTipo === item.value
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <TabsContent value="transacoes">
            <DataFeedback
              isLoading={transacoesQuery.isLoading}
              error={transacoesQuery.error}
              isEmpty={!transacoesQuery.isLoading && filtradas.length === 0}
              onRetry={() => transacoesQuery.refetch()}
            />

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)]/20 px-5 py-3.5">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600"><ArrowUpRight weight="bold" size={13} />{formatCurrency(receitaTotal)}</span>
                  <span className="text-[var(--border)]">|</span>
                  <span className="flex items-center gap-1 font-semibold text-red-500"><ArrowDownRight weight="bold" size={13} />{formatCurrency(despesaTotal)}</span>
                </div>
                <button onClick={openNew} className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                  <Plus weight="bold" size={12} />
                  Nova
                </button>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {filtradas.map((transacao, index) => {
                  const inactive = transacao.ativo === false
                  return (
                    <motion.div key={transacao.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className={`group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--muted)]/20 ${inactive ? "opacity-55" : ""}`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${transacao.tipo === "receita" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        {transacao.tipo === "receita" ? <ArrowUpRight weight="duotone" size={16} className="text-emerald-600" /> : <ArrowDownRight weight="duotone" size={16} className="text-red-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{transacao.descricao}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{formatDate(transacao.data)} · {transacao.categoria ?? "Sem categoria"}</p>
                      </div>
                      {transacao.metodo && <Badge variant={metodoVariant[transacao.metodo] ?? "secondary"} className="hidden shrink-0 text-[10px] sm:flex">{metodoLabel[transacao.metodo]}</Badge>}
                      <p className={`shrink-0 text-sm font-bold ${transacao.tipo === "receita" ? "text-emerald-600" : "text-red-500"}`}>
                        {transacao.tipo === "receita" ? "+" : "-"}{formatCurrency(Number(transacao.valor ?? 0))}
                      </p>
                      <button onClick={() => openEdit(transacao)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] group-hover:opacity-100">
                        <PencilSimple weight="bold" size={13} />
                      </button>
                      <Button size="sm" variant={inactive ? "secondary" : "ghost"} onClick={() => toggleAtivo(transacao)} className="h-7 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                        {inactive ? "Reativar" : "Desativar"}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fluxo">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <p className="text-sm font-semibold">Fluxo de caixa</p>
              </div>
              <div className="space-y-3 p-5">
                {[
                  { desc: "Entradas", valor: receitaTotal, tipo: "entrada" },
                  { desc: "Saídas", valor: -despesaTotal, tipo: "saida" },
                  { desc: "Saldo final", valor: lucro, tipo: "saldo" },
                ].map((item) => (
                  <div key={item.desc} className={`flex items-center justify-between rounded-xl border p-4 ${item.tipo === "entrada" ? "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20" : item.tipo === "saida" ? "border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950/20" : "border-[var(--border)] bg-[var(--muted)]"}`}>
                    <span className="text-sm font-medium">{item.desc}</span>
                    <span className={`text-base font-bold ${item.tipo === "entrada" ? "text-emerald-600" : item.tipo === "saida" ? "text-red-500" : "text-[var(--foreground)]"}`}>
                      {item.valor > 0 ? "+" : ""}{formatCurrency(item.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {drawerOpen && (
        <TransacaoDrawer
          key={selected?.id ?? "nova-transacao"}
          transacao={selected}
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
