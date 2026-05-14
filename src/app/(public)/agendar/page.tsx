"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Scissors, CalendarBlank, Clock, User, QrCode,
  CheckCircle, ArrowRight, ArrowLeft, Phone, Sparkle,
  CreditCard, Money, X
} from "@phosphor-icons/react"
import { formatCurrency } from "@/lib/utils"

/* ── Dados da barbearia ─────────────────────────────────────────────── */
const BARBEARIA = {
  nome: "BarberPro",
  slogan: "Estilo, precisão e atendimento premium",
  endereco: "Rua das Flores, 123 — São Paulo, SP",
  horario: "Seg–Sex 8h–20h · Sáb 8h–18h",
  cor: "from-orange-500 to-rose-600",
}

const SERVICOS = [
  { id:"s1", nome:"Corte Masculino",    preco:45,  min:30, popular:true  },
  { id:"s2", nome:"Barba Completa",     preco:35,  min:25, popular:true  },
  { id:"s3", nome:"Corte + Barba",      preco:70,  min:50, popular:true  },
  { id:"s4", nome:"Corte Degradê",      preco:55,  min:40, popular:false },
  { id:"s5", nome:"Platinado",          preco:120, min:90, popular:false },
  { id:"s6", nome:"Hidratação Capilar", preco:60,  min:40, popular:false },
]

const BARBEIROS = [
  { id:"b1", nome:"João Mendes",   avaliacao:4.9, especialidades:["Corte","Barba","Coloração"] },
  { id:"b2", nome:"Marcos Silva",  avaliacao:4.7, especialidades:["Corte","Barba","Hidratação"] },
  { id:"b3", nome:"Rafael Torres", avaliacao:4.5, especialidades:["Corte","Sobrancelha"] },
]

