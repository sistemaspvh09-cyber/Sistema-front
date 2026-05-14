"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  TrendUp, TrendDown, CurrencyDollar, ArrowUpRight, ArrowDownRight,
  Plus, PencilSimple, Receipt, HouseLine, Lightning, Wrench, Package
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { GradientCard } from "@/components/ui/gradient-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Transacao {
  id: string; tipo: "receita" | "despesa"
  descricao: string; valor: number; data: string
  categoria: string; metodo: string
}

const categoriasReceita = ["Serviço","Produto","Gorjeta","Outro"]
const categoriasDespesa = ["Aluguel","Energia","Insumos","Salários","Manutenção","Impostos","Marketing","Outro"]
const metodos = ["pix","credito","debito","dinheiro","transferencia"]
const metodoLabel: Record<string, string> = {
  pix:"PIX", credito:"Crédito", debito:"Débito", dinheiro:"Dinheiro", transferencia:"Transferência", "":"—"
}
const metodoVariant: Record<string, string> = {
  pix:"success", credito:"default", debito:"warning", dinheiro:"secondary", transferencia:"secondary"
}

const catIcons: Record<string, React.ElementType> = {
  "Aluguel": HouseLine, "Insumos": Package, "Energia": Lightning, "Manutenção": Wrench,
}

const transacoesIniciais: Transacao[] = [
  { id:"t1", tipo:"receita",  descricao:"Venda #0042 — Corte + Barba", valor:70,   data:"2026-05-14", categoria:"Serviço",  metodo:"pix"          },
  { id:"t2", tipo:"receita",  descricao:"Venda #0041 — Pomada Matte",  valor:45,   data:"2026-05-14", categoria:"Produto",  metodo:"credito"      },
  { id:"t3", tipo:"despesa",  descricao:"Compra de insumos",           valor:180,  data:"2026-05-12", categoria:"Insumos",  metodo:"transferencia" },
  { id:"t4", tipo:"receita",  descricao:"Venda #0040 — Corte",         valor:45,   data:"2026-05-12", categoria:"Serviço",  metodo:"debito"       },
  { id:"t5", tipo:"despesa",  descricao:"Aluguel maio/2026",           valor:2500, data:"2026-05-10", categoria:"Aluguel",  metodo:"transferencia" },
  { id:"t6", tipo:"receita",  descricao:"Venda #0039 — Platinado",     valor:120,  data:"2026-05-10", categoria:"Serviço",  metodo:"pix"          },
  { id:"t7", tipo:"receita",  descricao:"Venda #0038 — Óleo de Barba", valor:38,   data:"2026-05-09", categoria:"Produto",  metodo:"dinheiro"     },
  { id:"t8", tipo:"despesa",  descricao:"Energia elétrica",            valor:320,  data:"2026-05-08", categoria:"Energia",  metodo:"debito"       },
]

const fluxoCaixa = [
  { desc:"Saldo inicial",   valor:4200,  tipo:"saldo"   },
  { desc:"Entradas do mês", valor:8420,  tipo:"entrada" },
  { desc:"Saídas do mês",   valor:-3180, tipo:"saida"   },
  { desc:"Saldo final",     valor:9440,  tipo:"saldo"   },
]

