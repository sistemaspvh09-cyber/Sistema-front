import { NextRequest, NextResponse } from "next/server"
import { infinitePay } from "@/lib/infinitepay"
import type { InfinitePayWebhookPayload } from "@/lib/types"

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-infinitepay-signature") ?? ""
  const rawBody = await req.text()

  if (!infinitePay.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  const payload: InfinitePayWebhookPayload = JSON.parse(rawBody)

  switch (payload.event) {
    case "charge.paid":
      // TODO: atualizar status da venda para "aprovado" no banco
      console.log("[webhook] Pagamento aprovado:", payload.data.id)
      break

    case "charge.failed":
      // TODO: atualizar status da venda para "recusado"
      console.log("[webhook] Pagamento recusado:", payload.data.id)
      break

    case "charge.cancelled":
      // TODO: cancelar venda no banco
      console.log("[webhook] Pagamento cancelado:", payload.data.id)
      break
  }

  return NextResponse.json({ received: true })
}
