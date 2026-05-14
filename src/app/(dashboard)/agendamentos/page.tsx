"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CalendarBlank, Clock, CaretLeft, CaretRight,
  Plus, PencilSimple, X, Check, Hourglass
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Agendamento {
  id: string; hora: string; duracaoMin: number; cliente: string
  telefone: string; servicos: string[]; barbeiro: string
  valor: number; status: string; obs: string; data: string
}

const agendamentosIniciais: Agendamento[] = [
  { id:"1", hora:"09:00", duracaoMin:50, cliente:"Carlos Silva",   telefone:"(11)98765-4321", servicos:["Corte","Barba"],  barbeiro:"João",   valor:70,  status:"concluido",    obs:"",                       data:"2026-05-14" },
  { id:"2", hora:"10:00", duracaoMin:30, cliente:"Pedro Santos",   telefone:"(11)91234-5678", servicos:["Corte"],          barbeiro:"Marcos", valor:45,  status:"em_andamento", obs:"",                       data:"2026-05-14" },
  { id:"3", hora:"11:00", duracaoMin:25, cliente:"Lucas Oliveira", telefone:"(11)99876-5432", servicos:["Barba"],          barbeiro:"João",   valor:35,  status:"confirmado",   obs:"Prefere navalha",        data:"2026-05-14" },
  { id:"4", hora:"13:00", duracaoMin:50, cliente:"Rafael Costa",   telefone:"(11)94567-8901", servicos:["Corte","Barba"], barbeiro:"Marcos", valor:70,  status:"agendado",     obs:"",                       data:"2026-05-14" },
  { id:"5", hora:"14:30", duracaoMin:90, cliente:"Bruno Lima",     telefone:"(11)92345-6789", servicos:["Platinado"],     barbeiro:"João",   valor:120, status:"agendado",     obs:"",                       data:"2026-05-14" },
  { id:"6", hora:"16:00", duracaoMin:30, cliente:"Diego Martins",  telefone:"(11)93456-7890", servicos:["Corte"],         barbeiro:"Rafael", valor:45,  status:"agendado",     obs:"Primeiro atendimento",   data:"2026-05-14" },
]

const statusCfg: Record<string, { label:string; variant:"success"|"default"|"warning"|"secondary"|"destructive"; dot:string; icon:React.ElementType }> = {
  concluido:    { label:"Concluído",    variant:"success",     dot:"bg-emerald-500", icon:Check    },
  em_andamento: { label:"Atendendo",    variant:"default",     dot:"bg-blue-500",    icon:Hourglass },
  confirmado:   { label:"Confirmado",   variant:"warning",     dot:"bg-amber-500",   icon:Check    },
  agendado:     { label:"Agendado",     variant:"secondary",   dot:"bg-zinc-400",    icon:CalendarBlank },
  cancelado:    { label:"Cancelado",    variant:"destructive", dot:"bg-red-500",     icon:X        },
}

const BARBEIROS = ["João","Marcos","Rafael"]
const SERVICOS_OPT = ["Corte","Barba","Corte + Barba","Platinado","Hidratação","Sobrancelha","Degradê"]
const STATUS_OPT = [
  { value:"agendado",label:"Agendado" },{ value:"confirmado",label:"Confirmado" },
  { value:"em_andamento",label:"Em andamento" },{ value:"concluido",label:"Concluído" },
  { value:"cancelado",label:"Cancelado" },
]

const HORAS_GRID = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"]
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

