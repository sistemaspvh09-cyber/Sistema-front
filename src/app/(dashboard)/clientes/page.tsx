"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MagnifyingGlass, Phone, EnvelopeSimple, CalendarBlank, Plus, PencilSimple, Eye, Warning } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { TierBadge } from "@/components/ui/tier-badge"
import { calcTier, calcPontos, pontosParaProximoTier, diasSemVisita, statusRisco } from "@/lib/vip"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Cliente {
  id: string; nome: string; telefone: string; email: string
  totalVisitas: number; ultimaVisita: string; gasto: number
  nascimento: string; observacoes: string
}

const clientesIniciais: Cliente[] = [
  { id: "1", nome: "Carlos Silva",   telefone: "(11) 98765-4321", email: "carlos@email.com",  totalVisitas: 32, ultimaVisita: "2026-05-13", gasto: 2240, nascimento: "1990-03-15", observacoes: "Prefere corte degradê curto" },
  { id: "2", nome: "Pedro Santos",   telefone: "(11) 91234-5678", email: "",                   totalVisitas: 18, ultimaVisita: "2026-05-13", gasto: 810,  nascimento: "1985-07-22", observacoes: "" },
  { id: "3", nome: "Lucas Oliveira", telefone: "(11) 99876-5432", email: "lucas@email.com",   totalVisitas: 41, ultimaVisita: "2026-05-10", gasto: 2870, nascimento: "1995-11-08", observacoes: "Alérgico ao produto X" },
  { id: "4", nome: "Rafael Costa",   telefone: "(11) 94567-8901", email: "",                   totalVisitas: 7,  ultimaVisita: "2026-04-28", gasto: 490,  nascimento: "2000-01-30", observacoes: "" },
  { id: "5", nome: "Bruno Lima",     telefone: "(11) 92345-6789", email: "bruno@email.com",   totalVisitas: 15, ultimaVisita: "2026-05-08", gasto: 1125, nascimento: "1988-06-14", observacoes: "" },
  { id: "6", nome: "Diego Martins",  telefone: "(11) 93456-7890", email: "",                   totalVisitas: 5,  ultimaVisita: "2026-05-12", gasto: 350,  nascimento: "2002-09-01", observacoes: "Novo cliente" },
  { id: "7", nome: "Thiago Souza",   telefone: "(11) 95678-9012", email: "thiago@email.com",  totalVisitas: 51, ultimaVisita: "2026-05-06", gasto: 3570, nascimento: "1982-12-25", observacoes: "Cliente fiel desde 2020" },
]

const riscoConfig = {
  ativo:    { label: "Ativo",    color: "text-emerald-600", dot: "bg-emerald-500" },
  atencao:  { label: "Atenção",  color: "text-amber-500",  dot: "bg-amber-500"   },
  risco:    { label: "Em risco", color: "text-orange-500", dot: "bg-orange-500"  },
  perdido:  { label: "Perdido",  color: "text-red-500",    dot: "bg-red-500"     },
}

