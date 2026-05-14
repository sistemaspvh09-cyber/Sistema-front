"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User, Camera, LockKey, Bell, ShieldCheck,
  CheckCircle, Pencil, Phone, EnvelopeSimple,
  IdentificationCard, Star, ChartBar
} from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"

const statsDoMes = [
  { label: "Atendimentos",  value: "28",                   icon: User,     color: "from-blue-500 to-blue-600",     shadow: "shadow-blue-500/30" },
  { label: "Receita gerada",value: formatCurrency(2240),   icon: ChartBar, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/30" },
  { label: "Avaliação",     value: "4.9 ★",               icon: Star,     color: "from-amber-400 to-amber-500",   shadow: "shadow-amber-500/30" },
]

export default function PerfilPage() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()
  const [nome, setNome] = useState(user?.nome ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [telefone, setTelefone] = useState("(11) 98765-4321")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    updateUser({ nome, email })
    setSaving(false)
    toast({ type: "success", title: "Perfil atualizado!", description: "Suas informações foram salvas." })
  }

  async function handleSenha(e: React.FormEvent) {
    e.preventDefault()
    await new Promise((r) => setTimeout(r, 600))
    toast({ type: "success", title: "Senha alterada com sucesso!" })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Meu Perfil" subtitle="Gerencie suas informações pessoais" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">

        {/* Hero do perfil */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-orange-500/5 p-6"
        >
          {/* Glow decorativo */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/8 blur-[60px]" />

          <div className="relative flex flex-wrap items-center gap-6">
            {/* Avatar com botão de câmera */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-[var(--primary)]/20">
                <Avatar name={user?.nome ?? "Usuário"} size="xl" className="rounded-2xl h-full w-full" />
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform">
                <Camera weight="duotone" size={14} />
              </button>
            </div>

            {/* Dados */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold truncate">{user?.nome ?? "Usuário"}</h2>
                <Badge variant="default" className="text-[10px] shrink-0">{user?.role ?? "admin"}</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{user?.email ?? ""}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-xs">
                  <ShieldCheck weight="duotone" size={12} className="text-emerald-500" />
                  Conta verificada
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-xs">
                  <IdentificationCard weight="duotone" size={12} className="text-[var(--primary)]" />
                  Membro desde 2024
                </span>
              </div>
            </div>

            {/* Stats do mês */}
            <div className="flex gap-3">
              {statsDoMes.map((s) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center rounded-2xl bg-gradient-to-br ${s.color} p-3.5 shadow-lg ${s.shadow} text-white min-w-[80px]`}
                >
                  <s.icon weight="duotone" size={20} className="mb-1.5 opacity-90" />
                  <p className="text-sm font-bold leading-none">{s.value}</p>
                  <p className="mt-1 text-[9px] font-medium uppercase tracking-wide opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="info">
          <TabsList className="mb-5">
            <TabsTrigger value="info"><User weight="duotone" size={14} />Informações</TabsTrigger>
            <TabsTrigger value="senha"><LockKey weight="duotone" size={14} />Segurança</TabsTrigger>
            <TabsTrigger value="notif"><Bell weight="duotone" size={14} />Notificações</TabsTrigger>
          </TabsList>

          {/* Informações */}
          <TabsContent value="info">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">Dados pessoais</p>
                <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                  <Pencil size={12} weight="bold" />Editar
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome completo</label>
                  <Input
                    leftIcon={<User weight="duotone" size={14} />}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">E-mail</label>
                  <Input
                    leftIcon={<EnvelopeSimple weight="duotone" size={14} />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
                  <Input
                    leftIcon={<Phone weight="duotone" size={14} />}
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Cargo</label>
                  <Input
                    leftIcon={<IdentificationCard weight="duotone" size={14} />}
                    value={user?.role ?? ""}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? "Salvando..." : <><CheckCircle weight="duotone" size={15} />Salvar alterações</>}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="senha">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="mb-5 text-sm font-semibold">Alterar senha</p>
              <form onSubmit={handleSenha} className="space-y-4 max-w-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Senha atual</label>
                  <Input leftIcon={<LockKey weight="duotone" size={14} />} type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Nova senha</label>
                  <Input leftIcon={<LockKey weight="duotone" size={14} />} type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Confirmar nova senha</label>
                  <Input leftIcon={<LockKey weight="duotone" size={14} />} type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="gap-2 mt-2">
                  <ShieldCheck weight="duotone" size={15} />Atualizar senha
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notif">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
              <p className="text-sm font-semibold mb-2">Preferências de notificação</p>
              {[
                { label: "Novo agendamento",       desc: "Quando um cliente agendar",          on: true  },
                { label: "Cancelamento",           desc: "Quando um agendamento for cancelado", on: true  },
                { label: "Lembrete de atendimento", desc: "30 min antes do próximo cliente",    on: true  },
                { label: "Meta atingida",          desc: "Quando atingir a meta mensal",        on: false },
                { label: "Resumo diário",          desc: "Relatório ao final do dia",           on: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
