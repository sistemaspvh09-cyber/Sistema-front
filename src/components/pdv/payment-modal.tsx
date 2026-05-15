"use client"

import { useState } from "react"
import {
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
  QrCode,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { MetodoPagamento } from "@/lib/types"

type PaymentStep = "select" | "processing" | "success" | "error"

const metodos: { id: MetodoPagamento; label: string; icon: React.ElementType; desc: string }[] = [
  {
    id: "pix",
    label: "PIX",
    icon: QrCode,
    desc: "Aprovação instantânea • Grátis",
  },
  {
    id: "credito",
    label: "Crédito",
    icon: CreditCard,
    desc: "Via celular (InfiniteTap) ou máquina",
  },
  {
    id: "debito",
    label: "Débito",
    icon: Smartphone,
    desc: "Via celular (InfiniteTap) ou máquina",
  },
  {
    id: "dinheiro",
    label: "Dinheiro",
    icon: Banknote,
    desc: "Pagamento em espécie",
  },
  {
    id: "voucher",
    label: "Voucher",
    icon: Landmark,
    desc: "Créditos e fidelidade",
  },
]

interface PaymentModalProps {
  total: number
  onConfirm: (metodo: MetodoPagamento, chargeId?: string) => Promise<void>
  onClose: () => void
}

export function PaymentModal({ total, onConfirm, onClose }: PaymentModalProps) {
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null)
  const [step, setStep] = useState<PaymentStep>("select")
  const [errorMsg, setErrorMsg] = useState("")

  async function handlePagar() {
    if (!metodo) return
    setStep("processing")
    setErrorMsg("")

    try {
      await onConfirm(metodo)
      setStep("success")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao processar pagamento")
      setStep("error")
    }
  }

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)]" />
        <p className="text-sm font-medium">
          {metodo === "credito" || metodo === "debito"
            ? "Aguardando pagamento no InfiniteTap..."
            : "Processando pagamento..."}
        </p>
        {(metodo === "credito" || metodo === "debito") && (
          <p className="max-w-xs text-center text-xs text-[var(--muted-foreground)]">
            Aproxime o cartão ou celular do aparelho do barbeiro para concluir
          </p>
        )}
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">Pagamento aprovado!</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          {formatCurrency(total)} via {metodo?.toUpperCase()}
        </p>
        <Button onClick={onClose} className="mt-2">
          Fechar e imprimir
        </Button>
      </div>
    )
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-semibold">Pagamento recusado</p>
        <p className="text-sm text-[var(--muted-foreground)]">{errorMsg}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("select")}>
            Tentar novamente
          </Button>
          <Button variant="destructive" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[var(--muted)] p-4 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">Total a pagar</p>
        <p className="text-3xl font-bold text-[var(--primary)]">{formatCurrency(total)}</p>
      </div>

      <p className="text-sm font-medium">Forma de pagamento</p>
      <div className="grid grid-cols-1 gap-2">
        {metodos.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetodo(m.id)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              metodo === m.id
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] hover:border-[var(--primary)]/50"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-md ${
                metodo === m.id ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"
              }`}
            >
              <m.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="flex-1" disabled={!metodo} onClick={handlePagar}>
          Cobrar {metodo ? formatCurrency(total) : ""}
        </Button>
      </div>
    </div>
  )
}
