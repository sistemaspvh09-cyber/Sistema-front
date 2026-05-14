"use client"

import { useRef } from "react"
import { Printer, X, CheckCircle } from "@phosphor-icons/react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { MetodoPagamento } from "@/lib/types"

interface ItemComprovante { nome: string; qtd: number; valor: number }

interface ComprovanteProps {
  numero: string
  itens: ItemComprovante[]
  subtotal: number
  desconto: number
  total: number
  metodoPagamento: MetodoPagamento
  cliente?: string
  barbeiro: string
  onClose: () => void
}

const metodoLabel: Record<MetodoPagamento, string> = {
  pix: "PIX", credito: "Cartão de Crédito", debito: "Cartão de Débito",
  dinheiro: "Dinheiro", voucher: "Voucher",
}

export function Comprovante({ numero, itens, subtotal, desconto, total, metodoPagamento, cliente, barbeiro, onClose }: ComprovanteProps) {
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const conteudo = printRef.current?.innerHTML
    if (!conteudo) return
    const win = window.open("", "_blank", "width=400,height=600")
    if (!win) return
    win.document.write(`
      <html><head><title>Comprovante #${numero}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 16px; max-width: 300px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; }
        .total { font-size: 16px; font-weight: bold; }
      </style></head>
      <body>${conteudo}</body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xs rounded-2xl bg-[var(--card)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle weight="duotone" size={20} />
            <span className="font-semibold text-sm">Venda concluída!</span>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Comprovante imprimível */}
        <div ref={printRef} className="p-5 font-mono text-xs">
          <div className="center bold text-lg mb-1">BarberPro</div>
          <div className="center text-[10px] text-[var(--muted-foreground)] mb-3">
            {new Date().toLocaleString("pt-BR")}<br />
            Comprovante #{numero}
          </div>

          <div className="line" />

          {cliente && <div className="row"><span>Cliente</span><span className="font-semibold">{cliente}</span></div>}
          <div className="row"><span>Barbeiro</span><span className="font-semibold">{barbeiro}</span></div>

          <div className="line" />

          <p className="font-semibold text-[10px] mb-1 uppercase tracking-wider text-[var(--muted-foreground)]">Itens</p>
          {itens.map((item, i) => (
            <div key={i} className="row">
              <span className="flex-1 truncate">{item.qtd}x {item.nome}</span>
              <span className="ml-2 font-semibold">{formatCurrency(item.valor)}</span>
            </div>
          ))}

          <div className="line" />

          <div className="row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {desconto > 0 && (
            <div className="row text-emerald-600"><span>Desconto ({desconto}%)</span><span>-{formatCurrency(subtotal * desconto / 100)}</span></div>
          )}
          <div className="row total mt-1 text-[var(--primary)]">
            <span>TOTAL</span><span>{formatCurrency(total)}</span>
          </div>
          <div className="row mt-1"><span>Pagamento</span><span className="font-semibold">{metodoLabel[metodoPagamento]}</span></div>

          <div className="line" />

          <p className="center text-[9px] text-[var(--muted-foreground)] mt-2">Obrigado pela preferência!<br />Volte sempre 😊</p>
        </div>

        {/* Ações */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          >
            <Printer weight="duotone" size={15} />Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[var(--primary)] py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Nova venda
          </button>
        </div>
      </div>
    </div>
  )
}
