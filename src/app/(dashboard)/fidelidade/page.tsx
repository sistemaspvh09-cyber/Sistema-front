"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Gift, Star, Trophy, ChartLineUp, Users, Confetti, Gear, Pencil, CheckCircle, Info } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TierBadge } from "@/components/ui/tier-badge"
import { GradientCard } from "@/components/ui/gradient-card"
import { calcTier, calcPontos, pontosParaProximoTier, diasSemVisita, TIERS, type TierConfig } from "@/lib/vip"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

const clientes = [
  { id:"1", nome:"Thiago Souza",   totalVisitas:51, ultimaVisita:"2026-05-06", gasto:3570 },
  { id:"2", nome:"Lucas Oliveira", totalVisitas:41, ultimaVisita:"2026-05-10", gasto:2870 },
  { id:"3", nome:"Carlos Silva",   totalVisitas:32, ultimaVisita:"2026-05-13", gasto:2240 },
  { id:"4", nome:"Bruno Lima",     totalVisitas:15, ultimaVisita:"2026-05-08", gasto:1125 },
  { id:"5", nome:"Pedro Santos",   totalVisitas:18, ultimaVisita:"2026-05-13", gasto:810  },
  { id:"6", nome:"Rafael Costa",   totalVisitas:7,  ultimaVisita:"2026-04-28", gasto:490  },
  { id:"7", nome:"Diego Martins",  totalVisitas:5,  ultimaVisita:"2026-05-12", gasto:350  },
]

const recompensas = [
  { id:"r1", nome:"Desconto 5% Silver",    tier:"silver",   tipo:"desconto",  pontos:0,   descricao:"Desconto automático para clientes Prata" },
  { id:"r2", nome:"Desconto 10% Gold",     tier:"gold",     tipo:"desconto",  pontos:0,   descricao:"Desconto automático para clientes Ouro" },
  { id:"r3", nome:"Desconto 15% Platinum", tier:"platinum", tipo:"desconto",  pontos:0,   descricao:"Desconto automático para clientes Platinum" },
  { id:"r4", nome:"Corte Grátis",          tier:"gold",     tipo:"servico",   pontos:500, descricao:"Resgate 1 corte gratuito a cada 10 visitas" },
  { id:"r5", nome:"Corte + Barba Grátis",  tier:"platinum", tipo:"servico",   pontos:800, descricao:"Resgate a cada 5 visitas" },
  { id:"r6", nome:"Kit Produtos",          tier:"platinum", tipo:"produto",   pontos:600, descricao:"Brinde mensal com kit personalizado" },
]

interface RegraFidelidade {
  ativoGeral: boolean
  pontosPerReal: number
  expiracaoDias: number
  mensagemBemVindo: string
  notificarTierUp: boolean
  notificarAniversario: boolean
  bonusAniversario: number
  descontoAutomatico: boolean
}

const regrasPadrao: RegraFidelidade = {
  ativoGeral: true,
  pontosPerReal: 1,
  expiracaoDias: 365,
  mensagemBemVindo: "Bem-vindo ao programa de fidelidade BarberPro! Acumule pontos a cada visita.",
  notificarTierUp: true,
  notificarAniversario: true,
  bonusAniversario: 50,
  descontoAutomatico: true,
}

