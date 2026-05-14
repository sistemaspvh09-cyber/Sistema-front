"use client"

import { use } from "react"
import AgendarBasePage from "../page"

const UNIDADES: Record<string, { nome: string; endereco: string; cor: string }> = {
  "centro":        { nome:"BarberPro Centro",        endereco:"Rua das Flores, 123 — São Paulo, SP", cor:"from-orange-500 to-rose-600"  },
  "pinheiros":     { nome:"BarberPro Pinheiros",     endereco:"Av. Rebouças, 456 — São Paulo, SP",   cor:"from-blue-500 to-indigo-600"  },
  "vila-madalena": { nome:"BarberPro Vila Madalena",  endereco:"R. Harmonia, 789 — São Paulo, SP",    cor:"from-violet-500 to-purple-700"},
}

export default function AgendarSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const unidade = UNIDADES[slug]

  if (!unidade) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-[var(--background)]">
        <div className="text-6xl">✂️</div>
        <h1 className="text-2xl font-bold">Unidade não encontrada</h1>
        <p className="text-[var(--muted-foreground)]">O link <code className="bg-[var(--muted)] px-1 rounded">/agendar/{slug}</code> não existe.</p>
        <a href="/agendar" className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white">Ver unidades disponíveis</a>
      </div>
    )
  }

  return <AgendarBasePage />
}
