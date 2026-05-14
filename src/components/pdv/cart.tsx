"use client"

import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface CartProps {
  onCheckout: () => void
}

export function Cart({ onCheckout }: CartProps) {
  const { itens, removeItem, updateQuantidade, subtotal, total, desconto } = useCartStore()

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart className="mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium">Carrinho vazio</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Adicione serviços ou produtos
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {itens.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{item.nome}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {formatCurrency(item.precoUnitario)} un.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantidade(item.id, item.quantidade - 1)}
                className="flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] hover:bg-[var(--muted)]"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-sm font-medium">{item.quantidade}</span>
              <button
                onClick={() => updateQuantidade(item.id, item.quantidade + 1)}
                className="flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] hover:bg-[var(--muted)]"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] pt-4 space-y-2 mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">Subtotal</span>
          <span>{formatCurrency(subtotal())}</span>
        </div>
        {desconto > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Desconto ({desconto}%)</span>
            <span>-{formatCurrency(subtotal() * (desconto / 100))}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-[var(--primary)]">{formatCurrency(total())}</span>
        </div>

        <Button className="mt-3 w-full" size="lg" onClick={onCheckout}>
          Finalizar venda
        </Button>
      </div>
    </div>
  )
}
