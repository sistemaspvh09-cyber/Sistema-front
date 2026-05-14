import { NextRequest, NextResponse } from "next/server"
import { infinitePay } from "@/lib/infinitepay"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { metodoPagamento, total, itens, clienteNome, clienteTelefone } = body

    const orderId = `venda_${Date.now()}`
    let chargeId: string | undefined

    if (metodoPagamento === "credito" || metodoPagamento === "debito") {
      const charge = await infinitePay.createCharge({
        amount: Math.round(total * 100), // converte para centavos
        description: `Venda BarberPro — ${itens?.length ?? 0} item(s)`,
        orderId,
        customerName: clienteNome,
        customerPhone: clienteTelefone,
        paymentMethod: metodoPagamento,
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

    // TODO: persistir venda no banco de dados (Supabase / Prisma)

    return NextResponse.json({
      success: true,
      orderId,
      chargeId,
    })
  } catch (err: any) {
    console.error("[POST /api/vendas]", err)
    return NextResponse.json(
      { success: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    )
  }
}