function TransacaoDrawer({ transacao, open, onClose, onSave }: {
  transacao: Transacao | null; open: boolean; onClose: () => void; onSave: (t: Transacao) => void
}) {
  const isNew = !transacao?.id
  const [tipo, setTipo] = useState<"receita"|"despesa">(transacao?.tipo ?? "receita")
  const [form, setForm] = useState({
    descricao: transacao?.descricao ?? "",
    valor:     transacao?.valor ?? 0,
    data:      transacao?.data  ?? new Date().toISOString().slice(0,10),
    categoria: transacao?.categoria ?? "Serviço",
    metodo:    transacao?.metodo    ?? "pix",
  })

  function upd<K extends keyof typeof form>(k:K, v:typeof form[K]) { setForm(p=>({...p,[k]:v})) }

  const cats = tipo === "receita" ? categoriasReceita : categoriasDespesa
  const catOpts = cats.map(c=>({value:c,label:c}))
  const metOpts = metodos.map(m=>({value:m,label:metodoLabel[m]}))

  return (
    <Drawer open={open} onClose={onClose} title={isNew?"Nova transação":"Editar transação"} description={isNew?"Registre uma receita ou despesa manualmente":""} size="md">
      <div className="space-y-4">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          {(["receita","despesa"] as const).map(t=>(
            <button key={t} onClick={()=>{ setTipo(t); upd("categoria", t==="receita"?"Serviço":"Aluguel") }}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                tipo===t
                  ? t==="receita" ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-red-500 bg-red-500/10 text-red-500"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40"
              }`}
            >
              {t==="receita" ? <ArrowUpRight weight="bold" size={16}/> : <ArrowDownRight weight="bold" size={16}/>}
              {t==="receita" ? "Receita" : "Despesa"}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Descrição *</label>
          <Input value={form.descricao} onChange={e=>upd("descricao",e.target.value)} placeholder="Ex: Venda de serviço, Conta de energia..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Valor (R$) *</label>
            <Input type="number" value={form.valor} onChange={e=>upd("valor",Number(e.target.value))} min={0} step={0.01} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Data *</label>
            <Input type="date" value={form.data} onChange={e=>upd("data",e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Categoria</label>
            <Select options={catOpts} value={form.categoria} onChange={e=>upd("categoria",e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Método</label>
            <Select options={metOpts} value={form.metodo} onChange={e=>upd("metodo",e.target.value)} />
          </div>
        </div>

        {/* Preview */}
        {form.valor > 0 && form.descricao && (
          <div className={`rounded-xl border p-3 ${tipo==="receita"?"border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30":"border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"}`}>
            <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Preview</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{form.descricao}</span>
              <span className={`text-base font-bold ${tipo==="receita"?"text-emerald-600":"text-red-500"}`}>
                {tipo==="receita"?"+":"-"}{formatCurrency(form.valor)}
              </span>
            </div>
          </div>
        )}
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={()=>onSave({...form,tipo,id:transacao?.id??crypto.randomUUID()})} disabled={!form.descricao||form.valor<=0}>
          {isNew?"Registrar":"Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState(transacoesIniciais)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Transacao|null>(null)
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const { toast } = useToast()

  const receitaTotal = transacoes.filter(t=>t.tipo==="receita").reduce((a,t)=>a+t.valor,0)
  const despesaTotal = transacoes.filter(t=>t.tipo==="despesa").reduce((a,t)=>a+t.valor,0)
  const lucro = receitaTotal - despesaTotal
  const margem = receitaTotal > 0 ? Math.round((lucro/receitaTotal)*100) : 0

  const filtradas = transacoes.filter(t=>filtroTipo==="todos"||t.tipo===filtroTipo)

  function openNew()  { setSelected(null); setDrawerOpen(true) }
  function openEdit(t:Transacao) { setSelected(t); setDrawerOpen(true) }

  function handleSave(t:Transacao) {
    setTransacoes(prev=>{
      const exists=prev.find(x=>x.id===t.id)
      return exists?prev.map(x=>x.id===t.id?t:x):[t,...prev]
    })
    toast({ type:"success", title:selected?"Transação atualizada!":"Transação registrada!", description:`${t.tipo==="receita"?"+":"-"}${formatCurrency(t.valor)}` })
    setDrawerOpen(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Financeiro" subtitle="Controle financeiro completo" action={{ label:"Nova transação", onClick:openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GradientCard title="Receita do mês" value={formatCurrency(receitaTotal)} change={18.4} subtitle="vs mês anterior" icon={TrendUp} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" delay={0} />
          <GradientCard title="Despesas do mês" value={formatCurrency(despesaTotal)} change={5.2} subtitle="vs mês anterior" icon={TrendDown} gradient="from-red-500 via-rose-500 to-pink-600" glowClass="glow-rose" delay={0.06} />
          <GradientCard title="Lucro líquido" value={formatCurrency(lucro)} change={24.1} subtitle="resultado positivo" icon={CurrencyDollar} gradient="from-orange-500 via-orange-600 to-amber-600" glowClass="glow-orange" delay={0.12} />
          <GradientCard title="Margem de lucro" value={`${margem}%`} change={3.8} subtitle="sobre receita bruta" icon={Receipt} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" delay={0.18} />
        </div>

        <Tabs defaultValue="transacoes">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="transacoes">Transações</TabsTrigger>
              <TabsTrigger value="fluxo">Fluxo de caixa</TabsTrigger>
            </TabsList>
            <div className="flex gap-1.5">
              {[["todos","Todos"],["receita","Receitas"],["despesa","Despesas"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFiltroTipo(v)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                    filtroTipo===v?"bg-[var(--primary)] text-white border-[var(--primary)]":"border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>

          <TabsContent value="transacoes">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--muted)]/20">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <ArrowUpRight weight="bold" size={13}/>{formatCurrency(receitaTotal)}
                  </span>
                  <span className="text-[var(--border)]">|</span>
                  <span className="flex items-center gap-1 font-semibold text-red-500">
                    <ArrowDownRight weight="bold" size={13}/>{formatCurrency(despesaTotal)}
                  </span>
                </div>
                <button onClick={openNew}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                  <Plus weight="bold" size={12}/>Nova
                </button>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {filtradas.map((t,i)=>(
                  <motion.div key={t.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--muted)]/20 transition-colors group"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.tipo==="receita"?"bg-emerald-500/10":"bg-red-500/10"}`}>
                      {t.tipo==="receita"
                        ? <ArrowUpRight weight="duotone" size={16} className="text-emerald-600"/>
                        : <ArrowDownRight weight="duotone" size={16} className="text-red-500"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.descricao}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{formatDate(t.data)} · {t.categoria}</p>
                    </div>
                    {t.metodo && (
                      <Badge variant={(metodoVariant[t.metodo]??"secondary") as any} className="text-[10px] shrink-0 hidden sm:flex">
                        {metodoLabel[t.metodo]}
                      </Badge>
                    )}
                    <p className={`text-sm font-bold shrink-0 ${t.tipo==="receita"?"text-emerald-600":"text-red-500"}`}>
                      {t.tipo==="receita"?"+":"-"}{formatCurrency(t.valor)}
                    </p>
                    <button onClick={()=>openEdit(t)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <PencilSimple weight="bold" size={13}/>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fluxo">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <p className="text-sm font-semibold">Fluxo de caixa — maio 2026</p>
              </div>
              <div className="p-5 space-y-3">
                {fluxoCaixa.map((f,i)=>(
                  <div key={i} className={`flex items-center justify-between rounded-xl p-4 ${
                    f.tipo==="saldo"  ? "bg-[var(--muted)] border border-[var(--border)]" :
                    f.tipo==="entrada"? "bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900" :
                                       "bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        f.tipo==="entrada"?"bg-emerald-500/15":f.tipo==="saida"?"bg-red-500/15":"bg-[var(--muted-foreground)]/10"
                      }`}>
                        {f.tipo==="entrada"?<ArrowUpRight weight="duotone" size={15} className="text-emerald-600"/>:
                         f.tipo==="saida"  ?<ArrowDownRight weight="duotone" size={15} className="text-red-500"/>:
                                            <CurrencyDollar weight="duotone" size={15} className="text-[var(--muted-foreground)]"/>}
                      </div>
                      <span className={`text-sm ${f.tipo==="saldo"?"font-bold":"font-medium"}`}>{f.desc}</span>
                    </div>
                    <span className={`text-base font-bold ${
                      f.tipo==="entrada"?"text-emerald-600":f.tipo==="saida"?"text-red-500":"text-[var(--foreground)]"
                    }`}>
                      {f.valor>0?"+" : ""}{formatCurrency(Math.abs(f.valor))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TransacaoDrawer transacao={selected} open={drawerOpen} onClose={()=>setDrawerOpen(false)} onSave={handleSave} />
    </div>
  )
}
