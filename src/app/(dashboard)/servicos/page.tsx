"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Scissors, PencilSimple, Plus, ToggleLeft, ToggleRight } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerFooter } from "@/components/ui/drawer"
import { Select } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import type { CategoriaServico } from "@/lib/types"

const catOptions = [
  { value: "corte", label: "Corte" },
  { value: "barba", label: "Barba" },
  { value: "combo", label: "Combo" },
  { value: "coloracao", label: "Coloração" },
  { value: "tratamento", label: "Tratamento" },
  { value: "outros", label: "Outros" },
]

const catColor: Record<CategoriaServico, string> = {
  corte:      "bg-blue-500/10 text-blue-600 border-blue-200",
  barba:      "bg-orange-500/10 text-orange-600 border-orange-200",
  combo:      "bg-purple-500/10 text-purple-600 border-purple-200",
  coloracao:  "bg-pink-500/10 text-pink-600 border-pink-200",
  tratamento: "bg-teal-500/10 text-teal-600 border-teal-200",
  outros:     "bg-gray-500/10 text-gray-600 border-gray-200",
}

interface Servico {
  id: string; nome: string; categoria: CategoriaServico
  preco: number; duracaoMinutos: number; ativo: boolean; popular: boolean; realizados: number
}

const servicosIniciais: Servico[] = [
  { id:"s1", nome:"Corte Masculino",    categoria:"corte",      preco:45,  duracaoMinutos:30, ativo:true,  popular:true,  realizados:156 },
  { id:"s2", nome:"Barba Completa",     categoria:"barba",      preco:35,  duracaoMinutos:25, ativo:true,  popular:true,  realizados:98  },
  { id:"s3", nome:"Corte + Barba",      categoria:"combo",      preco:70,  duracaoMinutos:50, ativo:true,  popular:true,  realizados:212 },
  { id:"s4", nome:"Corte Degradê",      categoria:"corte",      preco:55,  duracaoMinutos:40, ativo:true,  popular:false, realizados:67  },
  { id:"s5", nome:"Platinado",          categoria:"coloracao",  preco:120, duracaoMinutos:90, ativo:true,  popular:false, realizados:23  },
  { id:"s6", nome:"Hidratação Capilar", categoria:"tratamento", preco:60,  duracaoMinutos:40, ativo:true,  popular:false, realizados:31  },
  { id:"s7", nome:"Sobrancelha",        categoria:"outros",     preco:20,  duracaoMinutos:15, ativo:true,  popular:false, realizados:44  },
  { id:"s8", nome:"Relaxamento",        categoria:"tratamento", preco:80,  duracaoMinutos:60, ativo:false, popular:false, realizados:8   },
]