const HORARIOS = ["09:00","09:30","10:00","10:30","11:00","11:30",
                  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"]

const OCUPADOS = ["09:30","10:30","14:00"]

type Passo = "servico" | "barbeiro" | "horario" | "dados" | "pagamento" | "confirmacao"
type Metodo = "pix" | "cartao" | "dinheiro" | "na_hora"

function Stepper({ atual }: { atual: Passo }) {
  const passos: { id: Passo; label: string }[] = [
    { id:"servico",   label:"Serviço"   },
    { id:"barbeiro",  label:"Barbeiro"  },
    { id:"horario",   label:"Horário"   },
    { id:"dados",     label:"Seus dados"},
    { id:"pagamento", label:"Pagamento" },
  ]
  const idx = passos.findIndex(p=>p.id===atual)
  return (
    <div className="flex items-center gap-1 justify-center mb-8">
      {passos.map((p,i)=>(
        <div key={p.id} className="flex items-center gap-1">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
            i<idx  ? "bg-emerald-500 text-white" :
            i===idx? "bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20" :
                     "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}>
            {i < idx ? <CheckCircle weight="fill" size={14}/> : i+1}
          </div>
          <span className={`text-[10px] font-medium hidden sm:block ${i===idx?"text-[var(--primary)]":"text-[var(--muted-foreground)]"}`}>{p.label}</span>
          {i < passos.length-1 && <div className={`h-px w-6 mx-0.5 ${i<idx?"bg-emerald-500":"bg-[var(--border)]"}`} />}
        </div>
      ))}
    </div>
  )
}

function Avatar({ nome, size=40 }: { nome:string; size?:number }) {
  const colors = ["#f97316","#3b82f6","#8b5cf6","#22c55e","#ec4899"]
  let n=0; for(let i=0;i<nome.length;i++) n+=nome.charCodeAt(i)
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-2xl font-bold text-white`}
      style={{ width:size, height:size, fontSize:size*0.35, background:colors[n%colors.length] }}>
      {nome.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()}
    </div>
  )
}

export default function AgendarPage() {
  const [passo, setPasso] = useState<Passo>("servico")
  const [servicoSel, setServicoSel] = useState<string|null>(null)
  const [barbeiroSel, setBarbeiroSel] = useState<string|null>(null)
  const [data, setData] = useState("")
  const [horarioSel, setHorarioSel] = useState<string|null>(null)
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [metodo, setMetodo] = useState<Metodo>("pix")
  const [loading, setLoading] = useState(false)

  const servico = SERVICOS.find(s=>s.id===servicoSel)
  const barbeiro = BARBEIROS.find(b=>b.id===barbeiroSel)

  async function confirmar() {
    setLoading(true)
    await new Promise(r=>setTimeout(r,1500))
    setLoading(false)
    setPasso("confirmacao")
  }

  const slide = { initial:{opacity:0,x:30}, animate:{opacity:1,x:0}, exit:{opacity:0,x:-30} }

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Header público */}
      <div className={`bg-gradient-to-r ${BARBEARIA.cor} relative overflow-hidden`}>
        {/* Dot pattern */}
        <div className="absolute inset-0" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E\")"}} />
        <div className="relative max-w-lg mx-auto px-4 py-8 text-white text-center">
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-4 shadow-xl mx-auto"
          >
            <Scissors weight="duotone" size={28} />
          </motion.div>
          <h1 className="text-2xl font-black">{BARBEARIA.nome}</h1>
          <p className="text-white/80 text-sm mt-1">{BARBEARIA.slogan}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/70">
            <span>{BARBEARIA.endereco}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {passo !== "confirmacao" && <Stepper atual={passo} />}

        <AnimatePresence mode="wait">
          {/* PASSO 1: Serviço */}
          {passo === "servico" && (
            <motion.div key="servico" {...slide} transition={{duration:.2}}>
              <h2 className="text-lg font-bold mb-1">Escolha o serviço</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Selecione o serviço desejado</p>
              <div className="space-y-2">
                {SERVICOS.map(s=>(
                  <button key={s.id} onClick={()=>setServicoSel(s.id)}
                    className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
                      servicoSel===s.id ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm" : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${servicoSel===s.id?"bg-[var(--primary)] text-white":"bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                      <Scissors weight="duotone" size={18}/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{s.nome}</p>
                        {s.popular && <span className="rounded-full bg-[var(--primary)] px-1.5 py-px text-[9px] font-bold text-white">Popular</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                        <Clock weight="duotone" size={11}/>{s.min} min
                      </div>
                    </div>
                    <p className="text-base font-bold text-[var(--primary)]">{formatCurrency(s.preco)}</p>
                    {servicoSel===s.id && <CheckCircle weight="fill" size={18} className="text-[var(--primary)] shrink-0"/>}
                  </button>
                ))}
              </div>
              <button disabled={!servicoSel} onClick={()=>setPasso("barbeiro")}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:opacity-90 disabled:opacity-40 transition-all">
                Continuar <ArrowRight weight="bold" size={16}/>
              </button>
            </motion.div>
          )}

          {/* PASSO 2: Barbeiro */}
          {passo === "barbeiro" && (
            <motion.div key="barbeiro" {...slide} transition={{duration:.2}}>
              <h2 className="text-lg font-bold mb-1">Escolha o barbeiro</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Ou deixe em branco para o próximo disponível</p>
              <div className="space-y-2">
                <button onClick={()=>setBarbeiroSel(null)}
                  className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    barbeiroSel===null?"border-[var(--primary)] bg-[var(--primary)]/5":"border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)]">
                    <Sparkle weight="duotone" size={18} className="text-[var(--primary)]"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Qualquer disponível</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Próximo barbeiro livre</p>
                  </div>
                  {barbeiroSel===null && <CheckCircle weight="fill" size={18} className="text-[var(--primary)] ml-auto shrink-0"/>}
                </button>

                {BARBEIROS.map(b=>(
                  <button key={b.id} onClick={()=>setBarbeiroSel(b.id)}
                    className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      barbeiroSel===b.id?"border-[var(--primary)] bg-[var(--primary)]/5":"border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    <Avatar nome={b.nome} size={42} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{b.nome}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        {"★".repeat(Math.round(b.avaliacao))} <span className="text-[var(--muted-foreground)]">{b.avaliacao}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.especialidades.slice(0,2).map(e=>( <span key={e} className="rounded-full bg-[var(--muted)] px-1.5 py-px text-[9px]">{e}</span> ))}
                      </div>
                    </div>
                    {barbeiroSel===b.id && <CheckCircle weight="fill" size={18} className="text-[var(--primary)] shrink-0"/>}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>setPasso("servico")} className="flex items-center gap-1 rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors">
                  <ArrowLeft size={16}/>Voltar
                </button>
                <button onClick={()=>setPasso("horario")} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:opacity-90 transition-all">
                  Continuar <ArrowRight weight="bold" size={16}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: Horário */}
          {passo === "horario" && (
            <motion.div key="horario" {...slide} transition={{duration:.2}}>
              <h2 className="text-lg font-bold mb-1">Escolha a data e horário</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-4"></p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Data *</label>
                  <input type="date" value={data} onChange={e=>setData(e.target.value)} min={new Date().toISOString().slice(0,10)}
                    className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[var(--primary)]" />
                </div>
                {data && (
                  <div>
                    <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Horários disponíveis</p>
                    <div className="grid grid-cols-4 gap-2">
                      {HORARIOS.map(h=>{
                        const ocupado = OCUPADOS.includes(h)
                        return (
                          <button key={h} disabled={ocupado} onClick={()=>setHorarioSel(h)}
                            className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                              ocupado ? "opacity-40 cursor-not-allowed bg-[var(--muted)] border-[var(--border)] line-through" :
                              horarioSel===h ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm shadow-orange-500/30" :
                              "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/60"
                            }`}
                          >{h}</button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>setPasso("barbeiro")} className="flex items-center gap-1 rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors">
                  <ArrowLeft size={16}/>Voltar
                </button>
                <button disabled={!data||!horarioSel} onClick={()=>setPasso("dados")} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:opacity-90 disabled:opacity-40 transition-all">
                  Continuar <ArrowRight weight="bold" size={16}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 4: Dados */}
          {passo === "dados" && (
            <motion.div key="dados" {...slide} transition={{duration:.2}}>
              <h2 className="text-lg font-bold mb-1">Seus dados</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Para confirmarmos seu agendamento</p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome completo *</label>
                  <div className="relative">
                    <User weight="duotone" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"/>
                    <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome"
                      className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-sm outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Celular *</label>
                  <div className="relative">
                    <Phone weight="duotone" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"/>
                    <input value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="(11) 9xxxx-xxxx"
                      className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-sm outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>

                {/* Resumo */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Resumo do agendamento</p>
                  {[
                    ["Serviço",  servico?.nome ?? "—"],
                    ["Barbeiro", barbeiroSel ? barbeiro?.nome : "Qualquer disponível"],
                    ["Data",     data ? new Date(data+"T12:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}) : "—"],
                    ["Horário",  horarioSel ?? "—"],
                  ].map(([k,v])=>(
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span className="text-[var(--muted-foreground)]">{k}</span>
                      <span className="font-medium capitalize">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-[var(--border)] mt-1">
                    <span>Total</span>
                    <span className="text-[var(--primary)]">{formatCurrency(servico?.preco ?? 0)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>setPasso("horario")} className="flex items-center gap-1 rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors">
                  <ArrowLeft size={16}/>Voltar
                </button>
                <button disabled={!nome||!telefone} onClick={()=>setPasso("pagamento")} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:opacity-90 disabled:opacity-40 transition-all">
                  Confirmar <ArrowRight weight="bold" size={16}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 5: Pagamento */}
          {passo === "pagamento" && (
            <motion.div key="pagamento" {...slide} transition={{duration:.2}}>
              <h2 className="text-lg font-bold mb-1">Como prefere pagar?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Pague agora para garantir o horário, ou na hora da visita</p>
              <div className="space-y-2 mb-5">
                {([
                  { id:"pix" as Metodo,     label:"PIX",                icon:QrCode,    desc:"Aprovação instantânea — Grátis",       hl:true  },
                  { id:"cartao" as Metodo,  label:"Cartão online",      icon:CreditCard,desc:"Crédito ou débito via link seguro",     hl:false },
                  { id:"na_hora" as Metodo, label:"Pagar na hora",      icon:Clock,     desc:"Cartão, dinheiro ou PIX na barbearia",  hl:false },
                ]).map(m=>(
                  <button key={m.id} onClick={()=>setMetodo(m.id)}
                    className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      metodo===m.id ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metodo===m.id?"bg-[var(--primary)] text-white":"bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                      <m.icon weight="duotone" size={20}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{m.desc}</p>
                    </div>
                    {m.hl && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Recomendado</span>}
                    {metodo===m.id && <CheckCircle weight="fill" size={18} className="text-[var(--primary)] shrink-0"/>}
                  </button>
                ))}
              </div>

              {/* QR Code PIX (simulado) */}
              {metodo==="pix" && (
                <motion.div initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center mb-4"
                >
                  <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">QR Code PIX — {formatCurrency(servico?.preco ?? 0)}</p>
                  <div className="inline-flex h-36 w-36 items-center justify-center rounded-2xl bg-[var(--muted)] mx-auto mb-3">
                    <QrCode weight="duotone" size={64} className="text-[var(--muted-foreground)] opacity-40" />
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    O QR Code real será gerado via InfinitePay ao confirmar.<br/>
                    Validade: 30 minutos.
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button onClick={()=>setPasso("dados")} className="flex items-center gap-1 rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm font-medium hover:bg-[var(--muted)] transition-colors">
                  <ArrowLeft size={16}/>Voltar
                </button>
                <button onClick={confirmar} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:opacity-90 transition-all">
                  {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>Aguarde...</> : <>Confirmar agendamento <CheckCircle weight="bold" size={16}/></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 6: Confirmação */}
          {passo === "confirmacao" && (
            <motion.div key="confirmacao" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="text-center py-6">
              <motion.div animate={{scale:[1,1.1,1]}} transition={{duration:.5}}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-4"
              >
                <CheckCircle weight="duotone" size={48} className="text-emerald-500" />
              </motion.div>

              <h2 className="text-2xl font-black mb-2">Agendamento confirmado!</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">Te esperamos, {nome.split(" ")[0]}!</p>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left mb-6">
                {[
                  ["Serviço",  servico?.nome ?? "—"],
                  ["Barbeiro", barbeiroSel ? barbeiro?.nome : "Próximo disponível"],
                  ["Data",     data ? new Date(data+"T12:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}) : "—"],
                  ["Horário",  horarioSel ?? "—"],
                  ["Local",    BARBEARIA.endereco],
                ].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-[var(--muted-foreground)]">{k}</span>
                    <span className="font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                Você receberá uma confirmação no WhatsApp: <strong>{telefone}</strong>
              </p>

              <button onClick={()=>{ setPasso("servico"); setServicoSel(null); setBarbeiroSel(null); setData(""); setHorarioSel(null); setNome(""); setTelefone("") }}
                className="w-full rounded-2xl border border-[var(--border)] py-3 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
              >
                Fazer outro agendamento
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer público */}
      <div className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted-foreground)]">
        <p>Agendamento seguro via <strong className="text-[var(--foreground)]">BarberPro</strong></p>
        <p className="mt-1 opacity-60">Pagamentos processados por InfinitePay · Dados criptografados</p>
      </div>
    </div>
  )
}
