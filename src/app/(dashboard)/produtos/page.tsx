"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Warning, Package, TrendDown, Plus, MagnifyingGlass, PencilSimple, ArrowCounterClockwise } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Produto {
  id: string; nome: string; categoria: string; preco: number
  custo: number; estoque: number; estoqueMinimo: number; vendidos: number; ativo: boolean
}

const produtosIniciais: Produto[] = [
  { id:"p1", nome:"Pomada Matte",         categoria:"Finalizador", preco:45, custo:18, estoque:12, estoqueMinimo:5, vendidos:34, ativo:true },
  { id:"p2", nome:"Óleo para Barba",      categoria:"Barba",       preco:38, custo:14, estoque:3,  estoqueMinimo:5, vendidos:21, ativo:true },
  { id:"p3", nome:"Shampoo Antiqueda",    categoria:"Cabelo",      preco:55, custo:22, estoque:5,  estoqueMinimo:5, vendidos:18, ativo:true },
  { id:"p4", nome:"Cera Modeladora",      categoria:"Finalizador", preco:42, custo:16, estoque:15, estoqueMinimo:5, vendidos:29, ativo:true },
  { id:"p5", nome:"Balm para Barba",      categoria:"Barba",       preco:35, custo:12, estoque:2,  estoqueMinimo:4, vendidos:15, ativo:true },
  { id:"p6", nome:"Condicionador Leave",  categoria:"Cabelo",      preco:48, custo:19, estoque:8,  estoqueMinimo:4, vendidos:12, ativo:true },
  { id:"p7", nome:"Gel Extra Forte",      categoria:"Finalizador", preco:28, custo:9,  estoque:20, estoqueMinimo:6, vendidos:41, ativo:true },
  { id:"p8", nome:"Tônico Capilar",       categoria:"Tratamento",  preco:65, custo:28, estoque:0,  estoqueMinimo:3, vendidos:7,  ativo:false },
]

const cats = ["Todos","Finalizador","Barba","Cabelo","Tratamento"]

function estoqueStatus(estoque: number, min: number) {
  if (estoque === 0) return { label:"Sem estoque", variant:"destructive" as const }
  if (estoque <= min) return { label:"Estoque baixo", variant:"warning" as const }
  return { label:"Normal", variant:"success" as const }
}

