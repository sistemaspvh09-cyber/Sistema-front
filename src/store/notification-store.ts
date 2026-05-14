import { create } from "zustand"

export type NotificationType = "agendamento" | "pagamento" | "estoque" | "sistema" | "fidelidade"

export interface Notificacao {
  id: string
  tipo: NotificationType
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: Date
  href?: string
}

interface NotifState {
  notificacoes: Notificacao[]
  addNotificacao: (n: Omit<Notificacao, "id" | "lida" | "createdAt">) => void
  marcarLida: (id: string) => void
  marcarTodasLidas: () => void
  naoLidas: () => number
}

const iniciais: Notificacao[] = [
  { id:"n1", tipo:"agendamento", titulo:"Novo agendamento", mensagem:"Carlos Silva agendou Corte + Barba para 15:00", lida:false, createdAt: new Date(Date.now()-5*60000), href:"/agendamentos" },
  { id:"n2", tipo:"pagamento",   titulo:"Pagamento aprovado", mensagem:"PIX de R$70,00 confirmado — Venda #0042", lida:false, createdAt: new Date(Date.now()-12*60000), href:"/financeiro" },
  { id:"n3", tipo:"estoque",     titulo:"Estoque baixo", mensagem:"Óleo para Barba com apenas 3 unidades", lida:false, createdAt: new Date(Date.now()-45*60000), href:"/produtos" },
  { id:"n4", tipo:"fidelidade",  titulo:"Cliente virou Platinum!", mensagem:"Thiago Souza atingiu o tier Platinum 🎉", lida:true,  createdAt: new Date(Date.now()-2*3600000), href:"/fidelidade" },
  { id:"n5", tipo:"agendamento", titulo:"Cancelamento", mensagem:"Rafael Costa cancelou o agendamento das 14:00", lida:true, createdAt: new Date(Date.now()-3*3600000), href:"/agendamentos" },
]

export const useNotifStore = create<NotifState>((set, get) => ({
  notificacoes: iniciais,

  addNotificacao: (n) => {
    const nova: Notificacao = { ...n, id: crypto.randomUUID(), lida: false, createdAt: new Date() }
    set(s => ({ notificacoes: [nova, ...s.notificacoes] }))
  },

  marcarLida: (id) =>
    set(s => ({ notificacoes: s.notificacoes.map(n => n.id===id ? {...n,lida:true} : n) })),

  marcarTodasLidas: () =>
    set(s => ({ notificacoes: s.notificacoes.map(n => ({...n,lida:true})) })),

  naoLidas: () => get().notificacoes.filter(n => !n.lida).length,
}))