function AgendamentoDrawer({ agendamento, open, onClose, onSave }: {
  agendamento: Agendamento | null; open: boolean; onClose: () => void; onSave: (a: Agendamento) => void
}) {
  const isNew = !agendamento?.id
  const empty: Omit<Agendamento,"id"> = {
    hora:"09:00", duracaoMin:30, cliente:"", telefone:"", servicos:[], barbeiro:BARBEIROS[0],
    valor:0, status:"agendado", obs:"", data:new Date().toISOString().slice(0,10)
  }
  const [form, setForm] = useState<Omit<Agendamento,"id">>(agendamento ? { ...agendamento } : empty)
  const [servInput, setServInput] = useState("")

  function upd<K extends keyof typeof form>(k:K, v:typeof form[K]) { setForm(p=>({...p,[k]:v})) }
  function toggleServ(s:string) {
    setForm(p => ({...p, servicos: p.servicos.includes(s) ? p.servicos.filter(x=>x!==s) : [...p.servicos,s]}))
  }

  return (
    <Drawer open={open} onClose={onClose} title={isNew?"Novo agendamento":"Editar agendamento"} description={isNew?"Preencha os dados do agendamento":`Editando: ${agendamento?.cliente}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Data *</label>
            <Input type="date" value={form.data} onChange={e=>upd("data",e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Hora *</label>
            <Input type="time" value={form.hora} onChange={e=>upd("hora",e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome do cliente *</label>
            <Input value={form.cliente} onChange={e=>upd("cliente",e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
            <Input value={form.telefone} onChange={e=>upd("telefone",e.target.value)} placeholder="(11) 9xxxx-xxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Barbeiro *</label>
            <Select options={BARBEIROS.map(b=>({value:b,label:b}))} value={form.barbeiro} onChange={e=>upd("barbeiro",e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Status</label>
            <Select options={STATUS_OPT} value={form.status} onChange={e=>upd("status",e.target.value)} />
          </div>
        </div>

        {/* Serviços */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Serviços *</label>
          <div className="flex flex-wrap gap-1.5">
            {SERVICOS_OPT.map(s => (
              <button key={s} onClick={()=>toggleServ(s)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${form.servicos.includes(s) ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Duração (min)</label>
            <Input type="number" value={form.duracaoMin} onChange={e=>upd("duracaoMin",Number(e.target.value))} min={15} step={5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Valor (R$)</label>
            <Input type="number" value={form.valor} onChange={e=>upd("valor",Number(e.target.value))} min={0} step={0.5} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Observações</label>
            <textarea value={form.obs} onChange={e=>upd("obs",e.target.value)} rows={2} placeholder="Preferências do cliente..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] resize-none" />
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={()=>onSave({...form,id:agendamento?.id??crypto.randomUUID()})} disabled={!form.cliente||form.servicos.length===0}>
          {isNew?"Agendar":"Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

function CalendarioSemanal({ agendamentos }: { agendamentos: Agendamento[] }) {
  const hoje = new Date()
  const diasArr = Array.from({length:7},(_,i)=>{
    const d = new Date(hoje); d.setDate(hoje.getDate()-hoje.getDay()+i)
    return { data:d.toISOString().slice(0,10), dia:DIAS_SEMANA[i], num:d.getDate(), isHoje:d.toDateString()===hoje.toDateString() }
  })

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Cabeçalho dos dias */}
      <div className="grid grid-cols-8 border-b border-[var(--border)]">
        <div className="py-3 px-2 text-xs text-[var(--muted-foreground)]" />
        {diasArr.map(d=>(
          <div key={d.data} className={`py-3 text-center border-l border-[var(--border)] ${d.isHoje?"bg-[var(--primary)]/5":""}`}>
            <p className="text-xs text-[var(--muted-foreground)]">{d.dia}</p>
            <p className={`text-sm font-bold mt-0.5 ${d.isHoje?"text-[var(--primary)]":""}`}>{d.num}</p>
          </div>
        ))}
      </div>

      {/* Grade de horas */}
      <div className="overflow-y-auto max-h-[400px]">
        {HORAS_GRID.map(hora=>(
          <div key={hora} className="grid grid-cols-8 border-b border-[var(--border)] min-h-[52px]">
            <div className="px-2 py-2 text-xs text-[var(--muted-foreground)] text-right shrink-0">{hora}</div>
            {diasArr.map(d=>{
              const slots = agendamentos.filter(a=>a.data===d.data&&a.hora===hora)
              return (
                <div key={d.data} className={`border-l border-[var(--border)] p-1 ${d.isHoje?"bg-[var(--primary)]/3":""}`}>
                  {slots.map(a=>{
                    const st = statusCfg[a.status]
                    return (
                      <div key={a.id} className={`rounded-md px-1.5 py-1 text-[10px] font-medium mb-0.5 truncate border-l-2 ${
                        a.status==="concluido"?"bg-emerald-500/10 border-emerald-500 text-emerald-700":
                        a.status==="em_andamento"?"bg-blue-500/10 border-blue-500 text-blue-700":
                        a.status==="confirmado"?"bg-amber-500/10 border-amber-500 text-amber-700":
                        "bg-[var(--muted)] border-[var(--muted-foreground)]/30 text-[var(--muted-foreground)]"
                      }`}>
                        {a.cliente.split(" ")[0]}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Agendamento | null>(null)
  const { toast } = useToast()

  const filtrados = agendamentos.filter(a=>{
    const matchBusca = a.cliente.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus==="todos"||a.status===filtroStatus
    return matchBusca && matchStatus
  })

  function openNew()  { setSelected(null); setDrawerOpen(true) }
  function openEdit(a:Agendamento) { setSelected(a); setDrawerOpen(true) }

  function handleSave(a:Agendamento) {
    setAgendamentos(prev=>{
      const exists=prev.find(x=>x.id===a.id)
      return exists?prev.map(x=>x.id===a.id?a:x):[...prev,a]
    })
    toast({ type:"success", title:selected?"Agendamento atualizado!":"Agendamento criado!", description:`${a.cliente} — ${a.hora}` })
    setDrawerOpen(false)
  }

  const faturado = agendamentos.filter(a=>a.status==="concluido").reduce((s,a)=>s+a.valor,0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Agendamentos" subtitle="Gestão da agenda" action={{ label:"Novo agendamento", onClick:openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 animate-fade-in">

        {/* Resumo */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label:"Total hoje",    v:agendamentos.length },
            { label:"Concluídos",   v:agendamentos.filter(a=>a.status==="concluido").length,    c:"text-emerald-600" },
            { label:"Pendentes",    v:agendamentos.filter(a=>a.status==="agendado").length,     c:"text-amber-500" },
            { label:"Faturado",     v:formatCurrency(faturado),                                 c:"text-[var(--primary)]" },
          ].map(s=>(
            <div key={s.label} className="text-center">
              <p className={`text-xl font-bold ${s.c??""}`}>{s.v}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="lista">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="calendario">Calendário</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <Input leftIcon={<CalendarBlank weight="duotone" size={13} />} placeholder="Buscar cliente..." value={busca} onChange={e=>setBusca(e.target.value)} className="w-44 h-8 text-xs" />
              <div className="flex gap-1">
                {[["todos","Todos"],["agendado","Agendados"],["confirmado","Confirmados"],["em_andamento","Atendendo"],["concluido","Concluídos"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setFiltroStatus(v)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${filtroStatus===v?"bg-[var(--primary)] text-white border-[var(--primary)]":"border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
                  >{l}</button>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="lista">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {filtrados.map((a,i)=>{
                  const st = statusCfg[a.status]
                  return (
                    <motion.div key={a.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--muted)]/30 transition-colors group"
                    >
                      <div className="w-12 text-center shrink-0">
                        <p className="text-sm font-bold tabular-nums">{a.hora}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)] flex items-center justify-center gap-0.5">
                          <Clock weight="duotone" size={9} />{a.duracaoMin}m
                        </p>
                      </div>
                      <div className={`h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
                      <Avatar name={a.cliente} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{a.cliente}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                          {a.servicos.join(" · ")} · {a.barbeiro}
                        </p>
                        {a.obs && <p className="text-[10px] text-amber-500 italic">"{a.obs}"</p>}
                      </div>
                      <span className="text-sm font-bold text-[var(--primary)] shrink-0 hidden sm:block">{formatCurrency(a.valor)}</span>
                      <Badge variant={st.variant} className="shrink-0 hidden sm:flex">{st.label}</Badge>
                      <Button size="sm" variant="ghost" onClick={()=>openEdit(a)} className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PencilSimple weight="bold" size={13} />
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarioSemanal agendamentos={agendamentos} />
          </TabsContent>
        </Tabs>
      </div>

      <AgendamentoDrawer agendamento={selected} open={drawerOpen} onClose={()=>setDrawerOpen(false)} onSave={handleSave} />
    </div>
  )
}