function ProdutoDrawer({ produto, open, onClose, onSave }: {
  produto: Produto | null; open: boolean; onClose: () => void; onSave: (p: Produto) => void
}) {
  const isNew = !produto?.id
  const empty: Omit<Produto,"id"> = { nome:"", categoria:"Finalizador", preco:0, custo:0, estoque:0, estoqueMinimo:3, vendidos:0, ativo:true }
  const [form, setForm] = useState<Omit<Produto,"id">>(produto ? { ...produto } : empty)
  const [repoQtd, setRepoQtd] = useState(0)

  function upd<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(p => ({ ...p, [k]: v })) }
  function reporEstoque() { upd("estoque", form.estoque + repoQtd); setRepoQtd(0) }

  const margem = form.preco > 0 ? Math.round(((form.preco - form.custo) / form.preco) * 100) : 0

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Novo produto" : "Editar produto"} description={isNew ? "Preencha os dados do produto" : `Editando: ${produto?.nome}`}>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome *</label>
          <Input value={form.nome} onChange={e => upd("nome", e.target.value)} placeholder="Nome do produto" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Categoria</label>
            <select
              value={form.categoria}
              onChange={e => upd("categoria", e.target.value)}
              className="w-full h-9 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm outline-none focus:border-[var(--primary)]"
            >
              {["Finalizador","Barba","Cabelo","Tratamento","Outro"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Estoque mínimo</label>
            <Input type="number" value={form.estoqueMinimo} onChange={e => upd("estoqueMinimo", Number(e.target.value))} min={0} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Preço de venda (R$) *</label>
            <Input type="number" value={form.preco} onChange={e => upd("preco", Number(e.target.value))} min={0} step={0.5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Custo (R$)</label>
            <Input type="number" value={form.custo} onChange={e => upd("custo", Number(e.target.value))} min={0} step={0.5} />
          </div>
        </div>

        {/* Margem preview */}
        {form.preco > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium">Margem de lucro</span>
              <span className={`text-sm font-bold ${margem >= 40 ? "text-emerald-600" : margem >= 20 ? "text-amber-500" : "text-red-500"}`}>{margem}%</span>
            </div>
            <Progress value={margem} max={80} barClassName={margem >= 40 ? "bg-emerald-500" : margem >= 20 ? "bg-amber-500" : "bg-red-500"} />
          </div>
        )}

        {/* Estoque */}
        <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Estoque atual</p>
            <span className={`text-lg font-bold ${form.estoque === 0 ? "text-red-500" : form.estoque <= form.estoqueMinimo ? "text-amber-500" : "text-emerald-600"}`}>
              {form.estoque} un.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" value={repoQtd} onChange={e => setRepoQtd(Number(e.target.value))} min={0} placeholder="Qtd. a repor" className="flex-1" />
            <Button size="sm" variant="outline" onClick={reporEstoque} disabled={repoQtd <= 0} className="gap-1.5 shrink-0">
              <ArrowCounterClockwise weight="bold" size={13} />Repor
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Produto ativo</p>
            <p className="text-xs text-[var(--muted-foreground)]">Aparece no PDV</p>
          </div>
          <Switch checked={form.ativo} onCheckedChange={v => upd("ativo", v)} />
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ ...form, id: produto?.id ?? crypto.randomUUID() })} disabled={!form.nome || form.preco <= 0}>
          {isNew ? "Cadastrar" : "Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [busca, setBusca] = useState("")
  const [catFiltro, setCatFiltro] = useState("Todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Produto | null>(null)
  const { toast } = useToast()

  const filtrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCat = catFiltro === "Todos" || p.categoria === catFiltro
    return matchBusca && matchCat
  })

  function openNew() { setSelected(null); setDrawerOpen(true) }
  function openEdit(p: Produto) { setSelected(p); setDrawerOpen(true) }

  function handleSave(p: Produto) {
    setProdutos(prev => {
      const exists = prev.find(x => x.id === p.id)
      return exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]
    })
    toast({ type: "success", title: selected ? "Produto atualizado!" : "Produto cadastrado!", description: p.nome })
    setDrawerOpen(false)
  }

  const semEstoque = produtos.filter(p => p.estoque === 0).length
  const baixo = produtos.filter(p => p.estoque > 0 && p.estoque <= p.estoqueMinimo).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Produtos" subtitle="Controle de estoque" action={{ label: "Novo produto", onClick: openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 animate-fade-in">

        {(semEstoque > 0 || baixo > 0) && (
          <div className="flex flex-wrap gap-3">
            {semEstoque > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
                <Warning weight="duotone" size={16} className="shrink-0" />
                <strong>{semEstoque}</strong> sem estoque
              </div>
            )}
            {baixo > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
                <TrendDown weight="duotone" size={16} className="shrink-0" />
                <strong>{baixo}</strong> com estoque baixo
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Input leftIcon={<MagnifyingGlass weight="duotone" size={14} />} placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="w-56" />
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <button key={c} onClick={() => setCatFiltro(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${catFiltro===c ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Grid cards (mobile-first) + tabela em telas grandes */}
        <div className="block lg:hidden space-y-3">
          {filtrados.map((p) => {
            const st = estoqueStatus(p.estoque, p.estoqueMinimo)
            const margem = Math.round(((p.preco - p.custo) / p.preco) * 100)
            return (
              <div key={p.id} className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 ${!p.ativo ? "opacity-55" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                      <Package weight="duotone" size={18} className="text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.nome}</p>
                      <Badge variant="secondary" className="text-[10px]">{p.categoria}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 w-7 p-0">
                    <PencilSimple weight="bold" size={13} />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[var(--muted)] p-2">
                    <p className="text-sm font-bold text-[var(--primary)]">{formatCurrency(p.preco)}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">preço</p>
                  </div>
                  <div className="rounded-lg bg-[var(--muted)] p-2">
                    <p className={`text-sm font-bold ${p.estoque === 0 ? "text-red-500" : p.estoque <= p.estoqueMinimo ? "text-amber-500" : "text-emerald-600"}`}>{p.estoque}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">estoque</p>
                  </div>
                  <div className="rounded-lg bg-[var(--muted)] p-2">
                    <p className="text-sm font-bold">{margem}%</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">margem</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={st.variant}>{st.label}</Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">{p.vendidos} vendidos</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabela desktop */}
        <div className="hidden lg:block rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                {["Produto","Categoria","Preço","Margem","Estoque","Status","Vendidos",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtrados.map(p => {
                const st = estoqueStatus(p.estoque, p.estoqueMinimo)
                const margem = Math.round(((p.preco - p.custo) / p.preco) * 100)
                return (
                  <tr key={p.id} className={`hover:bg-[var(--muted)]/30 transition-colors ${!p.ativo?"opacity-55":""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)]">
                          <Package weight="duotone" size={15} className="text-[var(--muted-foreground)]" />
                        </div>
                        <span className="font-medium">{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{p.categoria}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-[var(--primary)]">{formatCurrency(p.preco)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold w-8">{margem}%</span>
                        <Progress value={margem} max={80} className="w-16" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.estoque===0?"text-red-500":p.estoque<=p.estoqueMinimo?"text-amber-500":""}`}>{p.estoque}</span>
                      <span className="text-xs text-[var(--muted-foreground)] ml-1">/ mín {p.estoqueMinimo}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{p.vendidos}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 w-7 p-0">
                        <PencilSimple weight="bold" size={13} />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProdutoDrawer produto={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} />
    </div>
  )
}
