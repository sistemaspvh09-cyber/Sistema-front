"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Buildings, MapPin, Phone, Users, Scissors,
  CurrencyDollar, Plus, PencilSimple, CheckCircle,
  XCircle, ChartBar, TrendUp, TrendDown, Trophy, ArrowRight
} from "@phosphor-icons/react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts"
import { Header } from "@/components/layout/header"
import { GradientCard } from "@/components/ui/gradient-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Unidade {
  id: string; nome: string; slug: string; endereco: string; cidade: string
  telefone: string; gerente: string; barbeiros: number
  receitaMes: number; receitaAnterior: number; atendimentos: number
  ticketMedio: number; ativa: boolean; cor: string
}

const unidadesIniciais: Unidade[] = [
  { id:"u1", nome:"Centro",         slug:"centro",         endereco:"Rua das Flores, 123",    cidade:"São Paulo, SP", telefone:"(11)3456-7890", gerente:"Admin",       barbeiros:3, receitaMes:8420,  receitaAnterior:7100,  atendimentos:142, ticketMedio:59.3,  ativa:true,  cor:"from-orange-500 to-rose-600"    },
  { id:"u2", nome:"Pinheiros",      slug:"pinheiros",      endereco:"Av. Rebouças, 456",       cidade:"São Paulo, SP", telefone:"(11)3456-7891", gerente:"Marcos Lima", barbeiros:2, receitaMes:6150,  receitaAnterior:5800,  atendimentos:98,  ticketMedio:62.8,  ativa:true,  cor:"from-blue-500 to-indigo-600"     },
  { id:"u3", nome:"Vila Madalena",  slug:"vila-madalena",  endereco:"R. Harmonia, 789",        cidade:"São Paulo, SP", telefone:"(11)3456-7892", gerente:"Ana Costa",   barbeiros:4, receitaMes:11200, receitaAnterior:9800,  atendimentos:189, ticketMedio:59.3,  ativa:true,  cor:"from-violet-500 to-purple-700"   },
  { id:"u4", nome:"Moema",          slug:"moema",          endereco:"Av. Ibirapuera, 1010",    cidade:"São Paulo, SP", telefone:"(11)3456-7893", gerente:"—",           barbeiros:0, receitaMes:0,     receitaAnterior:0,     atendimentos:0,   ticketMedio:0,     ativa:false, cor:"from-gray-500 to-gray-700"       },
]

const meses = ["Jan","Fev","Mar","Abr","Mai"]
const historicoReceita = [
  { mes:"Jan", Centro:6200, Pinheiros:4800, "Vila Madalena":8900 },
  { mes:"Fev", Centro:7100, Pinheiros:5200, "Vila Madalena":9400 },
  { mes:"Mar", Centro:6800, Pinheiros:5000, "Vila Madalena":8600 },
  { mes:"Abr", Centro:7100, Pinheiros:5800, "Vila Madalena":9800 },
  { mes:"Mai", Centro:8420, Pinheiros:6150, "Vila Madalena":11200 },
]

const radarData = [
  { categoria:"Receita",      Centro:84, Pinheiros:62, "V.Madalena":100 },
  { categoria:"Atendimentos", Centro:75, Pinheiros:52, "V.Madalena":100 },
  { categoria:"Barbeiros",    Centro:75, Pinheiros:50, "V.Madalena":100 },
  { categoria:"Ticket Médio", Centro:95, Pinheiros:100,"V.Madalena":94  },
  { categoria:"Crescimento",  Centro:87, Pinheiros:75, "V.Madalena":100 },
]

