"use client"

import {
  CurrencyDollar, CalendarBlank, Users, ShoppingBag,
} from "@phosphor-icons/react"
import { GradientCard } from "@/components/ui/gradient-card"
import { formatCurrency } from "@/lib/utils"

const cards = [
  {
    title: "Receita hoje",
    value: formatCurrency(1240),
    change: 12.5,
    subtitle: "vs ontem",
    icon: CurrencyDollar,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowClass: "glow-green",
    sparkline: [820, 940, 760, 1050, 980, 1120, 1240],
  },
  {
    title: "Agendamentos",
    value: "14",
    change: 5,
    subtitle: "hoje",
    icon: CalendarBlank,
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    glowClass: "glow-blue",
    sparkline: [8, 11, 9, 13, 10, 12, 14],
  },
  {
    title: "Clientes novos",
    value: "3",
    change: -15,
    subtitle: "este mês",
    icon: Users,
    gradient: "from-violet-500 via-purple-600 to-fuchsia-700",
    glowClass: "glow-purple",
    sparkline: [5, 4, 6, 3, 5, 4, 3],
  },
  {
    title: "Ticket médio",
    value: formatCurrency(88.57),
    change: 8.2,
    subtitle: "vs semana passada",
    icon: ShoppingBag,
    gradient: "from-orange-500 via-orange-600 to-rose-600",
    glowClass: "glow-orange",
    sparkline: [72, 78, 85, 80, 88, 84, 89],
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <GradientCard key={card.title} {...card} delay={i * 0.08} />
      ))}
    </div>
  )
}
