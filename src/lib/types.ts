// ─── Entidades do domínio ────────────────────────────────────────────────────

export interface Cliente {
  id: string
  nome: string
  telefone: string
  email?: string
  dataNascimento?: string
  totalVisitas: number
  ultimaVisita?: string
  createdAt: string
}

export interface Barbeiro {
  id: string
  nome: string
  email: string
  telefone: string
  especialidades: string[]
  ativo: boolean
  comissao: number // percentual 0-100
  avatar?: string
}

export interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracaoMinutos: number
  categoria: CategoriaServico
  ativo: boolean
}

export type CategoriaServico =
  | "corte"
  | "barba"
  | "combo"
  | "tratamento"
  | "coloracao"
  | "outros"

export interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  estoque: number
  estoqueMinimo: number
  categoria: string
  ativo: boolean
}

// ─── Agendamento ─────────────────────────────────────────────────────────────

export type StatusAgendamento =
  | "agendado"
  | "confirmado"
  | "em_andamento"
  | "concluido"
  | "cancelado"
  | "faltou"

export interface Agendamento {
  id: string
  clienteId: string
  cliente: Cliente
  barbeiroId: string
  barbeiro: Barbeiro
  servicos: Servico[]
  data: string
  horaInicio: string
  horaFim: string
  status: StatusAgendamento
  observacoes?: string
  valorTotal: number
  createdAt: string
}

// ─── Venda / PDV ─────────────────────────────────────────────────────────────

export type MetodoPagamento =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito"
  | "voucher"

export type StatusPagamento = "pendente" | "aprovado" | "recusado" | "cancelado"

export interface ItemVenda {
  id: string
  tipo: "servico" | "produto"
  referenciaId: string
  nome: string
  quantidade: number
  precoUnitario: number
  desconto: number
  subtotal: number
}

export interface Venda {
  id: string
  clienteId?: string
  cliente?: Cliente
  barbeiroId: string
  barbeiro: Barbeiro
  agendamentoId?: string
  itens: ItemVenda[]
  subtotal: number
  desconto: number
  total: number
  metodoPagamento: MetodoPagamento
  statusPagamento: StatusPagamento
  infinitePayChargeId?: string
  observacoes?: string
  createdAt: string
}

// ─── Financeiro ───────────────────────────────────────────────────────────────

export type TipoTransacao = "receita" | "despesa"

export interface Transacao {
  id: string
  tipo: TipoTransacao
  descricao: string
  valor: number
  categoria: string
  data: string
  vendaId?: string
  createdAt: string
}

export interface ResumoFinanceiro {
  receitaTotal: number
  despesaTotal: number
  lucroLiquido: number
  ticketMedio: number
  totalVendas: number
  crescimentoReceita: number // percentual em relação ao período anterior
}

// ─── InfinitePay ─────────────────────────────────────────────────────────────

export interface InfinitePayCharge {
  id: string
  amount: number
  status: "pending" | "paid" | "failed" | "cancelled"
  paymentMethod: string
  createdAt: string
  paidAt?: string
  checkoutUrl?: string
}

export interface InfinitePayWebhookPayload {
  event: "charge.paid" | "charge.failed" | "charge.cancelled"
  data: InfinitePayCharge
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  receitaHoje: number
  receitaSemana: number
  receitaMes: number
  agendamentosHoje: number
  clientesNovos: number
  ticketMedio: number
}

export interface GraficoData {
  label: string
  receita: number
  servicos: number
  produtos: number
}
