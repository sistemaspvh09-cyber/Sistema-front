"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  CurrencyDollar, Lock, LockOpen, CheckCircle,
  ArrowUpRight, ArrowDownRight, Printer, Warning
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { GradientCard } from "@/components/ui/gradient-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const movimentos = [
  { hora:"08:00", desc:"Abertura do caixa",     valor:500,    tipo:"entrada", metodo:"dinheiro" },
  { hora:"09:15", desc:"Corte + Barba — Carlos", valor:70,    tipo:"entrada", metodo:"pix"      },
  { hora:"10:05", desc:"Corte — Pedro",          valor:45,    tipo:"entrada", metodo:"debito"   },
  { hora:"11:20", desc:"Barba — Lucas",          valor:35,    tipo:"entrada", metodo:"dinheiro" },
  { hora:"12:00", desc:"Troco/sangria",          valor:-150,  tipo:"saida",   metodo:"dinheiro" },
  { hora:"13:00", desc:"Corte + Barba — Rafael", valor:70,    tipo:"entrada", metodo:"credito"  },
  { hora:"14:30", desc:"Platinado — Bruno",      valor:120,   tipo:"entrada", metodo:"pix"      },
  { hora:"16:00", desc:"Compra insumos",         valor:-45,   tipo:"saida",   metodo:"dinheiro" },
]

const SALDO_INICIAL = 500
const totalEntradas = movimentos.filter(m=>m.tipo==="entrada").reduce((a,m)=>a+m.valor,0)
const totalSaidas = Math.abs(movimentos.filter(m=>m.tipo==="saida").reduce((a,m)=>a+m.valor,0))
const saldoFinal = SALDO_INICIAL + totalEntradas - totalSaidas

const porMetodo: Record<string,number> = movimentos
  .filter(m=>m.tipo==="entrada")
  .reduce((acc,m)=>({ ...acc, [m.metodo]:(acc[m.metodo]??0)+m.valor }),{} as Record<string,number>)

export default function FechamentoCaixaPage() {
  const [saldoContado, setSaldoContado] = useState("")
  const [fechado, setFechado] = useState(false)
  const [obs, setObs] = useState("")

  const diferenca = saldoContado ? Number(saldoContado) - (saldoFinal - totalEntradas + movimentos.filter(m=>m.metodo==="dinheiro"&&m.tipo==="entrada").reduce((a,m)=>a+m.valor,0) - totalSaidas) : null

  function fechar() {
    if (!saldoContado) { toast.error("Informe o saldo contado em caixa"); return }
    setFechado(true)
    toast.success("Caixa fechado com sucesso!", {
      description: `Saldo final: ${formatCurrency(Number(saldoContado))}`
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Controle de Caixa" subtitle={`${new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}`}/>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* Status */}
        <div className={`flex items-center gap-3 rounded-2xl border p-4 ${fechado ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"}`}>
          {fechado ? <Lock weight="duotone" size={20} className="text-emerald-500"/> : <LockOpen weight="duotone" size={20} className="text-blue-500"/>}
          <div>
            <p className={`text-sm font-semibold ${fechado?"text-emerald-700 dark:text-emerald-400":"text-blue-700 dark:text-blue-400"}`}>
              {fechado ? "Caixa fechado" : "Caixa aberto"}
            </p>
            <p className={`text-xs ${fechado?"text-emerald-600/70 dark:text-emerald-500":"text-blue-600/70 dark:text-blue-500"}`}>
              {fechado ? `Fechado às ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}` : "Operações do dia em andamento"}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-4">
          <GradientCard title="Saldo inicial" value={formatCurrency(SALDO_INICIAL)} icon={CurrencyDollar} gradient="from-gray-500 to-gray-600" delay={0} />
          <GradientCard title="Entradas" value={formatCurrency(totalEntradas)} icon={ArrowUpRight} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" delay={0.05} />
          <GradientCard title="Saídas" value={formatCurrency(totalSaidas)} icon={ArrowDownRight} gradient="from-red-500 via-rose-500 to-pink-600" glowClass="glow-rose" delay={0.1} />
          <GradientCard title="Saldo final" value={formatCurrency(saldoFinal)} icon={CurrencyDollar} gradient="from-orange-500 via-orange-600 to-rose-600" glowClass="glow-orange" delay={0.15} />
        </div>

        {/* Por método */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(porMetodo).map(([m,v])=>(
            <div key={m} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <p className="text-lg font-black text-[var(--primary)]">{formatCurrency(v)}</p>
              <p className="text-xs text-[var(--muted-foreground)] capitalize mt-0.5">{m === "pix"?"PIX":m === "credito"?"Crédito":m === "debito"?"Débito":"Dinheiro"}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Movimentos */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]">
              <p className="text-sm font-semibold">Movimentos do dia</p>
            </div>
            <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
              {movimentos.map((m,i)=>(
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/20 transition-colors">
                  <span className="text-xs text-[var(--muted-foreground)] w-12 shrink-0 tabular-nums">{m.hora}</span>
                  <p className="flex-1 text-xs truncate">{m.desc}</p>
                  <p className={`text-sm font-bold shrink-0 ${m.tipo==="entrada"?"text-emerald-600":"text-red-500"}`}>
                    {m.tipo==="entrada"?"+":""}{formatCurrency(m.valor)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Fechamento */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
            <p className="text-sm font-semibold">Fechamento do caixa</p>

            <div className="rounded-xl bg-[var(--muted)]/30 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Saldo esperado em dinheiro</span><span className="font-bold">{formatCurrency(SALDO_INICIAL + movimentos.filter(m=>m.metodo==="dinheiro"&&m.tipo==="entrada").reduce((a,m)=>a+m.valor,0) - totalSaidas)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Total entradas PIX</span><span className="font-bold text-emerald-600">{formatCurrency(porMetodo["pix"]??0)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Total entradas cartão</span><span className="font-bold text-blue-500">{formatCurrency((porMetodo["credito"]??0)+(porMetodo["debito"]??0))}</span></div>
              <div className="border-t border-[var(--border)] pt-1.5 flex justify-between"><span className="font-bold">Total geral</span><span className="font-black text-[var(--primary)]">{formatCurrency(saldoFinal)}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Dinheiro contado em caixa (R$)</label>
              <Input type="number" value={saldoContado} onChange={e=>setSaldoContado(e.target.value)} placeholder="0,00" disabled={fechado}/>
              {diferenca !== null && (
                <p className={`text-xs font-medium ${diferenca===0?"text-emerald-600":diferenca>0?"text-blue-500":"text-red-500"}`}>
                  {diferenca===0?"✓ Caixa conferido":diferenca>0?`▲ Sobra de ${formatCurrency(diferenca)}`:`▼ Falta de ${formatCurrency(Math.abs(diferenca))}`}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Observações</label>
              <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} disabled={fechado}
                placeholder="Alguma ocorrência do dia..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-xs outline-none focus:border-[var(--primary)] resize-none disabled:opacity-50"/>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 flex-1 h-8 text-xs" onClick={()=>toast.info("Imprimindo relatório...")}>
                <Printer weight="duotone" size={13}/>Imprimir
              </Button>
              <Button onClick={fechar} disabled={fechado} size="sm" className="flex-1 h-8 text-xs gap-1.5">
                {fechado
                  ? <><CheckCircle weight="fill" size={13}/>Caixa fechado</>
                  : <><Lock weight="duotone" size={13}/>Fechar caixa</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