function ServicoDrawer({ servico, open, onClose, onSave }: {
  servico: Servico | null; open: boolean; onClose: () => void; onSave: (s: Servico) => void
}) {
  const isNew = !servico?.id
  const empty: Omit<Servico,"id"> = { nome:"", categoria:"corte", preco:0, duracaoMinutos:30, ativo:true, popular:false, realizados:0 }
  const [form, setForm] = useState<Omit<Servico,"id">>(servico ? { ...servico } : empty)

  function upd<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(p => ({ ...p, [k]: v })) }

  return (
    <Drawer open={open} onClose={onClose} title={isNew ? "Novo serviço" : "Editar serviço"} description={isNew ? "Preencha os dados do serviço" : `Editando: ${servico?.nome}`}>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome do serviço *</label>
          <Input value={form.nome} onChange={e => upd("nome", e.target.value)} placeholder="Ex: Corte Masculino" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Categoria *</label>
            <Select options={catOptions} value={form.categoria} onChange={e => upd("categoria", e.target.value as CategoriaServico)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Duração (min) *</label>
            <Input type="number" value={form.duracaoMinutos} onChange={e => upd("duracaoMinutos", Number(e.target.value))} min={5} step={5} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Preço (R$) *</label>
            <Input type="number" value={form.preco} onChange={e => upd("preco", Number(e.target.value))} min={0} step={0.50} />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Serviço ativo</p>
              <p className="text-xs text-[var(--muted-foreground)]">Aparece no PDV e agendamentos</p>
            </div>
            <Switch checked={form.ativo} onCheckedChange={v => upd("ativo", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Popular / Destaque</p>
              <p className="text-xs text-[var(--muted-foreground)]">Exibido em primeiro no PDV</p>
            </div>
            <Switch checked={form.popular} onCheckedChange={v => upd("popular", v)} />
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
          <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Preview no PDV</p>
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${catColor[form.categoria]}`}>
            <Scissors weight="duotone" size={14} />
            {form.nome || "Nome do serviço"}
            <span className="ml-1 font-bold text-[var(--primary)]">{formatCurrency(form.preco)}</span>
            <span className="flex items-center gap-0.5 text-xs opacity-70"><Clock size={11} />{form.duracaoMinutos}min</span>
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ ...form, id: servico?.id ?? crypto.randomUUID() })} disabled={!form.nome || form.preco <= 0}>
          {isNew ? "Criar serviço" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default function ServicosPage() {
  const [lista, setLista] = useState(servicosIniciais)
  const [catFiltro, setCatFiltro] = useState("todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Servico | null>(null)
  const { toast } = useToast()

  const filtrados = catFiltro === "todos" ? lista : lista.filter(s => s.categoria === catFiltro)

  function toggle(id: string) { setLista(p => p.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s)) }
  function openEdit(s: Servico) { setSelected(s); setDrawerOpen(true) }
  function openNew()             { setSelected(null); setDrawerOpen(true) }

  function handleSave(s: Servico) {
    setLista(prev => {
      const exists = prev.find(x => x.id === s.id)
      return exists ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]
    })
    toast({ type: "success", title: selected ? "Serviço atualizado!" : "Serviço criado!", description: s.nome })
    setDrawerOpen(false)
  }

  const cats = ["todos", ...Object.keys(catColor)] as const

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Serviços" subtitle={`${lista.filter(s=>s.ativo).length} ativos`} action={{ label: "Novo serviço", onClick: openNew }} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-5">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFiltro(c)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${catFiltro===c ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"}`}
            >
              {c === "todos" ? "Todos" : catOptions.find(o=>o.value===c)?.label}
              <span className={`rounded-full px-1.5 py-px text-[9px] font-bold ${catFiltro===c ? "bg-white/20 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                {c==="todos" ? lista.length : lista.filter(s=>s.categoria===c).length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((s, i) => {
            const cc = catColor[s.categoria]
            return (
              <motion.div key={s.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                className={`group rounded-2xl border bg-[var(--card)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${!s.ativo ? "opacity-55" : ""}`}
                style={{ borderColor: s.ativo ? undefined : "var(--border)" }}
              >
                <div className={`h-1 w-full bg-gradient-to-r ${s.ativo ? catColor[s.categoria].replace("bg-","").replace("/10","").split(" ")[0].replace("text-","bg-") : "bg-[var(--muted)]"}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${cc}`}>
                      <Scissors weight="duotone" size={16} />
                    </div>
                    <div className="flex items-center gap-2">
                      {s.popular && <Badge variant="default" className="text-[9px] py-px px-1.5">Top</Badge>}
                      <Switch checked={s.ativo} onCheckedChange={() => toggle(s.id)} />
                    </div>
                  </div>

                  <p className="font-semibold text-sm mb-1">{s.nome}</p>
                  <Badge variant="secondary" className="text-[10px] mb-3">{catOptions.find(o=>o.value===s.categoria)?.label}</Badge>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-[var(--primary)]">{formatCurrency(s.preco)}</span>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Clock weight="duotone" size={12} />{s.duracaoMinutos}min
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--muted)] px-3 py-2 text-center mb-3">
                    <p className="text-lg font-bold">{s.realizados}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">realizados este mês</p>
                  </div>

                  <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(s)}>
                    <PencilSimple weight="bold" size={11} />Editar serviço
                  </Button>
                </div>
              </motion.div>
            )
          })}

          <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} onClick={openNew}
            className="rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all min-h-[240px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-current">
              <Plus weight="bold" size={18} />
            </div>
            <span className="text-sm font-medium">Novo serviço</span>
          </motion.button>
        </div>
      </div>

      <ServicoDrawer servico={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} />
    </div>
  )
}
