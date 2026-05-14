"use client"

import { useState } from "react"
import { Store, Clock, Bell, CreditCard, Shield, Check } from "lucide-react"
import { WhatsappLogo, GoogleChromeLogo, CalendarCheck, Robot } from "@phosphor-icons/react"
import { Header } from "@/components/layout/header"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const horariosIniciais = [
  { dia: "Seg", aberto: true,  abertura: "08:00", fechamento: "20:00" },
  { dia: "Ter", aberto: true,  abertura: "08:00", fechamento: "20:00" },
  { dia: "Qua", aberto: true,  abertura: "08:00", fechamento: "20:00" },
  { dia: "Qui", aberto: true,  abertura: "08:00", fechamento: "20:00" },
  { dia: "Sex", aberto: true,  abertura: "08:00", fechamento: "21:00" },
  { dia: "Sáb", aberto: true,  abertura: "08:00", fechamento: "18:00" },
  { dia: "Dom", aberto: false, abertura: "09:00", fechamento: "14:00" },
]

function Section({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-[var(--muted-foreground)]">{description}</p>}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const [horarios, setHorarios] = useState(horariosIniciais)
  const [saved, setSaved] = useState(false)

  const toggleDia = (i: number) => {
    setHorarios((h) => h.map((d, idx) => idx === i ? { ...d, aberto: !d.aberto } : d))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Configurações" subtitle="Gerencie as configurações da sua barbearia" />

      <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
        <Tabs defaultValue="geral">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="geral"><Store className="h-3.5 w-3.5" />Geral</TabsTrigger>
            <TabsTrigger value="horarios"><Clock className="h-3.5 w-3.5" />Horários</TabsTrigger>
            <TabsTrigger value="notificacoes"><Bell className="h-3.5 w-3.5" />Notificações</TabsTrigger>
            <TabsTrigger value="pagamentos"><CreditCard className="h-3.5 w-3.5" />Pagamentos</TabsTrigger>
            <TabsTrigger value="whatsapp"><WhatsappLogo weight="duotone" size={14}/>WhatsApp</TabsTrigger>
            <TabsTrigger value="google"><CalendarCheck weight="duotone" size={14}/>Google Agenda</TabsTrigger>
          </TabsList>

          {/* Geral */}
          <TabsContent value="geral" className="space-y-5">
            <Section title="Dados da barbearia" description="Informações exibidas aos clientes" icon={Store}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Nome da barbearia</label>
                  <Input defaultValue="BarberPro" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Telefone</label>
                  <Input defaultValue="(11) 3456-7890" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">E-mail</label>
                  <Input defaultValue="contato@barberpro.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Instagram</label>
                  <Input defaultValue="@barberpro" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Endereço</label>
                  <Input defaultValue="Rua das Flores, 123 — São Paulo, SP" />
                </div>
              </div>
            </Section>

            <Section title="Aparência" description="Personalização visual do sistema" icon={Shield}>
              <Row label="Tema escuro" description="Ativar modo dark por padrão">
                <Switch defaultChecked={false} />
              </Row>
              <Row label="Cor de destaque" description="Cor principal do sistema">
                <div className="flex items-center gap-2">
                  {["#f97316", "#3b82f6", "#a855f7", "#22c55e", "#ec4899"].map((c) => (
                    <button
                      key={c}
                      className="h-6 w-6 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                      style={{ background: c, borderColor: c === "#f97316" ? "var(--foreground)" : "transparent" }}
                    />
                  ))}
                </div>
              </Row>
            </Section>
          </TabsContent>

          {/* Horários */}
          <TabsContent value="horarios">
            <Section title="Horário de funcionamento" description="Configure os dias e horários de atendimento" icon={Clock}>
              <div className="space-y-2">
                {horarios.map((h, i) => (
                  <div key={h.dia} className="flex items-center gap-4 py-2.5 border-b border-[var(--border)] last:border-0">
                    <Switch checked={h.aberto} onCheckedChange={() => toggleDia(i)} />
                    <span className={`w-8 text-sm font-medium ${!h.aberto ? "text-[var(--muted-foreground)]" : ""}`}>{h.dia}</span>
                    {h.aberto ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          defaultValue={h.abertura}
                          className="rounded-lg border border-[var(--border)] bg-[var(--input)] px-2 py-1.5 text-sm outline-none focus:border-[var(--primary)]"
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">até</span>
                        <input
                          type="time"
                          defaultValue={h.fechamento}
                          className="rounded-lg border border-[var(--border)] bg-[var(--input)] px-2 py-1.5 text-sm outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                    ) : (
                      <span className="flex-1 text-sm text-[var(--muted-foreground)]">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes">
            <Section title="Notificações" description="Controle o que você quer ser notificado" icon={Bell}>
              {[
                { label: "Novos agendamentos", desc: "Aviso ao confirmar um novo agendamento", on: true },
                { label: "Cancelamentos", desc: "Alerta quando um agendamento é cancelado", on: true },
                { label: "Pagamento aprovado", desc: "Confirmação de pagamento via InfinitePay", on: true },
                { label: "Estoque baixo", desc: "Alerta quando produto atingir estoque mínimo", on: true },
                { label: "Resumo diário", desc: "Relatório ao fim do expediente", on: false },
                { label: "Resumo semanal", desc: "Relatório toda segunda-feira de manhã", on: false },
              ].map((n) => (
                <Row key={n.label} label={n.label} description={n.desc}>
                  <Switch defaultChecked={n.on} />
                </Row>
              ))}
            </Section>
          </TabsContent>

          {/* Pagamentos */}
          <TabsContent value="pagamentos">
            <Section title="InfinitePay" description="Configurações de pagamento via celular (InfiniteTap)" icon={CreditCard}>
              <Row label="InfiniteTap ativo" description="Aceitar pagamentos por aproximação">
                <Switch defaultChecked={true} />
              </Row>
              <Row label="PIX automático" description="Gerar QR Code automaticamente na venda">
                <Switch defaultChecked={true} />
              </Row>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Token da API InfinitePay</label>
                  <Input type="password" defaultValue="sk_live_••••••••••••••••" />
                  <p className="text-[10px] text-[var(--muted-foreground)]">Solicite em parcerias@cloudwalk.io</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Webhook Secret</label>
                  <Input type="password" defaultValue="whsec_••••••••••••" />
                </div>
              </div>
            </Section>

            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm font-semibold mb-3">Métodos aceitos</p>
              {[
                { label: "Cartão de Crédito", taxa: "2,69%", ativo: true },
                { label: "Cartão de Débito",  taxa: "0,75%", ativo: true },
                { label: "PIX",               taxa: "Grátis", ativo: true },
                { label: "Dinheiro",          taxa: "—",      ativo: true },
                { label: "Voucher/Fidelidade", taxa: "—",     ativo: false },
              ].map((m) => (
                <Row key={m.label} label={m.label} description={`Taxa: ${m.taxa}`}>
                  <Switch defaultChecked={m.ativo} />
                </Row>
              ))}
            </div>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp" className="space-y-5">
            <Section title="WhatsApp API" description="Envio automático de confirmações e lembretes via WhatsApp" icon={WhatsappLogo as any}>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 px-4 py-3 mb-4">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Integração disponível via Z-API ou Evolution API (self-hosted)</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-0.5">Configure as credenciais abaixo para ativar o envio automático</p>
              </div>

              <Row label="Envio automático ativo" description="Ativar/desativar todos os envios">
                <Switch defaultChecked={false} />
              </Row>

              <div className="grid gap-4 sm:grid-cols-2 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Provedor</label>
                  <select className="w-full h-9 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm outline-none focus:border-[var(--primary)]">
                    <option>Z-API</option>
                    <option>Evolution API</option>
                    <option>Twilio</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Instance ID</label>
                  <Input type="password" placeholder="Sua instância" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Token de acesso</label>
                  <Input type="password" placeholder="••••••••••••••••" />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Disparos automáticos</p>
                {[
                  { label:"Confirmação de agendamento", desc:"Enviar ao confirmar novo horário", on:true  },
                  { label:"Lembrete 24h antes",         desc:"Lembrar o cliente no dia anterior", on:true  },
                  { label:"Lembrete 2h antes",          desc:"Alerta no dia do atendimento",      on:false },
                  { label:"Avaliação pós-atendimento",  desc:"Solicitar avaliação após a visita", on:false },
                  { label:"Promoções e novidades",      desc:"Campanhas de marketing (opt-in)",   on:false },
                ].map(n=>(
                  <Row key={n.label} label={n.label} description={n.desc}>
                    <Switch defaultChecked={n.on}/>
                  </Row>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] p-4">
                <p className="text-xs font-semibold mb-2">Template de confirmação</p>
                <textarea defaultValue="Olá {{nome}}! 👋 Seu agendamento foi confirmado para {{data}} às {{hora}} com {{barbeiro}}. Endereço: {{endereco}}. Até lá! ✂️"
                  rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-xs outline-none focus:border-[var(--primary)] resize-none" />
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Variáveis: {"{{nome}}"}, {"{{data}}"}, {"{{hora}}"}, {"{{barbeiro}}"}, {"{{endereco}}"}</p>
              </div>
            </Section>
          </TabsContent>

          {/* Google Agenda */}
          <TabsContent value="google" className="space-y-5">
            <Section title="Google Agenda" description="Sincronizar agendamentos com o Google Calendar" icon={CalendarCheck as any}>
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-[var(--border)]">
                  <GoogleChromeLogo weight="duotone" size={24} className="text-blue-500"/>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Google Calendar</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Não conectado</p>
                </div>
                <Button size="sm" className="gap-1.5 h-8 text-xs">
                  <GoogleChromeLogo weight="bold" size={13}/>Conectar conta
                </Button>
              </div>

              <Row label="Sincronização bidirecional" description="Importar e exportar agendamentos">
                <Switch defaultChecked={false}/>
              </Row>
              <Row label="Criar evento ao agendar" description="Adicionar agendamento no Google Calendar automaticamente">
                <Switch defaultChecked={false}/>
              </Row>
              <Row label="Notificar no Google" description="Usar os lembretes do Google Calendar">
                <Switch defaultChecked={false}/>
              </Row>

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Client ID (OAuth)</label>
                  <Input type="password" placeholder="••••••••••••.apps.googleusercontent.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Client Secret</label>
                  <Input type="password" placeholder="GOCSPX-••••••••••" />
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 px-4 py-3">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Como configurar</p>
                <ol className="text-xs text-blue-600/80 dark:text-blue-500/80 mt-1 space-y-0.5 list-decimal list-inside">
                  <li>Acesse console.cloud.google.com</li>
                  <li>Crie um projeto e ative a Google Calendar API</li>
                  <li>Crie credenciais OAuth 2.0 (Web application)</li>
                  <li>Adicione {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/auth/google/callback como URI autorizado</li>
                </ol>
              </div>
            </Section>
          </TabsContent>
        </Tabs>

        {/* Botão salvar fixo */}
        <div className="sticky bottom-0 mt-6 flex justify-end rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur px-5 py-3">
          <Button onClick={handleSave} className="gap-2">
            {saved ? <><Check className="h-4 w-4" />Salvo!</> : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  )
}
