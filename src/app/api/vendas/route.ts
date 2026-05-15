import { NextRequest, NextResponse } from "next/server"
import { infinitePay } from "@/lib/infinitepay"
import type { MetodoPagamento } from "@/lib/types"

type VendaRequestBody = {
  metodoPagamento?: MetodoPagamento
  total?: number
  itens?: unknown[]
  clienteNome?: string
  clienteTelefone?: string
}

function paymentMethodForInfinitePay(metodo: MetodoPagamento) {
  if (metodo === "credito") return "credit" as const
  if (metodo === "debito") return "debit" as const
  return "pix" as const
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VendaRequestBody
    const { metodoPagamento, total, itens, clienteNome, clienteTelefone } = body

    const orderId = `venda_${Date.now()}`
    let chargeId: string | undefined

    if (!metodoPagamento || typeof total !== "number") {
      return NextResponse.json(
        { success: false, error: "Dados de venda inválidos" },
        { status: 400 }
      )
    }

    if (metodoPagamento === "credito" || metodoPagamento === "debito") {
      const charge = await infinitePay.createCharge({
        amount: Math.round(total * 100), // converte para centavos
        description: `Venda BarberPro — ${itens?.length ?? 0} item(s)`,
        orderId,
        customerName: clienteNome,
        customerPhone: clienteTelefone,
        paymentMethod: paymentMethodForInfinitePay(metodoPagamento),
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/infinitepay`,
      })
      chargeId = charge.id
    }

    if (metodoPagamento === "pix") {
      const charge = await infinitePay.createPixCharge({
        amount: Math.round(total * 100),
        description: `Venda BarberPro`,
        orderId,
      })
      chargeId = charge.id
    }

    // Próxima fase: persistir venda, itens, transação e comissão no Supabase.

    return NextResponse.json({
      success: true,
      orderId,
      chargeId,
    })
  } catch (err: unknown) {
    console.error("[POST /api/vendas]", err)
    const message = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
