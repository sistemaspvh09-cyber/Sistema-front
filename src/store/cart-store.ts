import { create } from "zustand"
import type { ItemVenda, MetodoPagamento } from "@/lib/types"

interface CartState {
  itens: ItemVenda[]
  clienteId: string | null
  barbeiroId: string | null
  metodoPagamento: MetodoPagamento | null
  desconto: number

  addItem: (item: Omit<ItemVenda, "id" | "subtotal">) => void
  removeItem: (id: string) => void
  updateQuantidade: (id: string, quantidade: number) => void
  setCliente: (clienteId: string | null) => void
  setBarbeiro: (barbeiroId: string | null) => void
  setMetodoPagamento: (metodo: MetodoPagamento) => void
  setDesconto: (desconto: number) => void
  clearCart: () => void

  subtotal: () => number
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  itens: [],
  clienteId: null,
  barbeiroId: null,
  metodoPagamento: null,
  desconto: 0,

  addItem: (item) => {
    const existing = get().itens.find(
      (i) => i.referenciaId === item.referenciaId && i.tipo === item.tipo
    )
    if (existing) {
      set((s) => ({
        itens: s.itens.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantidade: i.quantidade + item.quantidade,
                subtotal:
                  (i.quantidade + item.quantidade) *
                  i.precoUnitario *
                  (1 - i.desconto / 100),
              }
            : i
        ),
      }))
      return
    }

    const id = crypto.randomUUID()
    const subtotal =
      item.quantidade * item.precoUnitario * (1 - item.desconto / 100)
    set((s) => ({ itens: [...s.itens, { ...item, id, subtotal }] }))
  },

  removeItem: (id) =>
    set((s) => ({ itens: s.itens.filter((i) => i.id !== id) })),

  updateQuantidade: (id, quantidade) => {
    if (quantidade <= 0) {
      get().removeItem(id)
      return
    }
    set((s) => ({
      itens: s.itens.map((i) =>
        i.id === id
          ? {
              ...i,
              quantidade,
              subtotal: quantidade * i.precoUnitario * (1 - i.desconto / 100),
            }
          : i
      ),
    }))
  },

  setCliente: (clienteId) => set({ clienteId }),
  setBarbeiro: (barbeiroId) => set({ barbeiroId }),
  setMetodoPagamento: (metodoPagamento) => set({ metodoPagamento }),
  setDesconto: (desconto) => set({ desconto }),

  clearCart: () =>
    set({
      itens: [],
      clienteId: null,
      barbeiroId: null,
      metodoPagamento: null,
      desconto: 0,
    }),

  subtotal: () => get().itens.reduce((acc, i) => acc + i.subtotal, 0),
  total: () => {
    const subtotal = get().subtotal()
    const desconto = get().desconto
    return subtotal - subtotal * (desconto / 100)
  },
}))
