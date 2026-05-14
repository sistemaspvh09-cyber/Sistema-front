"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CurrencyDollar, CheckCircle, Clock, ChartLineUp,
  Scissors, Receipt, ArrowRight, Confetti
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { GradientCard } from "@/components/ui/gradient-card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface ComissaoBarbeiro {
  id: string; nome: string; pct: number
  receitaGerada: number; comissao: number; pago: boolean
  atendimentos: number; meta: number
  historico: { mes: string; valor: number; pago: boolean }[]
}

const comissoesIniciais: ComissaoBarbeiro[] = [
  {
    id:"b1", nome:"João Mendes",   pct:40, receitaGerada:5600, comissao:2240, pago:false, atendimentos:28, meta:35,
    historico:[{mes:"Fev",valor:1950,pago:true},{mes:"Mar",valor:2100,pago:true},{mes:"Abr",valor:2080,pago:true},{mes:"Mai",valor:2240,pago:false}],
  },
  {
    id:"b2", nome:"Marcos Silva",  pct:35, receitaGerada:5342, comissao:1870, pago:false, atendimentos:22, meta:35,
    historico:[{mes:"Fev",valor:1600,pago:true},{mes:"Mar",valor:1720,pago:true},{mes:"Abr",valor:1810,pago:true},{mes:"Mai",valor:1870,pago:false}],
  },
  {
    id:"b3", nome:"Rafael Torres", pct:30, receitaGerada:4300, comissao:1290, pago:true,  atendimentos:15, meta:25,
    historico:[{mes:"Fev",valor:1100,pago:true},{mes:"Mar",valor:1200,pago:true},{mes:"Abr",valor:1250,pago:true},{mes:"Mai",valor:1290,pago:true}],
  },
]

export default function ComissoesPage() {
  const [lista, setLista] = useState(comissoesIniciais)
  const [periodo, setPeriodo] = useState("Mai 2026")
  const { toast } = useToast()

  const totalComissao = lista.reduce((a,b)=>a+b.comissao,0)
  const totalPago = lista.filter(b=>b.pago).reduce((a,b)=>a+b.comissao,0)
  const totalPendente = lista.filter(b=>!b.pago).reduce((a,b)=>a+b.comissao,0)

  function marcarPago(id:string) {
    setLista(prev=>prev.map(b=>b.id===id?{...b,pago:true}:b))
    const b = lista.find(x=>x.id===id)
    toast({ type:"success", title:"Comissão paga!", description:`${b?.nome} — ${formatCurrency(b?.comissao??0)}` })
  }

  function pagarTodos() {
    setLista(prev=>prev.map(b=>({...b,pago:true})))
    toast({ type:"success", title:"Todas as comissões pagas!", description:`${formatCurrency(totalPendente)} distribuídos` })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Comissões" subtitle="Relatório e pagamento de comissões" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GradientCard title="Total comissões" value={formatCurrency(totalComissao)} icon={CurrencyDollar} gradient="from-orange-500 via-orange-600 to-rose-600" glowClass="glow-orange" subtitle={periodo} delay={0} />
          <GradientCard title="Já pago" value={formatCurrency(totalPago)} icon={CheckCircle} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle="liquidado" delay={0.06} />
          <GradientCard title="A pagar" value={formatCurrency(totalPendente)} icon={Clock} gradient="from-amber-500 via-orange-500 to-orange-600" glowClass="glow-orange" subtitle="pendente" delay={0.12} />
        </div>

        <Tabs defaultValue="mensal">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="mensal">Mensal</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
            {totalPendente > 0 && (
              <Button onClick={pagarTodos} className="gap-2 h-8 text-xs">
                <Confetti weight="duotone" size={14}/>Pagar todos ({formatCurrency(totalPendente)})
              </Button>
            )}
          </div>

          {/* Mensal */}
          <TabsContent value="mensal">
            <div className="space-y-3">
              {lista.map((b,i)=>(
                <motion.div key={b.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={b.nome} size="md" />
                      <div>
                        <p className="text-sm font-bold">{b.nome}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Comissão: {b.pct}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[var(--primary)]">{formatCurrency(b.comissao)}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">sobre {formatCurrency(b.receitaGerada)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-xl bg-[var(--muted)] p-2.5 text-center">
                      <p className="text-sm font-bold">{b.atendimentos}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">atendimentos</p>
                    </div>
                    <div className="rounded-xl bg-[var(--muted)] p-2.5 text-center">
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(b.receitaGerada)}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">receita gerada</p>
                    </div>
                    <div className="rounded-xl bg-[var(--muted)] p-2.5 text-center">
                      <p className="text-sm font-bold">{Math.round((b.atendimentos/b.meta)*100)}%</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">da meta</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[var(--muted-foreground)]">Meta de atendimentos</span>
                      <span className="font-semibold">{b.atendimentos}/{b.meta}</span>
                    </div>
                    <Progress value={b.atendimentos} max={b.meta} barClassName={b.atendimentos>=b.meta?"bg-emerald-500":undefined} />
                  </div>

                  <div className="flex items-center justify-between">
                    {b.pago ? (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-600">
                        <CheckCircle weight="fill" size={15}/>Pago
                      </div>
                    ) : (
                      <Badge variant="warning">Aguardando pagamento</Badge>
                    )}
                    {!b.pago && (
                      <Button size="sm" onClick={()=>marcarPago(b.id)} className="gap-1.5 h-8 text-xs">
                        <Receipt weight="duotone" size={13}/>Registrar pagamento
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <p className="text-sm font-semibold">Histórico de comissões — 4 meses</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
                    {["Barbeiro","Fev","Mar","Abr","Mai","Total"].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {lista.map(b=>{
                    const total = b.historico.reduce((a,h)=>a+h.valor,0)
                    return (
                      <tr key={b.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={b.nome} size="sm"/>
                            <span className="font-medium">{b.nome}</span>
                          </div>
                        </td>
                        {b.historico.map(h=>(
                          <td key={h.mes} className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-semibold ${h.pago?"text-emerald-600":"text-amber-500"}`}>{formatCurrency(h.valor)}</span>
                              {h.pago
                                ? <CheckCircle weight="fill" size={11} className="text-emerald-500"/>
                                : <Clock weight="duotone" size={11} className="text-amber-500"/>}
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-3 font-black text-[var(--primary)]">{formatCurrency(total)}</td>
                      </tr>
                    )
                  })}
                  <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/20 font-bold">
                    <td className="px-4 py-3 text-sm font-bold">Total</td>
                    {["Fev","Mar","Abr","Mai"].map(mes=>(
                      <td key={mes} className="px-4 py-3 text-sm font-bold text-[var(--foreground)]">
                        {formatCurrency(lista.reduce((a,b)=>a+(b.historico.find(h=>h.mes===mes)?.valor??0),0))}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm font-black text-[var(--primary)]">
                      {formatCurrency(lista.reduce((a,b)=>a+b.historico.reduce((s,h)=>s+h.valor,0),0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
