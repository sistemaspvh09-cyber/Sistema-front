"use client"

import { useState } from "react"
import { Search, Scissors, Package, User, UserPlus, Percent, ChevronDown } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Cart } from "@/components/pdv/cart"
import { PaymentModal } from "@/components/pdv/payment-modal"
import { Dialog, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"
import type { MetodoPagamento } from "@/lib/types"

const SERVICOS = [
  { id: "s1", nome: "Corte Masculino",  preco: 45,  categoria: "corte",      popular: true  },
  { id: "s2", nome: "Barba Completa",   preco: 35,  categoria: "barba",      popular: true  },
  { id: "s3", nome: "Corte + Barba",    preco: 70,  categoria: "combo",      popular: true  },
  { id: "s4", nome: "Corte Degradê",    preco: 55,  categoria: "corte",      popular: false },
  { id: "s5", nome: "Platinado",        preco: 120, categoria: "coloracao",  popular: false },
  { id: "s6", nome: "Hidratação",       preco: 60,  categoria: "tratamento", popular: false },
  { id: "s7", nome: "Sobrancelha",      preco: 20,  categoria: "outros",     popular: false },
]

const PRODUTOS = [
  { id: "p1", nome: "Pomada Matte",         preco: 45, estoque: 12 },
  { id: "p2", nome: "Óleo para Barba",      preco: 38, estoque: 3  },
  { id: "p3", nome: "Shampoo Antiqueda",    preco: 55, estoque: 5  },
  { id: "p4", nome: "Cera Modeladora",      preco: 42, estoque: 15 },
  { id: "p5", nome: "Balm para Barba",      preco: 35, estoque: 2  },
]

const BARBEIROS = ["João Mendes", "Marcos Silva", "Rafael Torres"]

const catLabel: Record<string, string> = {
  corte: "Corte", barba: "Barba", combo: "Combo",
  coloracao: "Coloração", tratamento: "Tratamento", outros: "Outros",
}

const catColor: Record<string, string> = {
  corte: "bg-blue-500/10 text-blue-600",
  barba: "bg-orange-500/10 text-orange-600",
  combo: "bg-purple-500/10 text-purple-600",
  coloracao: "bg-pink-500/10 text-pink-600",
  tratamento: "bg-teal-500/10 text-teal-600",
  outros: "bg-gray-500/10 text-gray-600",
}

export default function PDVPage() {
  const [tab, setTab] = useState<"servicos" | "produtos">("servicos")
  const [busca, setBusca] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [desconto, setDesconto] = useState(0)
  const [barbeiro, setBarbeiro] = useState(BARBEIROS[0])
  const { addItem, total, setDesconto: storeSetDesconto } = useCartStore()

  const servFiltrados = SERVICOS.filter(s => s.nome.toLowerCase().includes(busca.toLowerCase()))
  const prodFiltrados = PRODUTOS.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))

  const handleDesconto = (v: number) => {
    setDesconto(v)
    storeSetDesconto(v)
  }

  async function handleConfirmarPagamento(metodo: MetodoPagamento) {
    const res = await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metodoPagamento: metodo, total: total(), itens: useCartStore.getState().itens }),
    })
    if (!res.ok) throw new Error("Falha ao registrar venda")
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="PDV" subtitle="Ponto de Venda" />

      <div className="flex flex-1 overflow-hidden">

        {/* Catálogo */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-[var(--border)]">

          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
            <Input
              leftIcon={<Search className="h-3.5 w-3.5" />}
              placeholder="Buscar serviço ou produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1 shrink-0">
              {(["servicos", "produtos"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    tab === t ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {t === "servicos" ? <Scissors className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
                  {t === "servicos" ? "Serviços" : "Produtos"}
                </button>
              ))}
            </div>
          </div>

          {/* Barbeiro selector */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted)]/30">
            <User className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
            <span className="text-xs text-[var(--muted-foreground)]">Barbeiro:</span>
            <div className="relative">
              <select
                value={barbeiro}
                onChange={(e) => setBarbeiro(e.target.value)}
                className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] pl-2 pr-6 py-1 text-xs font-medium outline-none focus:border-[var(--primary)]"
              >
                {BARBEIROS.map((b) => <option key={b}>{b}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--muted-foreground)]" />
            </div>
          </div>

          {/* Grid */}
          <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 lg:grid-cols-3 xl:grid-cols-4 content-start">
            {(tab === "servicos" ? servFiltrados : prodFiltrados).map((item) => {
              const isServico = tab === "servicos"
              const s = item as typeof SERVICOS[0]
              return (
                <button
                  key={item.id}
                  onClick={() => addItem({
                    tipo: isServico ? "servico" : "produto",
                    referenciaId: item.id,
                    nome: item.nome,
                    quantidade: 1,
                    precoUnitario: item.preco,
                    desconto: 0,
                  })}
                  className="group relative flex flex-col items-start rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3.5 text-left transition-all hover:border-[var(--primary)] hover:shadow-md active:scale-95 duration-150"
                >
                  {isServico && s.popular && (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-[var(--primary)] px-1.5 py-px text-[9px] font-bold text-white">Top</span>
                  )}
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl mb-2.5 ${
                    isServico ? (catColor[s.categoria] ?? "bg-gray-100") : "bg-[var(--muted)]"
                  }`}>
                    {isServico ? <Scissors className="h-4 w-4" /> : <Package className="h-4 w-4 text-[var(--muted-foreground)]" />}
                  </div>
                  <p className="text-xs font-semibold leading-snug">{item.nome}</p>
                  {isServico && (
                    <span className="mt-1 text-[10px] text-[var(--muted-foreground)]">{catLabel[s.categoria]}</span>
                  )}
                  {!isServico && (
                    <span className={`mt-1 text-[10px] ${(item as typeof PRODUTOS[0]).estoque <= 3 ? "text-amber-500 font-medium" : "text-[var(--muted-foreground)]"}`}>
                      Estoque: {(item as typeof PRODUTOS[0]).estoque}
                    </span>
                  )}
                  <p className="mt-2 text-base font-bold text-[var(--primary)]">{formatCurrency(item.preco)}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Carrinho */}
        <div className="flex w-80 shrink-0 flex-col bg-[var(--card)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
            <p className="text-sm font-semibold">Carrinho</p>
            {desconto === 0 ? (
              <button
                onClick={() => handleDesconto(10)}
                className="flex items-center gap-1 rounded-lg border border-dashed border-[var(--border)] px-2 py-1 text-xs text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                <Percent className="h-3 w-3" />Desconto
              </button>
            ) : (
              <button
                onClick={() => handleDesconto(0)}
                className="flex items-center gap-1 rounded-lg bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)]"
              >
                <Percent className="h-3 w-3" />{desconto}% off
              </button>
            )}
          </div>

          {/* Cliente */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 bg-[var(--muted)]/30">
            <UserPlus className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
            <input
              type="text"
              placeholder="Cliente (opcional)"
              className="flex-1 bg-transparent text-xs text-[var(--muted-foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <Cart onCheckout={() => setShowPayment(true)} />
          </div>
        </div>
      </div>

      {/* Modal pagamento */}
      <Dialog open={showPayment} onClose={() => setShowPayment(false)} className="max-w-sm">
        <DialogHeader onClose={() => setShowPayment(false)}>
          <DialogTitle>Finalizar pagamento</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <PaymentModal
            total={total()}
            onConfirm={handleConfirmarPagamento}
            onClose={() => setShowPayment(false)}
          />
        </DialogBody>
      </Dialog>
    </div>
  )
}
