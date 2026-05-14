"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Phone, EnvelopeSimple, Scissors, ChartLineUp, Trophy, PencilSimple, Plus } from "@phosphor-icons/react"
import { GradientCard } from "@/components/ui/gradient-card"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

const ESPECIALIDADES_OPT = ["Corte","Barba","Coloração","Degradê","Hidratação","Tratamento","Sobrancelha","Relaxamento"]

interface Barbeiro {
  id: string; nome: string; email: string; telefone: string
  especialidades: string[]; ativo: boolean; comissao: number
  atendimentos: number; meta: number; receita: number; avaliacao: number; experiencia: string
}

const barbeirosIniciais: Barbeiro[] = [
  { id:"1", nome:"João Mendes",   email:"joao@barberpro.com",   telefone:"(11) 98765-4321", especialidades:["Corte","Barba","Coloração"],   ativo:true,  comissao:40, atendimentos:28, meta:35, receita:2240, avaliacao:4.9, experiencia:"5 anos" },
  { id:"2", nome:"Marcos Silva",  email:"marcos@barberpro.com", telefone:"(11) 91234-5678", especialidades:["Corte","Barba","Hidratação"],   ativo:true,  comissao:35, atendimentos:22, meta:35, receita:1870, avaliacao:4.7, experiencia:"3 anos" },
  { id:"3", nome:"Rafael Torres", email:"rafael@barberpro.com", telefone:"(11) 94567-8901", especialidades:["Corte","Sobrancelha"],          ativo:true,  comissao:30, atendimentos:15, meta:25, receita:1290, avaliacao:4.5, experiencia:"1 ano"  },
  { id:"4", nome:"Diego Costa",   email:"diego@barberpro.com",  telefone:"(11) 92345-6789", especialidades:["Corte","Barba"],               ativo:false, comissao:30, atendimentos:0,  meta:30, receita:0,    avaliacao:4.3, experiencia:"2 anos" },
]

