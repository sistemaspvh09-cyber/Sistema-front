"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Cake, Gift, WhatsappLogo, Star, Crown, Users, Check
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TierBadge } from "@/components/ui/tier-badge"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/gradient-card"
import { calcTier, calcPontos } from "@/lib/vip"
import { formatCurrency } from "@/lib/utils"

const BONUS_PONTOS = 50
const BONUS_DESCONTO = 10 // % desconto no aniversário

const clientes = [
  { id:"1", nome:"Carlos Silva",   telefone:"(11) 98765-4321", nascimento:"1990-05-14", totalVisitas:32, gasto:2240, bonusEnviado:false },
  { id:"5", nome:"Bruno Lima",     telefone:"(11) 92345-6789", nascimento:"1988-05-14", totalVisitas:15, gasto:1125, bonusEnviado:false },
  { id:"7", nome:"Thiago Souza",   telefone:"(11) 95678-9012", nascimento:"1982-05-14", totalVisitas:51, gasto:3570, bonusEnviado:true  },
]

const proximosMes = [
  { nome:"Pedro Santos",   telefone:"(11) 91234-5678", nascimento:"1985-05-20", diasAte:6  },
  { nome:"Lucas Oliveira", telefone:"(11) 99876-5432", nascimento:"1995-05-26", diasAte:12 },
  { nome:"Rafael Costa",   telefone:"(11) 94567-8901", nascimento:"2000-05-30", diasAte:16 },
]

export default function AniversariantesPage() {
  const [lista, setLista] = useState(clientes)

  function enviarBonus(id: string) {
    setLista(p=>p.map(c=>c.id===id?{...c,bonusEnviado:true}:c))
    const c = lista.find(x=>x.id===id)
    toast.success(`🎂 Bônus enviado para ${c?.nome.split(" ")[0]}!`, {
      description: `+${BONUS_PONTOS} pontos e ${BONUS_DESCONTO}% de desconto no próximo atendimento`
    })
  }

  function enviarTodos() {
    setLista(p=>p.map(c=>({...c,bonusEnviado:true})))
    const pendentes = lista.filter(c=>!c.bonusEnviado)
    toast.success("Bônus enviado para todos!", {
      description: `${pendentes.length} cliente(s) receberam ${BONUS_PONTOS} pontos`
    })
  }

  const pendentes = lista.filter(c=>!c.bonusEnviado)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Aniversariantes" subtitle="Bônus automático de fidelidade no aniversário"/>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GradientCard title="Hoje" value={String(lista.length)} icon={Cake} gradient="from-pink-500 via-rose-500 to-red-500" glowClass="glow-rose" subtitle="aniversariantes" delay={0} />
          <GradientCard title="Bônus pendentes" value={String(pendentes.length)} icon={Gift} gradient="from-amber-500 via-orange-500 to-orange-600" glowClass="glow-orange" subtitle={`${BONUS_PONTOS} pontos cada`} delay={0.06} />
          <GradientCard title="No mês" value={String(proximosMes.length + lista.length)} icon={Users} gradient="from-violet-500 via-purple-600 to-fuchsia-700" glowClass="glow-purple" subtitle="no total" delay={0.12} />
        </div>

        {/* Banner do bônus */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/30 p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎂</div>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Bônus de Aniversário Ativo</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-500 mt-0.5">
                  Cada cliente aniversariante recebe automaticamente:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white">+{BONUS_PONTOS} pontos</span>
                  <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white">{BONUS_DESCONTO}% desconto hoje</span>
                  <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white">Mensagem via WhatsApp</span>
                </div>
              </div>
            </div>
            {pendentes.length > 0 && (
              <Button onClick={enviarTodos} size="sm" className="gap-1.5 h-9 bg-amber-500 hover:bg-amber-600 text-white">
                <Gift weight="duotone" size={14}/>Enviar para todos
              </Button>
            )}
          </div>
        </div>

        {/* Aniversariantes de hoje */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Cake weight="duotone" size={15} className="text-rose-500"/>Aniversariantes hoje
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((c,i)=>{
              const tier = calcTier(c.totalVisitas, c.gasto)
              const pontos = calcPontos(c.gasto, tier)
              return (
                <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 relative overflow-hidden"
                >
                  {/* Confetti decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] bg-gradient-to-br from-rose-500/10 to-pink-500/10"/>
                  <div className="absolute top-2 right-2 text-lg">🎉</div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <Avatar name={c.nome} size="md"/>
                      <span className="absolute -bottom-1 -right-1 text-sm">🎂</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{c.nome}</p>
                      <TierBadge tier={tier} size="xs" className="mt-0.5"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                    <div className="rounded-xl bg-[var(--muted)] p-2">
                      <p className="text-sm font-bold">{c.totalVisitas}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">visitas</p>
                    </div>
                    <div className="rounded-xl bg-[var(--muted)] p-2">
                      <p className="text-sm font-bold text-amber-500">{pontos + BONUS_PONTOS}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">pts após bônus</p>
                    </div>
                  </div>

                  {c.bonusEnviado ? (
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-600">
                      <Check weight="bold" size={12}/>Bônus enviado
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={()=>enviarBonus(c.id)} className="flex-1 h-8 text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90">
                        <Gift weight="duotone" size={12}/>Enviar bônus
                      </Button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white hover:opacity-90 shrink-0">
                        <WhatsappLogo weight="fill" size={15}/>
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Próximos 30 dias */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star weight="duotone" size={15} className="text-amber-500"/>Próximos aniversariantes
          </h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {proximosMes.map((c,i)=>(
                <motion.div key={c.nome} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--muted)]/20 transition-colors"
                >
                  <Avatar name={c.nome} size="sm"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.nome}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{c.telefone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{new Date(c.nascimento+"T12:00").toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">em {c.diasAte} dias</p>
                  </div>
                  <span className="text-lg shrink-0">🎂</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
