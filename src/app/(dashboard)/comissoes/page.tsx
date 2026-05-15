"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  CurrencyDollar, CheckCircle, Clock, ChartLineUp,
  Scissors, Receipt, Confetti, Buildings, ArrowsDownUp,
  ArrowDown, ArrowUp
} from "@phosphor-icons/react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Header } from "@/components/layout/header"
import { GradientCard } from "@/components/ui/gradient-card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

const UNIDADES = [
  { id:"u1", nome:"Centro",       cor:"from-orange-500 to-rose-600"    },
  { id:"u2", nome:"Pinheiros",    cor:"from-blue-500 to-indigo-600"    },
  { id:"u3", nome:"V.Madalena",   cor:"from-violet-500 to-purple-700"  },
]

interface Barbeiro {
  id: string; nome: string; pct: number; pago: boolean
  atendimentos: number; meta: number
  porUnidade: Record<string, { receita: number; atend: number; comissao: number }>
}

const barbeiros: Barbeiro[] = [
  {
    id:"b1", nome:"João Mendes",   pct:40, pago:false, atendimentos:28, meta:35,
    porUnidade:{
      u1:{ receita:3200, atend:16, comissao:1280 },
      u2:{ receita:1400, atend:8,  comissao:560  },
      u3:{ receita:1000, atend:4,  comissao:400  },
    },
  },
  {
    id:"b2", nome:"Marcos Silva",  pct:35, pago:false, atendimentos:22, meta:35,
    porUnidade:{
      u1:{ receita:2200, atend:12, comissao:770 },
      u2:{ receita:1800, atend:6,  comissao:630 },
      u3:{ receita:1342, atend:4,  comissao:470 },
    },
  },
  {
    id:"b3", nome:"Rafael Torres", pct:30, pago:true,  atendimentos:15, meta:25,
    porUnidade:{
      u1:{ receita:2800, atend:10, comissao:840 },
      u2:{ receita:1000, atend:3,  comissao:300 },
      u3:{ receita:500,  atend:2,  comissao:150 },
    },
  },
]

const periodos = ["Maio 2026","Abril 2026","Março 2026"]

const graficoData = UNIDADES.map(u => ({
  unidade: u.nome,
  ...Object.fromEntries(barbeiros.map(b => [b.nome, b.porUnidade[u.id]?.comissao ?? 0]))
}))

const CORES_B = ["#f97316","#3b82f6","#8b5cf6"]

type TooltipPayload = {
  name?: string
  value?: number
  fill?: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl text-xs">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{background:p.fill}}/>
            {p.name}
          </span>
          <span className="font-bold">{formatCurrency(Number(p.value ?? 0))}</span>
        </div>
      ))}
    </div>
  )
}

function SortIcon({ active, ascending }: { active: boolean; ascending: boolean }) {
  if (!active) return <ArrowsDownUp size={11} className="opacity-40"/>
  return ascending ? <ArrowUp size={11}/> : <ArrowDown size={11}/>
}

