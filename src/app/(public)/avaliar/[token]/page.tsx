"use client"

import { use, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Scissors, Star, CheckCircle, ArrowRight } from "@phosphor-icons/react"
import { toast } from "sonner"

const QUESTOES = [
  { id:"q1", label:"Atendimento do barbeiro",     emoji:"✂️" },
  { id:"q2", label:"Qualidade do serviço",        emoji:"⭐" },
  { id:"q3", label:"Ambiente e limpeza",          emoji:"🏆" },
  { id:"q4", label:"Tempo de espera",             emoji:"⏱️" },
  { id:"q5", label:"Recomendaria para amigos",    emoji:"💬" },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n=>(
        <button key={n}
          onMouseEnter={()=>setHover(n)}
          onMouseLeave={()=>setHover(0)}
          onClick={()=>onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            weight={n<=(hover||value)?"fill":"regular"}
            size={36}
            className={`transition-colors ${n<=(hover||value)?"text-amber-400":"text-[var(--border)]"}`}
          />
        </button>
      ))}
    </div>
  )
}

export default function AvaliarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [step, setStep] = useState<"avaliando"|"concluido">("avaliando")
  const [notas, setNotas] = useState<Record<string,number>>({})
  const [comentario, setComentario] = useState("")
  const [loading, setLoading] = useState(false)

  const todasRespondidas = QUESTOES.every(q=>notas[q.id]>0)
  const media = todasRespondidas
    ? (Object.values(notas).reduce((a,b)=>a+b,0) / QUESTOES.length).toFixed(1)
    : "0"

  async function enviar() {
    setLoading(true)
    await new Promise(r=>setTimeout(r,1000))
    setLoading(false)
    setStep("concluido")
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E\")"}}/>
        <div className="relative max-w-lg mx-auto px-4 py-8 text-center text-white">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-4 shadow-xl mx-auto">
            <Scissors weight="duotone" size={28}/>
          </div>
          <h1 className="text-xl font-black">BarberPro</h1>
          <p className="text-white/80 text-sm mt-1">Como foi sua experiência?</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "avaliando" ? (
            <motion.div key="form" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-5">

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center">
                <p className="text-sm font-semibold mb-1">Avaliação geral</p>
                {todasRespondidas ? (
                  <div>
                    <p className="text-5xl font-black text-amber-500">{media}</p>
                    <div className="flex justify-center mt-2">
                      {[1,2,3,4,5].map(n=>(
                        <Star key={n} weight={n<=Math.round(Number(media))?"fill":"regular"}
                          size={20} className={n<=Math.round(Number(media))?"text-amber-400":"text-[var(--border)]"}/>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">Responda todas as perguntas abaixo</p>
                )}
              </div>

              {QUESTOES.map((q,i)=>(
                <motion.div key={q.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{q.emoji}</span>
                    <p className="text-sm font-semibold">{q.label}</p>
                  </div>
                  <StarRating value={notas[q.id]??0} onChange={v=>setNotas(p=>({...p,[q.id]:v}))}/>
                  {notas[q.id] > 0 && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                      {["","Ruim","Regular","Bom","Muito bom","Excelente"][notas[q.id]]}
                    </p>
                  )}
                </motion.div>
              ))}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm font-semibold mb-2">Comentário (opcional)</p>
                <textarea value={comentario} onChange={e=>setComentario(e.target.value)}
                  rows={3} placeholder="Conte mais sobre sua experiência..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] resize-none"/>
              </div>

              <button disabled={!todasRespondidas||loading} onClick={enviar}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>Enviando...</> : <>Enviar avaliação <ArrowRight weight="bold" size={16}/></>}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="text-center py-8">
              <motion.div animate={{scale:[1,1.1,1]}} transition={{duration:.5}}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 mb-4">
                <CheckCircle weight="duotone" size={48} className="text-amber-500"/>
              </motion.div>
              <h2 className="text-2xl font-black mb-2">Obrigado! ⭐</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Sua avaliação foi registrada com sucesso.</p>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center mb-6">
                <p className="text-5xl font-black text-amber-500">{media}</p>
                <div className="flex justify-center mt-2">
                  {[1,2,3,4,5].map(n=>(
                    <Star key={n} weight={n<=Math.round(Number(media))?"fill":"regular"}
                      size={22} className={n<=Math.round(Number(media))?"text-amber-400":"text-[var(--border)]"}/>
                  ))}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">Sua nota média</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Seu feedback nos ajuda a melhorar cada dia mais. Nos vemos na próxima visita! ✂️</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