const CORES_UNIDADE = ["#f97316","#3b82f6","#8b5cf6","#22c55e"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl text-xs">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            {p.name}
          </span>
          <span className="font-bold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function UnidadeDrawer({ unidade, open, onClose, onSave }: {
  unidade: Unidade | null; open: boolean; onClose: () => void; onSave: (u: Unidade) => void
}) {
  const isNew = !unidade?.id
  const [form, setForm] = useState({
    nome:     unidade?.nome     ?? "",
    slug:     unidade?.slug     ?? "",
    endereco: unidade?.endereco ?? "",
    cidade:   unidade?.cidade   ?? "",
    telefone: unidade?.telefone ?? "",
    gerente:  unidade?.gerente  ?? "",
    ativa:    unidade?.ativa    ?? true,
    cor:      unidade?.cor      ?? "from-orange-500 to-rose-600",
    barbeiros: unidade?.barbeiros ?? 0,
    receitaMes: unidade?.receitaMes ?? 0,
    receitaAnterior: unidade?.receitaAnterior ?? 0,
    atendimentos: unidade?.atendimentos ?? 0,
    ticketMedio: unidade?.ticketMedio ?? 0,
  })
  function upd<K extends keyof typeof form>(k:K,v:typeof form[K]) { setForm(p=>({...p,[k]:v})) }

  const slugify = (s:string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")
  const cores = [
    "from-orange-500 to-rose-600","from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-700","from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600","from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600","from-teal-500 to-emerald-600",
  ]

  return (
    <Drawer open={open} onClose={onClose} title={isNew?"Nova unidade":"Editar unidade"} description={isNew?"Cadastrar nova filial/franquia":`Editando: ${unidade?.nome}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome da unidade *</label>
            <Input value={form.nome} onChange={e=>{ upd("nome",e.target.value); if(isNew) upd("slug",slugify(e.target.value)) }} placeholder="Ex: Unidade Centro" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Slug (URL pública)</label>
            <Input value={form.slug} onChange={e=>upd("slug",slugify(e.target.value))} placeholder="centro" />
            <p className="text-[10px] text-[var(--muted-foreground)]">/agendar/{form.slug||"slug"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
            <Input value={form.telefone} onChange={e=>upd("telefone",e.target.value)} placeholder="(11) 3456-7890" />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Endereço *</label>
            <Input value={form.endereco} onChange={e=>upd("endereco",e.target.value)} placeholder="Rua, número, bairro" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Cidade / UF</label>
            <Input value={form.cidade} onChange={e=>upd("cidade",e.target.value)} placeholder="São Paulo, SP" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Gerente responsável</label>
            <Input value={form.gerente} onChange={e=>upd("gerente",e.target.value)} placeholder="Nome do gerente" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Cor de identidade visual</label>
          <div className="flex flex-wrap gap-2">
            {cores.map(c=>(
              <button key={c} onClick={()=>upd("cor",c)}
                className={`h-8 w-16 rounded-xl bg-gradient-to-r ${c} transition-all ${form.cor===c?"ring-2 ring-offset-2 ring-[var(--foreground)] scale-110":""}`}
              />
            ))}
          </div>
        </div>

        {!isNew && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-3">
            <p className="col-span-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Dados operacionais</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Barbeiros ativos</label>
              <Input type="number" value={form.barbeiros} onChange={e=>upd("barbeiros",Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Atend. este mês</label>
              <Input type="number" value={form.atendimentos} onChange={e=>upd("atendimentos",Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Receita este mês (R$)</label>
              <Input type="number" value={form.receitaMes} onChange={e=>upd("receitaMes",Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Receita mês anterior (R$)</label>
              <Input type="number" value={form.receitaAnterior} onChange={e=>upd("receitaAnterior",Number(e.target.value))} min={0} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Unidade ativa</p>
            <p className="text-xs text-[var(--muted-foreground)]">Visível nos relatórios e links públicos</p>
          </div>
          <Switch checked={form.ativa} onCheckedChange={v=>upd("ativa",v)} />
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={()=>onSave({...form,id:unidade?.id??crypto.randomUUID()})} disabled={!form.nome||!form.endereco}>
          {isNew?"Criar unidade":"Salvar alterações"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState(unidadesIniciais)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Unidade|null>(null)
  const [unidadeDetalhe, setUnidadeDetalhe] = useState<string|null>(null)
  const { toast } = useToast()

  const ativas = unidades.filter(u=>u.ativa)
  const totalReceita = unidades.reduce((a,u)=>a+u.receitaMes,0)
  const totalBarbeiros = unidades.reduce((a,u)=>a+u.barbeiros,0)
  const totalAtend = unidades.reduce((a,u)=>a+u.atendimentos,0)
  const melhor = [...ativas].sort((a,b)=>b.receitaMes-a.receitaMes)[0]

  function openNew()  { setSelected(null); setDrawerOpen(true) }
  function openEdit(u:Unidade) { setSelected(u); setDrawerOpen(true) }

  function handleSave(u:Unidade) {
    setUnidades(prev=>{ const ex=prev.find(x=>x.id===u.id); return ex?prev.map(x=>x.id===u.id?u:x):[...prev,u] })
    toast({ type:"success", title:selected?"Unidade atualizada!":"Unidade criada!", description:u.nome })
    setDrawerOpen(false)
  }

  const detalheUnidade = unidades.find(u=>u.id===unidadeDetalhe)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Multi-unidades" subtitle="Gestão de filiais e franquias" action={{ label:"Nova unidade", onClick:openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 animate-fade-in">

        {/* KPIs da rede */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GradientCard title="Unidades ativas" value={String(ativas.length)} icon={Buildings} gradient="from-blue-500 via-blue-600 to-indigo-700" glowClass="glow-blue" subtitle={`${unidades.length} total`} delay={0} />
          <GradientCard title="Barbeiros na rede" value={String(totalBarbeiros)} icon={Scissors} gradient="from-violet-500 via-purple-600 to-fuchsia-700" glowClass="glow-purple" subtitle="profissionais ativos" delay={0.06} />
          <GradientCard title="Receita da rede" value={formatCurrency(totalReceita)} icon={CurrencyDollar} gradient="from-orange-500 via-orange-600 to-rose-600" glowClass="glow-orange" subtitle={`${totalAtend} atendimentos`} delay={0.12} />
          <GradientCard title="Melhor unidade" value={melhor?.nome ?? "—"} icon={Trophy} gradient="from-amber-400 via-amber-500 to-orange-500" glowClass="glow-orange" subtitle={formatCurrency(melhor?.receitaMes ?? 0)} delay={0.18} />
        </div>

        <Tabs defaultValue="visao-geral">
          <TabsList className="mb-4">
            <TabsTrigger value="visao-geral"><Buildings weight="duotone" size={13}/>Visão Geral</TabsTrigger>
            <TabsTrigger value="comparativo"><ChartBar weight="duotone" size={13}/>Comparativo</TabsTrigger>
            <TabsTrigger value="ranking"><Trophy weight="duotone" size={13}/>Ranking</TabsTrigger>
            {detalheUnidade && <TabsTrigger value="detalhe">📍 {detalheUnidade?.nome}</TabsTrigger>}
          </TabsList>

          {/* Visão Geral — cards */}
          <TabsContent value="visao-geral">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unidades.map((u,i)=>{
                const crescimento = u.receitaAnterior > 0 ? Math.round(((u.receitaMes-u.receitaAnterior)/u.receitaAnterior)*100) : 0
                const isPos = crescimento >= 0
                return (
                  <motion.div key={u.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                    className={`group rounded-2xl border bg-[var(--card)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${!u.ativa?"opacity-55":""}`}
                  >
                    <div className={`h-24 bg-gradient-to-br ${u.cor} relative overflow-hidden`}>
                      <div className="absolute inset-0" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E\")"}} />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                        <div className="glass-icon flex h-10 w-10 items-center justify-center rounded-xl">
                          <Buildings weight="duotone" size={20} className="text-white"/>
                        </div>
                        <div className="text-white">
                          <p className="text-sm font-black">{u.nome}</p>
                          <p className="text-[10px] opacity-80">{u.cidade}</p>
                        </div>
                      </div>
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        {u.ativa
                          ? <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"><CheckCircle weight="fill" size={9}/>Ativa</span>
                          : <span className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/70 backdrop-blur-sm"><XCircle weight="fill" size={9}/>Inativa</span>}
                        <button onClick={()=>openEdit(u)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <PencilSimple weight="bold" size={11}/>
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center rounded-lg bg-[var(--muted)] p-2">
                          <p className="text-sm font-bold">{u.barbeiros}</p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">barbeiros</p>
                        </div>
                        <div className="text-center rounded-lg bg-[var(--muted)] p-2">
                          <p className="text-sm font-bold">{u.atendimentos}</p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">atend.</p>
                        </div>
                        <div className="text-center rounded-lg bg-[var(--muted)] p-2">
                          <p className="text-xs font-bold text-[var(--primary)]">{formatCurrency(u.ticketMedio)}</p>
                          <p className="text-[9px] text-[var(--muted-foreground)]">ticket</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-black text-[var(--primary)]">{formatCurrency(u.receitaMes)}</p>
                          <div className={`flex items-center gap-1 text-[10px] font-medium ${isPos?"text-emerald-600":"text-red-500"}`}>
                            {isPos?<TrendUp weight="bold" size={9}/>:<TrendDown weight="bold" size={9}/>}
                            {Math.abs(crescimento)}% vs mês anterior
                          </div>
                        </div>
                        {u.ativa && (
                          <a href={`/agendar/${u.slug}`} target="_blank"
                            className="flex items-center gap-1 rounded-xl bg-[var(--primary)]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                            Link <ArrowRight weight="bold" size={10}/>
                          </a>
                        )}
                      </div>

                      {u.receitaAnterior > 0 && (
                        <div className="mt-3">
                          <Progress value={u.receitaMes} max={Math.max(...unidades.map(x=>x.receitaMes))} />
                          <p className="mt-1 text-[10px] text-[var(--muted-foreground)] text-right">
                            {Math.round((u.receitaMes / totalReceita) * 100)}% da receita total
                          </p>
                        </div>
                      )}

                      <button onClick={()=>{ setUnidadeDetalhe(u.id) }}
                        className="mt-3 w-full rounded-xl border border-[var(--border)] py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors opacity-0 group-hover:opacity-100">
                        Ver análise detalhada
                      </button>
                    </div>
                  </motion.div>
                )
              })}

              <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={openNew}
                className="rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all min-h-[280px]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current"><Plus weight="bold" size={18}/></div>
                <span className="text-sm font-medium">Nova filial</span>
              </motion.button>
            </div>
          </TabsContent>

          {/* Comparativo — gráficos */}
          <TabsContent value="comparativo">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm font-semibold mb-1">Receita por unidade (últimos 5 meses)</p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">Evolução mensal comparativa</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={historicoReceita} barGap={3} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="mes" tick={{fontSize:11, fill:"var(--muted-foreground)"}} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`} tick={{fontSize:11, fill:"var(--muted-foreground)"}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize:12}} />
                    {ativas.map((u,i)=>(
                      <Bar key={u.nome} dataKey={u.nome} fill={CORES_UNIDADE[i]} radius={[4,4,0,0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm font-semibold mb-1">Radar de desempenho</p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">Score relativo por dimensão (0–100)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="categoria" tick={{fontSize:11, fill:"var(--muted-foreground)"}} />
                    <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                    {ativas.slice(0,3).map((u,i)=>(
                      <Radar key={u.nome} name={u.nome} dataKey={u.nome==="Vila Madalena"?"V.Madalena":u.nome} stroke={CORES_UNIDADE[i]} fill={CORES_UNIDADE[i]} fillOpacity={0.12} />
                    ))}
                    <Legend wrapperStyle={{fontSize:12}} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela comparativa */}
            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
                    {["Unidade","Barbeiros","Atend.","Receita","vs anterior","Ticket médio","% da rede","Link"].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[...unidades].sort((a,b)=>b.receitaMes-a.receitaMes).map(u=>{
                    const cresc = u.receitaAnterior > 0 ? Math.round(((u.receitaMes-u.receitaAnterior)/u.receitaAnterior)*100) : 0
                    const pct = totalReceita > 0 ? Math.round((u.receitaMes/totalReceita)*100) : 0
                    return (
                      <tr key={u.id} className={`hover:bg-[var(--muted)]/20 transition-colors ${!u.ativa?"opacity-50":""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${u.cor}`}/>
                            <span className="font-medium">{u.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{u.barbeiros}</td>
                        <td className="px-4 py-3 text-center">{u.atendimentos}</td>
                        <td className="px-4 py-3 font-bold text-[var(--primary)]">{formatCurrency(u.receitaMes)}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-semibold ${cresc>=0?"text-emerald-600":"text-red-500"}`}>
                            {cresc>=0?<TrendUp weight="bold" size={11}/>:<TrendDown weight="bold" size={11}/>}
                            {Math.abs(cresc)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatCurrency(u.ticketMedio)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="w-16" />
                            <span className="text-xs font-semibold">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {u.ativa && (
                            <a href={`/agendar/${u.slug}`} target="_blank"
                              className="text-xs font-medium text-[var(--primary)] hover:underline">/agendar/{u.slug}</a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <p className="text-sm font-semibold">Ranking de desempenho — maio 2026</p>
              </div>
              {[...ativas].sort((a,b)=>b.receitaMes-a.receitaMes).map((u,i)=>(
                <motion.div key={u.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                  className="flex items-center gap-5 px-5 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20 transition-colors"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                    i===0?"bg-amber-400/20 text-amber-500":
                    i===1?"bg-slate-400/20 text-slate-500":
                    i===2?"bg-orange-400/20 text-orange-600":
                    "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}>
                    {["🥇","🥈","🥉"][i] ?? i+1}
                  </div>

                  <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${u.cor} flex items-center justify-center`}>
                    <Buildings weight="duotone" size={18} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{u.nome}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{u.gerente} · {u.barbeiros} barbeiros</p>
                    <Progress value={u.receitaMes} max={Math.max(...ativas.map(x=>x.receitaMes))} className="mt-1.5" />
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-[var(--primary)]">{formatCurrency(u.receitaMes)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{u.atendimentos} atend.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Detalhe de unidade */}
          {detalheUnidade && (
            <TabsContent value="detalhe">
              {(() => {
                const u = detalheUnidade!
                const cresc = u.receitaAnterior > 0 ? Math.round(((u.receitaMes-u.receitaAnterior)/u.receitaAnterior)*100) : 0
                return (
                  <div className="space-y-5">
                    <div className={`rounded-2xl bg-gradient-to-br ${u.cor} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='white' fill-opacity='0.06'/%3E%3C/svg%3E\")"}} />
                      <div className="relative flex items-start justify-between">
                        <div>
                          <p className="text-2xl font-black">{u.nome}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-sm opacity-80"><MapPin weight="duotone" size={13}/>{u.endereco}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-sm opacity-80"><Phone weight="duotone" size={13}/>{u.telefone}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>openEdit(u)} className="glass-icon flex h-9 w-9 items-center justify-center rounded-xl">
                            <PencilSimple weight="duotone" size={16} className="text-white"/>
                          </button>
                          <a href={`/agendar/${u.slug}`} target="_blank" className="glass-icon flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white">
                            Abrir link <ArrowRight weight="bold" size={12}/>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                      <GradientCard title="Receita" value={formatCurrency(u.receitaMes)} icon={CurrencyDollar} gradient="from-emerald-500 to-teal-600" glowClass="glow-green" change={cresc} delay={0} />
                      <GradientCard title="Atendimentos" value={String(u.atendimentos)} icon={Users} gradient="from-blue-500 to-indigo-600" glowClass="glow-blue" subtitle="este mês" delay={0.05} />
                      <GradientCard title="Barbeiros" value={String(u.barbeiros)} icon={Scissors} gradient="from-violet-500 to-purple-700" glowClass="glow-purple" delay={0.1} />
                      <GradientCard title="Ticket médio" value={formatCurrency(u.ticketMedio)} icon={TrendUp} gradient="from-orange-500 to-rose-600" glowClass="glow-orange" delay={0.15} />
                    </div>
                  </div>
                )
              })()}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <UnidadeDrawer unidade={selected} open={drawerOpen} onClose={()=>setDrawerOpen(false)} onSave={handleSave} />
    </div>
  )
}
