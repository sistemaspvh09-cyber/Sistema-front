"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Star, Copy, Link, Users, ChartLineUp, ThumbsUp, Warning
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { GradientCard } from "@/components/ui/gradient-card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"

const avaliacoes = [
  { id:"a1", cliente:"Carlos Silva",   barbeiro:"João Mendes",   nota:5.0, comentario:"Atendimento impecável, voltarei sempre!", data:"2026-05-13", notas:{q1:5,q2:5,q3:5,q4:5,q5:5} },
  { id:"a2", cliente:"Pedro Santos",   barbeiro:"Marcos Silva",  nota:4.2, comentario:"Bom serviço, mas esperei um pouco.",        data:"2026-05-13", notas:{q1:5,q2:4,q3:5,q4:3,q5:4} },
  { id:"a3", cliente:"Lucas Oliveira", barbeiro:"João Mendes",   nota:4.8, comentario:"",                                          data:"2026-05-12", notas:{q1:5,q2:5,q3:5,q4:4,q5:5} },
  { id:"a4", cliente:"Rafael Costa",   barbeiro:"Rafael Torres", nota:3.6, comentario:"Serviço ok, ambiente poderia ser melhor.", data:"2026-05-10", notas:{q1:4,q2:4,q3:3,q4:3,q5:4} },
  { id:"a5", cliente:"Bruno Lima",     barbeiro:"Marcos Silva",  nota:5.0, comentario:"Melhor barbearia da região!",               data:"2026-05-08", notas:{q1:5,q2:5,q3:5,q4:5,q5:5} },
]

const barbeiroStats = [
  { nome:"João Mendes",   avaliacao:4.9, total:48, positivos:46 },
  { nome:"Marcos Silva",  avaliacao:4.7, total:34, positivos:31 },
  { nome:"Rafael Torres", avaliacao:4.5, total:22, positivos:19 },
]

const distribuicao = [5,4,3,2,1].map(n=>({
  estrelas: n,
  qtd: avaliacoes.filter(a=>Math.round(a.nota)===n).length,
  pct: Math.round((avaliacoes.filter(a=>Math.round(a.nota)===n).length / avaliacoes.length)*100),
}))

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const mediaGeral = (avaliacoes.reduce((a,v)=>a+v.nota,0)/avaliacoes.length).toFixed(1)

function StarDisplay({ nota, size=14 }: { nota: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n=>(
        <Star key={n} weight={n<=Math.round(nota)?"fill":"regular"} size={size}
          className={n<=Math.round(nota)?"text-amber-400":"text-[var(--border)]"}/>
      ))}
    </div>
  )
}

export default function AvaliacoesPage() {
  const [link] = useState(`${APP_URL}/avaliar/demo-token`)

  function copiarLink() {
    navigator.clipboard.writeText(link)
    toast.success("Link copiado!", { description: link })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Avaliações" subtitle="Satisfação dos clientes" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GradientCard title="Nota média" value={mediaGeral} icon={Star} gradient="from-amber-400 via-amber-500 to-orange-500" glowClass="glow-orange" subtitle={`${avaliacoes.length} avaliações`} delay={0} />
          <GradientCard title="Satisfação" value={`${Math.round((avaliacoes.filter(a=>a.nota>=4).length/avaliacoes.length)*100)}%`} icon={ThumbsUp} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle="notas 4 e 5" delay={0.06} />
          <GradientCard title="Total respostas" value={String(avaliacoes.length)} icon={Users} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle="este mês" delay={0.12} />
        </div>

        {/* Link de avaliação */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Link weight="duotone" size={16} className="text-[var(--primary)]"/>
            <p className="text-sm font-semibold">Link de avaliação</p>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Envie este link para o cliente após o atendimento para coletar avaliações automaticamente.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-xs text-[var(--muted-foreground)] truncate">
              {link}
            </div>
            <button onClick={copiarLink}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 shrink-0">
              <Copy weight="bold" size={13}/>Copiar
            </button>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-2">
            💡 Integre com WhatsApp para envio automático após cada atendimento
          </p>
        </div>

        <Tabs defaultValue="lista">
          <TabsList className="mb-4">
            <TabsTrigger value="lista"><Star weight="duotone" size={13}/>Avaliações</TabsTrigger>
            <TabsTrigger value="barbeiros"><Users weight="duotone" size={13}/>Por barbeiro</TabsTrigger>
            <TabsTrigger value="distribuicao"><ChartLineUp weight="duotone" size={13}/>Distribuição</TabsTrigger>
          </TabsList>

          {/* Lista */}
          <TabsContent value="lista">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {avaliacoes.map((a,i)=>(
                  <motion.div key={a.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--muted)]/20 transition-colors"
                  >
                    <Avatar name={a.cliente} size="sm"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{a.cliente}</p>
                        <div className="flex items-center gap-2">
                          <StarDisplay nota={a.nota}/>
                          <span className="text-xs font-bold text-amber-500">{a.nota.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{a.barbeiro} · {formatDate(a.data)}</p>
                      {a.comentario && (
                        <p className="mt-2 text-xs italic text-[var(--muted-foreground)] border-l-2 border-[var(--primary)]/30 pl-2">"{a.comentario}"</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Por barbeiro */}
          <TabsContent value="barbeiros">
            <div className="space-y-3">
              {barbeiroStats.map((b,i)=>(
                <motion.div key={b.nome} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={b.nome} size="md"/>
                      <div>
                        <p className="text-sm font-bold">{b.nome}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StarDisplay nota={b.avaliacao}/>
                          <span className="text-xs font-semibold text-amber-500">{b.avaliacao}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{b.total} avaliações</p>
                      <p className="text-xs text-emerald-600">{Math.round((b.positivos/b.total)*100)}% positivas</p>
                    </div>
                  </div>
                  <Progress value={b.positivos} max={b.total} barClassName="bg-amber-400" showLabel/>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Distribuição */}
          <TabsContent value="distribuicao">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-amber-500">{mediaGeral}</p>
                  <StarDisplay nota={Number(mediaGeral)} size={20}/>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{avaliacoes.length} avaliações</p>
                </div>
                <div className="flex-1 space-y-2">
                  {distribuicao.map(d=>(
                    <div key={d.estrelas} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right font-medium">{d.estrelas}</span>
                      <Star weight="fill" size={12} className="text-amber-400 shrink-0"/>
                      <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${d.pct}%`}} transition={{delay:0.3,duration:0.6}}
                          className="h-full rounded-full bg-amber-400"/>
                      </div>
                      <span className="w-8 text-[var(--muted-foreground)]">{d.pct}%</span>
                      <span className="w-4 text-[var(--muted-foreground)]">{d.qtd}</span>
                    </div>
                  ))}
                </div>
              </div>

              {avaliacoes.some(a=>a.nota<4) && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
                  <Warning weight="duotone" size={15} className="text-amber-500 shrink-0 mt-0.5"/>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {avaliacoes.filter(a=>a.nota<4).length} avaliação(ões) com nota abaixo de 4 — revise os feedbacks para melhorias.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
