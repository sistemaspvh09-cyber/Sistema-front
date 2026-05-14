"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ShoppingCart, CurrencyDollar, Receipt, QrCode,
  CreditCard, Money, CheckCircle, Clock, Scissors
} from "@phosphor-icons/react"
import { GradientCard } from "@/components/ui/gradient-card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

const vendasHoje = [
  { id:"v1", hora:"09:15", cliente:"Carlos Silva",   servico:"Corte + Barba", valor:70,  metodo:"pix",     status:"pago" },
  { id:"v2", hora:"10:05", cliente:"Pedro Santos",   servico:"Corte",         valor:45,  metodo:"debito",  status:"pago" },
  { id:"v3", hora:"11:20", cliente:"Lucas Oliveira", servico:"Barba",         valor:35,  metodo:"dinheiro",status:"pago" },
  { id:"v4", hora:"13:00", cliente:"Rafael Costa",   servico:"Corte + Barba", valor:70,  metodo:"—",       status:"pendente" },
  { id:"v5", hora:"14:30", cliente:"Bruno Lima",     servico:"Platinado",     valor:120, metodo:"—",       status:"pendente" },
]

const metodoIcon: Record<string, React.ElementType> = {
  pix: QrCode, credito: CreditCard, debito: CreditCard, dinheiro: Money,
}

const metodoLabel: Record<string,string> = {
  pix:"PIX", credito:"Crédito", debito:"Débito", dinheiro:"Dinheiro", "—":"Aguardando"
}

export default function CaixaPage() {
  const [vendas, setVendas] = useState(vendasHoje)
  const { toast } = useToast()

  const totalPago = vendas.filter(v=>v.status==="pago").reduce((a,v)=>a+v.valor,0)
  const totalPendente = vendas.filter(v=>v.status==="pendente").reduce((a,v)=>a+v.valor,0)
  const qtdPago = vendas.filter(v=>v.status==="pago").length

  function receberPagamento(id: string, metodo: string) {
    setVendas(p=>p.map(v=>v.id===id?{...v,status:"pago",metodo}:v))
    toast({ type:"success", title:"Pagamento recebido!", description:`Via ${metodoLabel[metodo]}` })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header inline */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
        <div>
          <h1 className="text-lg font-bold leading-none">Caixa</h1>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Operador de caixa — visão simplificada</p>
        </div>
        <Button size="sm" className="gap-1.5 h-8 text-xs">
          <Receipt weight="duotone" size={13} />Fechar caixa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GradientCard title="Recebido hoje" value={formatCurrency(totalPago)} icon={CheckCircle} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle={`${qtdPago} vendas`} delay={0} />
          <GradientCard title="A receber" value={formatCurrency(totalPendente)} icon={Clock} gradient="from-amber-500 via-orange-500 to-orange-600" glowClass="glow-orange" subtitle={`${vendas.filter(v=>v.status==="pendente").length} pendentes`} delay={0.06} />
          <GradientCard title="Total do dia" value={formatCurrency(totalPago + totalPendente)} icon={CurrencyDollar} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle="meta: R$1.200,00" delay={0.12} />
        </div>

        {/* Métodos rápidos de cobrança */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm font-semibold mb-3">Cobrar agora — acesso rápido</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"PIX",        icon:QrCode,    g:"from-emerald-500 to-teal-600",   href:"/pdv?metodo=pix"     },
              { label:"Cartão",     icon:CreditCard,g:"from-blue-500 to-indigo-600",    href:"/pdv?metodo=credito" },
              { label:"Dinheiro",   icon:Money,     g:"from-amber-500 to-orange-600",   href:"/pdv?metodo=dinheiro"},
              { label:"PDV Completo",icon:ShoppingCart,g:"from-violet-500 to-purple-700",href:"/pdv"              },
            ].map((m,i)=>(
              <motion.a key={m.label} href={m.href}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                className={`flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${m.g} p-4 text-white hover:-translate-y-1 transition-transform cursor-pointer`}
              >
                <div className="glass-icon flex h-10 w-10 items-center justify-center rounded-xl">
                  <m.icon weight="duotone" size={20} />
                </div>
                <span className="text-xs font-semibold">{m.label}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Lista de vendas */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <p className="text-sm font-semibold">Atendimentos de hoje</p>
            <span className="text-xs text-[var(--muted-foreground)]">{vendas.length} no total</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {vendas.map((v,i)=>(
              <motion.div key={v.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                className="flex items-center gap-4 px-5 py-4"
              >
                <Avatar name={v.cliente} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.cliente}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{v.hora} · {v.servico}</p>
                </div>
                <p className="text-sm font-bold text-[var(--primary)] shrink-0">{formatCurrency(v.valor)}</p>

                {v.status==="pago" ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 shrink-0">
                    <CheckCircle weight="fill" size={11}/>{metodoLabel[v.metodo]}
                  </div>
                ) : (
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={()=>receberPagamento(v.id,"pix")}
                      className="flex h-7 items-center gap-1 rounded-lg bg-emerald-500 px-2 text-[10px] font-bold text-white hover:opacity-90">
                      <QrCode size={11}/>PIX
                    </button>
                    <button onClick={()=>receberPagamento(v.id,"credito")}
                      className="flex h-7 items-center gap-1 rounded-lg bg-blue-500 px-2 text-[10px] font-bold text-white hover:opacity-90">
                      <CreditCard size={11}/>Cartão
                    </button>
                    <button onClick={()=>receberPagamento(v.id,"dinheiro")}
                      className="flex h-7 items-center gap-1 rounded-lg bg-amber-500 px-2 text-[10px] font-bold text-white hover:opacity-90">
                      <Money size={11}/>Cash
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