export default function ComissoesPage() {
  const [lista, setLista] = useState(barbeiros)
  const [periodo, setPeriodo] = useState(periodos[0])
  const [sortCol, setSortCol] = useState<string>("total")
  const [sortAsc, setSortAsc] = useState(false)

  const totalComissao = lista.reduce((a,b)=>a+Object.values(b.porUnidade).reduce((s,u)=>s+u.comissao,0),0)
  const totalPago = lista.filter(b=>b.pago).reduce((a,b)=>a+Object.values(b.porUnidade).reduce((s,u)=>s+u.comissao,0),0)
  const totalPendente = totalComissao - totalPago

  function getTotal(b: Barbeiro) { return Object.values(b.porUnidade).reduce((s,u)=>s+u.comissao,0) }

  function marcarPago(id: string) {
    setLista(p=>p.map(b=>b.id===id?{...b,pago:true}:b))
    const b = lista.find(x=>x.id===id)
    toast.success("Comissão paga!", { description:`${b?.nome} — ${formatCurrency(getTotal(b!))}` })
  }

  function pagarTodos() {
    setLista(p=>p.map(b=>({...b,pago:true})))
    toast.success("Todas as comissões pagas!", { description:`${formatCurrency(totalPendente)} distribuídos` })
  }

  function sortBy(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(false) }
  }

  const sorted = [...lista].sort((a,b) => {
    if (sortCol === "nome") {
      return sortAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
    }
    const aV = sortCol === "total" ? getTotal(a) : (a.porUnidade[sortCol]?.comissao ?? 0)
    const bV = sortCol === "total" ? getTotal(b) : (b.porUnidade[sortCol]?.comissao ?? 0)
    return sortAsc ? aV - bV : bV - aV
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Comissões" subtitle="Relatório e pagamento por barbeiro e unidade"
        action={{ label:"Exportar", onClick:()=>toast.info("Exportando PDF...") }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GradientCard title="Total comissões" value={formatCurrency(totalComissao)} icon={CurrencyDollar} gradient="from-orange-500 via-orange-600 to-rose-600" glowClass="glow-orange" subtitle={periodo} delay={0} />
          <GradientCard title="Já pago" value={formatCurrency(totalPago)} icon={CheckCircle} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle="liquidado" delay={0.06} />
          <GradientCard title="A pagar" value={formatCurrency(totalPendente)} icon={Clock} gradient="from-amber-500 via-orange-500 to-orange-600" glowClass="glow-orange" subtitle={`${lista.filter(b=>!b.pago).length} barbeiros`} delay={0.12} />
        </div>

        {/* Seletor de período */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Período:</span>
          <div className="flex gap-1">
            {periodos.map(p=>(
              <button key={p} onClick={()=>setPeriodo(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${periodo===p?"bg-[var(--primary)] text-white border-[var(--primary)]":"border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
              >{p}</button>
            ))}
          </div>
          {totalPendente > 0 && (
            <Button onClick={pagarTodos} size="sm" className="ml-auto gap-1.5 h-8 text-xs">
              <Confetti weight="duotone" size={13}/>Pagar todos ({formatCurrency(totalPendente)})
            </Button>
          )}
        </div>

        <Tabs defaultValue="cross">
          <TabsList className="mb-4">
            <TabsTrigger value="cross"><ArrowsDownUp weight="duotone" size={13}/>Cruzado</TabsTrigger>
            <TabsTrigger value="grafico"><ChartLineUp weight="duotone" size={13}/>Gráfico</TabsTrigger>
            <TabsTrigger value="barbeiros"><Scissors weight="duotone" size={13}/>Por barbeiro</TabsTrigger>
          </TabsList>

          {/* Tabela cross-data */}
          <TabsContent value="cross">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] w-40">
                      <button className="flex items-center gap-1 hover:text-[var(--foreground)]" onClick={()=>sortBy("nome")}>
                        Barbeiro <SortIcon active={sortCol === "nome"} ascending={sortAsc}/>
                      </button>
                    </th>
                    {UNIDADES.map(u=>(
                      <th key={u.id} className="px-3 py-3 text-center" colSpan={2}>
                        <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${u.cor} px-2.5 py-1 text-[10px] font-bold text-white`}>
                          <Buildings weight="duotone" size={10}/>{u.nome}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">
                      <button className="flex items-center gap-1 ml-auto hover:text-[var(--foreground)]" onClick={()=>sortBy("total")}>
                        Total <SortIcon active={sortCol === "total"} ascending={sortAsc}/>
                      </button>
                    </th>
                    <th className="px-4 py-3"/>
                  </tr>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/20">
                    <th className="px-4 py-2 text-xs text-[var(--muted-foreground)] text-left">—</th>
                    {UNIDADES.flatMap(u=>[
                      <th key={`${u.id}-r`} className="px-3 py-2 text-[10px] text-[var(--muted-foreground)] text-center font-medium">Receita</th>,
                      <th key={`${u.id}-c`} className="px-3 py-2 text-[10px] text-[var(--muted-foreground)] text-center font-medium">Comissão</th>,
                    ])}
                    <th className="px-4 py-2"/>
                    <th className="px-4 py-2"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sorted.map((b,i)=>{
                    const total = getTotal(b)
                    const totalReceita = Object.values(b.porUnidade).reduce((s,u)=>s+u.receita,0)
                    return (
                      <motion.tr key={b.id} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                        className={`hover:bg-[var(--muted)]/20 transition-colors ${!b.pago?"":""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={b.nome} size="sm"/>
                            <div>
                              <p className="text-sm font-semibold">{b.nome}</p>
                              <p className="text-[10px] text-[var(--muted-foreground)]">{b.pct}% comissão</p>
                            </div>
                          </div>
                        </td>
                        {UNIDADES.flatMap(u=>[
                          <td key={`${u.id}-r`} className="px-3 py-3 text-center text-xs text-[var(--muted-foreground)]">
                            {formatCurrency(b.porUnidade[u.id]?.receita ?? 0)}
                          </td>,
                          <td key={`${u.id}-c`} className="px-3 py-3 text-center text-xs font-bold text-[var(--primary)]">
                            {formatCurrency(b.porUnidade[u.id]?.comissao ?? 0)}
                          </td>,
                        ])}
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-black text-[var(--foreground)]">{formatCurrency(total)}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">/ {formatCurrency(totalReceita)}</p>
                        </td>
                        <td className="px-4 py-3">
                          {b.pago ? (
                            <Badge variant="success" className="whitespace-nowrap"><CheckCircle weight="fill" size={10} className="mr-1"/>Pago</Badge>
                          ) : (
                            <button onClick={()=>marcarPago(b.id)}
                              className="whitespace-nowrap rounded-xl bg-[var(--primary)] px-2.5 py-1 text-[10px] font-bold text-white hover:opacity-90 transition-opacity">
                              Pagar
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}

                  {/* Totais */}
                  <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-bold">
                    <td className="px-4 py-3 text-sm">Total por unidade</td>
                    {UNIDADES.flatMap(u=>[
                      <td key={`${u.id}-r`} className="px-3 py-3 text-center text-xs font-bold">
                        {formatCurrency(lista.reduce((a,b)=>a+(b.porUnidade[u.id]?.receita??0),0))}
                      </td>,
                      <td key={`${u.id}-c`} className="px-3 py-3 text-center text-xs font-bold text-[var(--primary)]">
                        {formatCurrency(lista.reduce((a,b)=>a+(b.porUnidade[u.id]?.comissao??0),0))}
                      </td>,
                    ])}
                    <td className="px-4 py-3 text-right text-sm font-black text-[var(--primary)]">{formatCurrency(totalComissao)}</td>
                    <td/>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Gráfico */}
          <TabsContent value="grafico">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm font-semibold mb-1">Comissões por unidade e barbeiro</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">{periodo}</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={graficoData} barGap={3} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="unidade" tick={{fontSize:11,fill:"var(--muted-foreground)"}} tickLine={false} axisLine={false}/>
                  <YAxis tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`} tick={{fontSize:11,fill:"var(--muted-foreground)"}} tickLine={false} axisLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:12}}/>
                  {barbeiros.map((b,i)=>(
                    <Bar key={b.nome} dataKey={b.nome} fill={CORES_B[i]} radius={[6,6,0,0]}/>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Cards por barbeiro */}
          <TabsContent value="barbeiros">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((b,i)=>{
                const total = getTotal(b)
                return (
                  <motion.div key={b.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.nome} size="md"/>
                        <div>
                          <p className="text-sm font-bold">{b.nome}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{b.pct}% comissão</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-[var(--primary)]">{formatCurrency(total)}</p>
                        {b.pago
                          ? <Badge variant="success" className="text-[10px]">Pago</Badge>
                          : <Badge variant="warning" className="text-[10px]">Pendente</Badge>}
                      </div>
                    </div>

                    {UNIDADES.map(u=>{
                      const dado = b.porUnidade[u.id]
                      return (
                        <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${u.cor}`}/>
                            <span className="text-[var(--muted-foreground)]">{u.nome}</span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">({dado?.atend ?? 0} atend.)</span>
                          </div>
                          <span className="font-bold text-[var(--primary)]">{formatCurrency(dado?.comissao ?? 0)}</span>
                        </div>
                      )
                    })}

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--muted-foreground)]">Meta</span>
                        <span className="font-semibold">{b.atendimentos}/{b.meta}</span>
                      </div>
                      <Progress value={b.atendimentos} max={b.meta} barClassName={b.atendimentos>=b.meta?"bg-emerald-500":undefined}/>
                    </div>

                    {!b.pago && (
                      <Button size="sm" onClick={()=>marcarPago(b.id)} className="w-full mt-3 h-8 text-xs gap-1.5">
                        <Receipt weight="duotone" size={13}/>Registrar pagamento
                      </Button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