function ClienteDrawer({
  cliente, open, onClose, onSave
}: { cliente: Cliente | null; open: boolean; onClose: () => void; onSave: (c: Cliente) => void }) {
  const isNew = !cliente?.id
  const [form, setForm] = useState<Omit<Cliente, "id">>({
    nome: cliente?.nome ?? "", telefone: cliente?.telefone ?? "",
    email: cliente?.email ?? "", totalVisitas: cliente?.totalVisitas ?? 0,
    ultimaVisita: cliente?.ultimaVisita ?? new Date().toISOString().slice(0,10),
    gasto: cliente?.gasto ?? 0, nascimento: cliente?.nascimento ?? "",
    observacoes: cliente?.observacoes ?? "",
  })

  // Resetar quando cliente muda
  useState(() => { if (cliente) setForm({ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email, totalVisitas: cliente.totalVisitas, ultimaVisita: cliente.ultimaVisita, gasto: cliente.gasto, nascimento: cliente.nascimento, observacoes: cliente.observacoes }) })

  function upd(k: keyof typeof form, v: string | number) { setForm(p => ({ ...p, [k]: v })) }

  const tier = calcTier(form.totalVisitas, form.gasto)
  const prox = pontosParaProximoTier(form.totalVisitas, form.gasto)

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Novo cliente" : "Editar cliente"} description={isNew ? "Preencha os dados do novo cliente" : `Editando: ${cliente?.nome}`} size="md">
      <div className="space-y-4 pb-4">

        {/* Tier preview */}
        {!isNew && (
          <div className={`rounded-2xl border ${tier.corBorda} bg-gradient-to-r ${tier.corGradient} p-4 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <TierBadge tier={tier} size="sm" />
              <span className="text-sm font-bold">{calcPontos(form.gasto, tier)} pts</span>
            </div>
            {prox.tier && (
              <>
                <p className="text-xs opacity-80 mb-1.5">Faltam {prox.faltamVisitas} visitas e {formatCurrency(prox.faltamGasto)} para {prox.tier.label}</p>
                <Progress value={(prox.progressoVisitas + prox.progressoGasto) / 2} barClassName="bg-white/60" className="[&>div]:bg-[var(--muted)]" />
              </>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome completo *</label>
            <Input value={form.nome} onChange={e => upd("nome", e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone *</label>
            <Input value={form.telefone} onChange={e => upd("telefone", e.target.value)} placeholder="(11) 9xxxx-xxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Nascimento</label>
            <Input type="date" value={form.nascimento} onChange={e => upd("nascimento", e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">E-mail</label>
            <Input value={form.email} onChange={e => upd("email", e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Total visitas</label>
            <Input type="number" value={form.totalVisitas} onChange={e => upd("totalVisitas", Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Total gasto (R$)</label>
            <Input type="number" value={form.gasto} onChange={e => upd("gasto", Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => upd("observacoes", e.target.value)}
              rows={3}
              placeholder="Preferências, alergias, etc..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
            />
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ ...form, id: cliente?.id ?? crypto.randomUUID() })}>
          {isNew ? "Cadastrar" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState(clientesIniciais)
  const [busca, setBusca] = useState("")
  const [filtroTier, setFiltroTier] = useState("todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Cliente | null>(null)
  const { toast } = useToast()

  const filtrados = clientes.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca)
    const tier = calcTier(c.totalVisitas, c.gasto).tier
    const matchTier = filtroTier === "todos" || tier === filtroTier
    return matchBusca && matchTier
  })

  function openNew() { setSelected(null); setDrawerOpen(true) }
  function openEdit(c: Cliente) { setSelected(c); setDrawerOpen(true) }

  function handleSave(c: Cliente) {
    setClientes(prev => {
      const exists = prev.find(x => x.id === c.id)
      const next = exists ? prev.map(x => x.id === c.id ? c : x) : [...prev, c]
      return next
    })
    toast({ type: "success", title: selected ? "Cliente atualizado!" : "Cliente cadastrado!", description: c.nome })
    setDrawerOpen(false)
  }

  const totalGasto = clientes.reduce((a, c) => a + c.gasto, 0)
  const platinum = clientes.filter(c => calcTier(c.totalVisitas, c.gasto).tier === "platinum").length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Clientes" subtitle={`${clientes.length} clientes`} action={{ label: "Novo cliente", onClick: openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 animate-fade-in">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total",     value: clientes.length,           color: ""                  },
            { label: "Platinum",  value: platinum,                  color: "text-violet-500"   },
            { label: "Ativos",    value: clientes.filter(c => diasSemVisita(c.ultimaVisita) <= 30).length, color: "text-emerald-600" },
            { label: "Faturamento", value: formatCurrency(totalGasto), color: "text-[var(--primary)]" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <Input leftIcon={<MagnifyingGlass weight="duotone" size={14} />} placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} className="w-52" />
          <div className="flex flex-wrap gap-1.5">
            {[["todos","Todos"],["bronze","Bronze"],["silver","Prata"],["gold","Ouro"],["platinum","Platinum"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiltroTier(v)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${filtroTier===v ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((c, i) => {
            const tier = calcTier(c.totalVisitas, c.gasto)
            const dias = diasSemVisita(c.ultimaVisita)
            const risco = statusRisco(dias)
            const riscoC = riscoConfig[risco]
            const pontos = calcPontos(c.gasto, tier)

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`group rounded-2xl border bg-[var(--card)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${tier.corBorda}`}
                onClick={() => openEdit(c)}
              >
                {/* Faixa de tier */}
                <div className={`h-1 w-full bg-gradient-to-r ${tier.corGradient}`} />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Avatar name={c.nome} size="md" />
                    <div className="flex flex-col items-end gap-1">
                      <TierBadge tier={tier} size="xs" />
                      <div className={`flex items-center gap-1 text-[10px] font-medium ${riscoC.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${riscoC.dot}`} />
                        {riscoC.label}
                      </div>
                    </div>
                  </div>

                  <p className="font-semibold text-sm truncate">{c.nome}</p>

                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <Phone weight="duotone" size={11} />{c.telefone}
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] truncate">
                        <EnvelopeSimple weight="duotone" size={11} />{c.email}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <CalendarBlank weight="duotone" size={11} />
                      {dias === 0 ? "Hoje" : dias === 1 ? "Ontem" : `${dias}d atrás`}
                    </div>
                    {c.observacoes && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 italic truncate">
                        <Warning weight="duotone" size={11} className="shrink-0" />{c.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-sm font-bold">{c.totalVisitas}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">visitas</p>
                    </div>
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-xs font-bold text-[var(--primary)]">{formatCurrency(c.gasto)}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">gasto</p>
                    </div>
                    <div className="rounded-lg bg-[var(--muted)] p-2 text-center">
                      <p className="text-sm font-bold" style={{ color: tier.corTexto.replace("text-","") }}>{pontos}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)]">pontos</p>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="mt-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={e => { e.stopPropagation(); openEdit(c) }}>
                      <PencilSimple size={11} weight="bold" />Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <Eye size={13} weight="duotone" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Card novo */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={openNew}
            className="rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all min-h-[200px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current">
              <Plus weight="bold" size={18} />
            </div>
            <span className="text-sm font-medium">Novo cliente</span>
          </motion.button>
        </div>
      </div>

      <ClienteDrawer
        cliente={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