export default function FidelidadePage() {
  const [busca, setBusca] = useState("")
  const [regras, setRegras] = useState<RegraFidelidade>(regrasPadrao)
  const { toast } = useToast()
  function updRegra<K extends keyof RegraFidelidade>(k:K, v:RegraFidelidade[K]) { setRegras(p=>({...p,[k]:v})) }
  function salvarRegras() { toast({ type:"success", title:"Configurações salvas!", description:"Regras do programa atualizadas." }) }

  const clientesComTier = clientes
    .map(c => ({ ...c, tier: calcTier(c.totalVisitas, c.gasto), pontos: calcPontos(c.gasto, calcTier(c.totalVisitas, c.gasto)), prox: pontosParaProximoTier(c.totalVisitas, c.gasto) }))
    .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.pontos - a.pontos)

  const totalPontos = clientesComTier.reduce((s, c) => s + c.pontos, 0)
  const platinums = clientes.filter(c => calcTier(c.totalVisitas, c.gasto).tier === "platinum").length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Fidelidade" subtitle="Programa de pontos e benefícios" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 animate-fade-in">

        {/* Hero stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GradientCard title="Pontos emitidos" value={totalPontos.toLocaleString("pt-BR")} icon={Star} gradient="from-amber-400 via-amber-500 to-orange-500" glowClass="glow-orange" subtitle="total acumulado" delay={0} />
          <GradientCard title="Clientes Platinum" value={String(platinums)} icon={Crown} gradient="from-violet-500 via-purple-600 to-fuchsia-700" glowClass="glow-purple" subtitle="nível máximo" delay={0.06} />
          <GradientCard title="Clientes ativos" value={String(clientes.filter(c=>diasSemVisita(c.ultimaVisita)<=30).length)} icon={Users} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle="últimos 30 dias" delay={0.12} />
          <GradientCard title="Recompensas" value={String(recompensas.length)} icon={Gift} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle="disponíveis" delay={0.18} />
        </div>

        {/* HIDDEN — for compatibility only */}
        <div className="hidden">
          {[
            { label:"x", v:"x", icon:Star, g:"", s:"" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.g} p-5 text-white shadow-xl ${s.s}`}
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <s.icon weight="duotone" size={22} className="mb-3 opacity-90" />
              <p className="text-2xl font-bold">{s.v}</p>
              <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tiers overview */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier, i) => {
            const count = clientes.filter(c => calcTier(c.totalVisitas, c.gasto).tier === tier.tier).length
            return (
              <motion.div key={tier.tier} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.05 }}
                className={`relative overflow-hidden rounded-2xl border ${tier.corBorda} p-4`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.corGradient} opacity-5`} />
                <div className="relative">
                  <TierBadge tier={tier} size="sm" className="mb-3" />
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">clientes</p>
                  <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                    <p>Min: {tier.minVisitas} visitas</p>
                    <p>Min: {formatCurrency(tier.minGasto)} gasto</p>
                  </div>
                  {tier.desconto > 0 && (
                    <div className={`mt-2 rounded-lg px-2 py-1 text-xs font-semibold bg-gradient-to-r ${tier.corGradient} text-white`}>
                      {tier.desconto}% desconto automático
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        <Tabs defaultValue="ranking">
          <TabsList className="mb-4">
            <TabsTrigger value="ranking"><Trophy weight="duotone" size={14} />Ranking</TabsTrigger>
            <TabsTrigger value="recompensas"><Gift weight="duotone" size={14} />Recompensas</TabsTrigger>
            <TabsTrigger value="beneficios"><Star weight="duotone" size={14} />Benefícios</TabsTrigger>
            <TabsTrigger value="config"><Gear weight="duotone" size={14} />Configurar</TabsTrigger>
          </TabsList>

          {/* Ranking */}
          <TabsContent value="ranking">
            <div className="mb-3">
              <input type="text" placeholder="Buscar cliente..." value={busca} onChange={e=>setBusca(e.target.value)}
                className="w-52 h-9 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {clientesComTier.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)]/30 transition-colors"
                  >
                    {/* Posição */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      i===0 ? "bg-amber-400/20 text-amber-500" :
                      i===1 ? "bg-slate-400/20 text-slate-500" :
                      i===2 ? "bg-orange-400/20 text-orange-600" :
                      "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}>
                      {i < 3 ? ["🥇","🥈","🥉"][i] : i+1}
                    </div>

                    <Avatar name={c.nome} size="sm" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{c.nome}</p>
                        <TierBadge tier={c.tier} size="xs" showLabel={false} />
                      </div>
                      {c.prox.tier && (
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={(c.prox.progressoVisitas+c.prox.progressoGasto)/2} className="w-24 h-1" />
                          <span className="text-[10px] text-[var(--muted-foreground)]">→ {c.prox.tier.label}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[var(--primary)]">{c.pontos.toLocaleString("pt-BR")} pts</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{c.totalVisitas} visitas</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Recompensas */}
          <TabsContent value="recompensas">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recompensas.map((r, i) => {
                const tier = TIERS.find(t=>t.tier===r.tier)!
                return (
                  <motion.div key={r.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                    className={`rounded-2xl border ${tier.corBorda} bg-[var(--card)] p-4 relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tier.corGradient} opacity-3`} />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tier.corGradient} shadow-md`}>
                          {r.tipo==="desconto"?<Star weight="fill" size={18} className="text-white"/>:
                           r.tipo==="servico" ?<Confetti weight="fill" size={18} className="text-white"/>:
                           <Gift weight="fill" size={18} className="text-white"/>}
                        </div>
                        <TierBadge tier={tier} size="xs" />
                      </div>
                      <p className="font-semibold text-sm">{r.nome}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{r.descricao}</p>
                      {r.pontos > 0 && (
                        <p className="mt-2 text-xs font-semibold text-[var(--primary)]">{r.pontos} pontos para resgatar</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          {/* Benefícios por tier */}
          <TabsContent value="beneficios">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((tier, i) => (
                <motion.div key={tier.tier} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                  className={`rounded-2xl border ${tier.corBorda} overflow-hidden`}
                >
                  <div className={`bg-gradient-to-r ${tier.corGradient} px-4 py-3 text-white`}>
                    <TierBadge tier={tier} size="sm" className="bg-white/20 border-white/30" />
                    <p className="text-xs opacity-80 mt-1.5">{tier.pontosMultip}x pontos · {tier.desconto}% desconto</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {tier.beneficios.map((b,j)=>(
                      <div key={j} className="flex items-start gap-2 text-xs">
                        <ChartLineUp weight="duotone" size={12} className={`mt-0.5 shrink-0 ${tier.corTexto}`} />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Configuração */}
          <TabsContent value="config">
            <div className="grid gap-5 lg:grid-cols-2">

              {/* Regras gerais */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gear weight="duotone" size={16} className="text-[var(--primary)]" />
                  <p className="text-sm font-semibold">Regras gerais</p>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium">Programa ativo</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Ativar/desativar para todos os clientes</p>
                  </div>
                  <Switch checked={regras.ativoGeral} onCheckedChange={v=>updRegra("ativoGeral",v)} />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium">Desconto automático por tier</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Aplicar desconto na venda sem precisar de cupom</p>
                  </div>
                  <Switch checked={regras.descontoAutomatico} onCheckedChange={v=>updRegra("descontoAutomatico",v)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Pontos por R$1 gasto</label>
                    <Input type="number" value={regras.pontosPerReal} onChange={e=>updRegra("pontosPerReal",Number(e.target.value))} min={0.5} step={0.5} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Expiração (dias)</label>
                    <Input type="number" value={regras.expiracaoDias} onChange={e=>updRegra("expiracaoDias",Number(e.target.value))} min={30} step={30} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Bônus aniversário (pts)</label>
                    <Input type="number" value={regras.bonusAniversario} onChange={e=>updRegra("bonusAniversario",Number(e.target.value))} min={0} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Mensagem de boas-vindas</label>
                  <textarea value={regras.mensagemBemVindo} onChange={e=>updRegra("mensagemBemVindo",e.target.value)} rows={3}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] resize-none" />
                </div>
              </div>

              {/* Notificações do programa */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info weight="duotone" size={16} className="text-[var(--primary)]" />
                  <p className="text-sm font-semibold">Notificações do programa</p>
                </div>

                {[
                  { key:"notificarTierUp"     as const, label:"Subiu de tier",         desc:"Notificar cliente quando avançar de nível" },
                  { key:"notificarAniversario" as const, label:"Aniversário do cliente", desc:"Parabenizar e entregar bônus de pontos" },
                ].map(n=>(
                  <div key={n.key} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{n.desc}</p>
                    </div>
                    <Switch checked={regras[n.key] as boolean} onCheckedChange={v=>updRegra(n.key,v)} />
                  </div>
                ))}

                {/* Preview tiers */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Resumo dos tiers</p>
                  {TIERS.map(tier=>(
                    <div key={tier.tier} className={`flex items-center justify-between rounded-xl border ${tier.corBorda} px-3 py-2`}>
                      <TierBadge tier={tier} size="xs" />
                      <span className="text-xs text-[var(--muted-foreground)]">{tier.minVisitas} visitas · {formatCurrency(tier.minGasto)}</span>
                      <span className={`text-xs font-semibold ${tier.corTexto}`}>{tier.pontosMultip}x pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={salvarRegras} className="gap-2">
                <CheckCircle weight="duotone" size={15} />Salvar configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
