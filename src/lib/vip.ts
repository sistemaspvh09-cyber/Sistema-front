/**
 * Sistema de tiers e pontos de fidelidade BarberPro
 *
 * Regras:
 *  - 1 ponto para cada R$1 gasto em serviços
 *  - 0.5 ponto por produto comprado
 *  - Bônus de aniversário: +50 pontos
 *  - Tier calculado pela combinação de visitas + gasto total
 */

export type VipTier = "bronze" | "silver" | "gold" | "platinum"

export interface TierConfig {
  tier: VipTier
  label: string
  minVisitas: number
  minGasto: number
  corGradient: string
  corBorda: string
  corTexto: string
  desconto: number       // % desconto automático
  pontosMultip: number   // multiplicador de pontos
  beneficios: string[]
}

export const TIERS: TierConfig[] = [
  {
    tier: "bronze",
    label: "Bronze",
    minVisitas: 0,
    minGasto: 0,
    corGradient: "from-amber-700 to-amber-900",
    corBorda: "border-amber-700/40",
    corTexto: "text-amber-700",
    desconto: 0,
    pontosMultip: 1,
    beneficios: ["Acumula pontos a cada visita", "Aniversário com 50 pontos bônus"],
  },
  {
    tier: "silver",
    label: "Prata",
    minVisitas: 6,
    minGasto: 300,
    corGradient: "from-slate-400 to-slate-600",
    corBorda: "border-slate-400/40",
    corTexto: "text-slate-500",
    desconto: 5,
    pontosMultip: 1.25,
    beneficios: ["5% de desconto em todos os serviços", "1.25x pontos por visita", "Agendamento prioritário"],
  },
  {
    tier: "gold",
    label: "Ouro",
    minVisitas: 16,
    minGasto: 800,
    corGradient: "from-yellow-400 to-amber-500",
    corBorda: "border-yellow-400/40",
    corTexto: "text-amber-500",
    desconto: 10,
    pontosMultip: 1.5,
    beneficios: ["10% de desconto em serviços", "1.5x pontos", "1 serviço grátis a cada 10 visitas", "Atendimento VIP sem fila"],
  },
  {
    tier: "platinum",
    label: "Platinum",
    minVisitas: 31,
    minGasto: 2000,
    corGradient: "from-violet-500 to-purple-700",
    corBorda: "border-violet-500/40",
    corTexto: "text-violet-500",
    desconto: 15,
    pontosMultip: 2,
    beneficios: ["15% de desconto em tudo", "2x pontos em todas as compras", "1 serviço grátis a cada 5 visitas", "Horário exclusivo", "Brinde mensal surpresa"],
  },
]

export function calcTier(totalVisitas: number, totalGasto: number): TierConfig {
  const eligible = TIERS.filter(
    (t) => totalVisitas >= t.minVisitas && totalGasto >= t.minGasto
  )
  return eligible[eligible.length - 1] ?? TIERS[0]
}

export function calcPontos(totalGasto: number, tier: TierConfig): number {
  return Math.floor(totalGasto * tier.pontosMultip)
}

export function pontosParaProximoTier(totalVisitas: number, totalGasto: number): {
  tier: TierConfig | null
  faltamVisitas: number
  faltamGasto: number
  progressoVisitas: number
  progressoGasto: number
} {
  const atual = calcTier(totalVisitas, totalGasto)
  const idx = TIERS.findIndex((t) => t.tier === atual.tier)
  const prox = TIERS[idx + 1] ?? null

  if (!prox) return { tier: null, faltamVisitas: 0, faltamGasto: 0, progressoVisitas: 100, progressoGasto: 100 }

  const faltamVisitas = Math.max(0, prox.minVisitas - totalVisitas)
  const faltamGasto = Math.max(0, prox.minGasto - totalGasto)
  const progressoVisitas = Math.min(100, (totalVisitas / prox.minVisitas) * 100)
  const progressoGasto = Math.min(100, (totalGasto / prox.minGasto) * 100)

  return { tier: prox, faltamVisitas, faltamGasto, progressoVisitas, progressoGasto }
}

export function diasSemVisita(ultimaVisita: string): number {
  return Math.floor((Date.now() - new Date(ultimaVisita).getTime()) / 86400000)
}

export function statusRisco(diasSem: number): "ativo" | "atencao" | "risco" | "perdido" {
  if (diasSem <= 30)  return "ativo"
  if (diasSem <= 60)  return "atencao"
  if (diasSem <= 90)  return "risco"
  return "perdido"
}