function BarbeiroDrawer({ barbeiro, open, onClose, onSave }: {
  barbeiro: Barbeiro | null; open: boolean; onClose: () => void; onSave: (b: Barbeiro) => void
}) {
  const isNew = !barbeiro?.id
  const empty: Omit<Barbeiro,"id"> = { nome:"", email:"", telefone:"", especialidades:[], ativo:true, comissao:35, atendimentos:0, meta:30, receita:0, avaliacao:5.0, experiencia:"" }
  const [form, setForm] = useState<Omit<Barbeiro,"id">>(barbeiro?{...barbeiro}:empty)

  function upd<K extends keyof typeof form>(k:K, v:typeof form[K]) { setForm(p=>({...p,[k]:v})) }
  function toggleEsp(e:string) { setForm(p=>({...p,especialidades:p.especialidades.includes(e)?p.especialidades.filter(x=>x!==e):[...p.especialidades,e]})) }

  return (
    <Drawer open={open} onClose={onClose} title={isNew?"Novo barbeiro":"Editar barbeiro"} description={isNew?"Cadastrar novo profissional":`Editando: ${barbeiro?.nome}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome completo *</label>
            <Input value={form.nome} onChange={e=>upd("nome",e.target.value)} placeholder="Nome do barbeiro" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">E-mail *</label>
            <Input type="email" value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
            <Input value={form.telefone} onChange={e=>upd("telefone",e.target.value)} placeholder="(11) 9xxxx-xxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Comissão (%)</label>
            <Input type="number" value={form.comissao} onChange={e=>upd("comissao",Number(e.target.value))} min={10} max={60} step={5} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Experiência</label>
            <Input value={form.experiencia} onChange={e=>upd("experiencia",e.target.value)} placeholder="Ex: 3 anos" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Meta mensal (atend.)</label>
            <Input type="number" value={form.meta} onChange={e=>upd("meta",Number(e.target.value))} min={10} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Avaliação (0-5)</label>
            <Input type="number" value={form.avaliacao} onChange={e=>upd("avaliacao",Number(e.target.value))} min={0} max={5} step={0.1} />
          </div>
        </div>

        {/* Especialidades */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Especialidades</label>
          <div className="flex flex-wrap gap-1.5">
            {ESPECIALIDADES_OPT.map(e=>(
              <button key={e} onClick={()=>toggleEsp(e)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${form.especialidades.includes(e)?"bg-[var(--primary)] text-white border-[var(--primary)]":"border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
              >{e}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Barbeiro ativo</p>
            <p className="text-xs text-[var(--muted-foreground)]">Aparece na agenda e PDV</p>
          </div>
          <Switch checked={form.ativo} onCheckedChange={v=>upd("ativo",v)} />
        </div>

        {/* Preview comissão */}
        {form.receita > 0 && (
          <div className="rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] p-3">
            <p className="text-xs font-medium mb-1">Comissão prevista este mês</p>
            <p className="text-lg font-bold text-[var(--primary)]">{formatCurrency(form.receita * form.comissao / 100)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{form.comissao}% sobre {formatCurrency(form.receita)}</p>
          </div>
        )}
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={()=>onSave({...form, id:barbeiro?.id??crypto.randomUUID()})} disabled={!form.nome||!form.email}>
          {isNew?"Cadastrar":"Salvar"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function BarbeirosPage() {
  const [lista, setLista] = useState(barbeirosIniciais)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Barbeiro | null>(null)
  const { toast } = useToast()

  function toggleAtivo(id:string) { setLista(p=>p.map(b=>b.id===id?{...b,ativo:!b.ativo}:b)) }
  function openEdit(b:Barbeiro)   { setSelected(b); setDrawerOpen(true) }
  function openNew()              { setSelected(null); setDrawerOpen(true) }

  function handleSave(b:Barbeiro) {
    setLista(prev=>{
      const exists=prev.find(x=>x.id===b.id)
      return exists?prev.map(x=>x.id===b.id?b:x):[...prev,b]
    })
    toast({ type:"success", title:selected?"Barbeiro atualizado!":"Barbeiro cadastrado!", description:b.nome })
    setDrawerOpen(false)
  }

  const ativos = lista.filter(b=>b.ativo)
  const totalReceita = lista.reduce((a,b)=>a+b.receita,0)
  const totalAtend = lista.reduce((a,b)=>a+b.atendimentos,0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Barbeiros" subtitle={`${lista.length} profissionais`} action={{ label:"Novo barbeiro", onClick:openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <GradientCard title="Barbeiros ativos" value={String(ativos.length)} icon={Scissors} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle={`de ${lista.length} total`} delay={0} />
          <GradientCard title="Atendimentos" value={String(totalAtend)} icon={ChartLineUp} gradient="from-emerald-500 via-teal-500 to-cyan-600" glowClass="glow-green" subtitle="este mês" delay={0.06} />
          <GradientCard title="Receita total" value={formatCurrency(totalReceita)} icon={Trophy} gradient="from-orange-500 via-orange-600 to-rose-600" glowClass="glow-orange" subtitle="mês atual" delay={0.12} />
        </div>

        <Tabs defaultValue="cards">
          <div className="flex items-center justify-between mb-4">
            <TabsList><TabsTrigger value="cards">Cards</TabsTrigger><TabsTrigger value="tabela">Tabela</TabsTrigger></TabsList>
          </div>

          <TabsContent value="cards">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lista.map((b,i)=>(
                <motion.div key={b.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  className={`group rounded-2xl border bg-[var(--card)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${b.ativo?"border-[var(--border)]":"border-[var(--border)] opacity-60"}`}
                >
                  <div className="h-1 w-full" style={{background: b.ativo?"var(--primary)":"var(--muted-foreground)"}} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.nome} size="lg" />
                        <div>
                          <p className="font-semibold text-sm">{b.nome}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{b.experiencia} de exp.</p>
                        </div>
                      </div>
                      <Switch checked={b.ativo} onCheckedChange={()=>toggleAtivo(b.id)} />
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_,i)=>(
                        <Star key={i} weight={i<Math.floor(b.avaliacao)?"fill":"regular"} size={13} className={i<Math.floor(b.avaliacao)?"text-amber-400":"text-[var(--border)]"} />
                      ))}
                      <span className="ml-1 text-xs font-semibold">{b.avaliacao}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {b.especialidades.map(e=><Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>)}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--muted-foreground)]">Meta mensal</span>
                        <span className="font-semibold">{b.atendimentos}/{b.meta}</span>
                      </div>
                      <Progress value={b.atendimentos} max={b.meta} barClassName={b.atendimentos>=b.meta?"bg-emerald-500":undefined} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[var(--muted)] px-3 py-2.5 mb-3">
                      <div><p className="text-xs text-[var(--muted-foreground)]">Receita</p><p className="text-sm font-bold text-[var(--primary)]">{formatCurrency(b.receita)}</p></div>
                      <div className="text-right"><p className="text-xs text-[var(--muted-foreground)]">Comissão</p><p className="text-sm font-bold">{b.comissao}%</p></div>
                    </div>

                    <div className="space-y-1 mb-3">
                      <a href={`tel:${b.telefone}`} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><Phone weight="duotone" size={11}/>{b.telefone}</a>
                      <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] truncate"><EnvelopeSimple weight="duotone" size={11}/>{b.email}</a>
                    </div>

                    <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={()=>openEdit(b)}>
                      <PencilSimple weight="bold" size={11} />Editar barbeiro
                    </Button>
                  </div>
                </motion.div>
              ))}

              <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={openNew}
                className="rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all min-h-[280px]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current"><Plus weight="bold" size={18}/></div>
                <span className="text-sm font-medium">Novo barbeiro</span>
              </motion.button>
            </div>
          </TabsContent>

          <TabsContent value="tabela">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    {["Barbeiro","Especialidades","Atend.","Receita","Comissão","Avaliação","Status",""].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {lista.map(b=>(
                    <tr key={b.id} className={`hover:bg-[var(--muted)]/30 transition-colors ${!b.ativo?"opacity-55":""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3"><Avatar name={b.nome} size="sm"/>
                          <div><p className="font-medium">{b.nome}</p><p className="text-xs text-[var(--muted-foreground)]">{b.experiencia}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {b.especialidades.slice(0,2).map(e=><Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>)}
                          {b.especialidades.length>2&&<Badge variant="secondary" className="text-[10px]">+{b.especialidades.length-2}</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{b.atendimentos}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--primary)]">{formatCurrency(b.receita)}</td>
                      <td className="px-4 py-3">{b.comissao}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1"><Star weight="fill" size={13} className="text-amber-400"/><span className="font-medium">{b.avaliacao}</span></div>
                      </td>
                      <td className="px-4 py-3"><Switch checked={b.ativo} onCheckedChange={()=>toggleAtivo(b.id)}/></td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={()=>openEdit(b)} className="h-7 w-7 p-0"><PencilSimple weight="bold" size={13}/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BarbeiroDrawer barbeiro={selected} open={drawerOpen} onClose={()=>setDrawerOpen(false)} onSave={handleSave} />
    </div>
  )
}
