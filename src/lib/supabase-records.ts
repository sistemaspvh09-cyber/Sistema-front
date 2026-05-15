export type ActiveFilter = "ativos" | "inativos" | "todos"

export type StatusAgendamento =
  | "agendado"
  | "confirmado"
  | "em_andamento"
  | "concluido"
  | "cancelado"
  | "faltou"

export interface ClienteRow {
  id: string
  unidade_id: string | null
  nome: string
  telefone: string | null
  email: string | null
  nascimento: string | null
  observacoes: string | null
  total_visitas: number | null
  total_gasto: number | null
  ultima_visita: string | null
  pontos: number | null
  tier: string | null
  ativo: boolean | null
  created_at: string | null
}

export interface ServicoRow {
  id: string
  unidade_id: string | null
  nome: string
  categoria: string
  preco: number
  duracao_minutos: number
  popular: boolean | null
  ativo: boolean | null
  created_at: string | null
}

export interface ProdutoRow {
  id: string
  unidade_id: string | null
  nome: string
  categoria: string | null
  preco: number
  custo: number | null
  estoque: number | null
  estoque_minimo: number | null
  ativo: boolean | null
  created_at: string | null
}

export interface BarbeiroRow {
  id: string
  unidade_id: string | null
  perfil_id: string | null
  nome: string
  email: string | null
  telefone: string | null
  especialidades: string[] | null
  comissao: number | null
  meta_mensal: number | null
  avaliacao: number | null
  experiencia: string | null
  ativo: boolean | null
  created_at: string | null
}

export interface UnidadeRow {
  id: string
  nome: string
  slug: string
  endereco: string | null
  cidade: string | null
  telefone: string | null
  gerente: string | null
  cor: string | null
  ativa: boolean | null
  created_at: string | null
}

export interface AgendamentoRow {
  id: string
  unidade_id: string | null
  cliente_id: string | null
  barbeiro_id: string | null
  data: string
  hora_inicio: string
  duracao_min: number | null
  status: StatusAgendamento
  valor_total: number | null
  observacoes: string | null
  origem: string | null
  created_at: string | null
  clientes?: Pick<ClienteRow, "id" | "nome" | "telefone"> | null
  barbeiros?: Pick<BarbeiroRow, "id" | "nome"> | null
}

export interface TransacaoRow {
  id: string
  unidade_id: string | null
  tipo: "receita" | "despesa"
  descricao: string
  valor: number
  categoria: string | null
  metodo: string | null
  data: string
  venda_id: string | null
  ativo: boolean | null
  created_at: string | null
}

export function activeMatches(active: boolean | null | undefined, filter: ActiveFilter) {
  const isActive = active !== false
  if (filter === "ativos") return isActive
  if (filter === "inativos") return !isActive
  return true
}

export function asMoney(value: number | null | undefined) {
  return Number(value ?? 0)
}
