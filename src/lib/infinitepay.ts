/**
 * Integração com a API da InfinitePay
 * Docs: https://docs.infinitepay.io
 * Contato parceria: parcerias@cloudwalk.io
 *
 * Fluxo InfiniteTap (celular como maquininha):
 * 1. Sistema cria uma cobrança via API
 * 2. Cliente é redirecionado ao app InfinitePay para concluir
 * 3. InfinitePay envia webhook confirmando o pagamento
 * 4. Sistema reconcilia automaticamente a venda
 */

import { createHmac, timingSafeEqual } from "crypto"

const INFINITEPAY_BASE_URL =
  process.env.INFINITEPAY_BASE_URL ?? "https://api.infinitepay.io/v2"

const INFINITEPAY_TOKEN = process.env.INFINITEPAY_TOKEN ?? ""

interface CreateChargeParams {
  amount: number // em centavos
  description: string
  orderId: string
  customerName?: string
  customerPhone?: string
  installments?: number
  paymentMethod: "credit" | "debit" | "pix"
  callbackUrl?: string
}

interface ChargeResponse {
  id: string
  status: string
  amount: number
  checkoutUrl?: string
  pixQrCode?: string
  pixQrCodeBase64?: string
  createdAt: string
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${INFINITEPAY_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INFINITEPAY_TOKEN}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? "Erro na API InfinitePay")
  }

  return res.json() as Promise<T>
}

export const infinitePay = {
  async createCharge(params: CreateChargeParams): Promise<ChargeResponse> {
    return request<ChargeResponse>("/charges", {
      method: "POST",
      body: JSON.stringify({
        amount: params.amount,
        description: params.description,
        order_id: params.orderId,
        customer: {
          name: params.customerName,
          phone: params.customerPhone,
        },
        payment_method: params.paymentMethod,
        installments: params.installments ?? 1,
        callback_url: params.callbackUrl,
      }),
    })
  },

  async getCharge(chargeId: string): Promise<ChargeResponse> {
    return request<ChargeResponse>(`/charges/${chargeId}`)
  },

  async cancelCharge(chargeId: string): Promise<ChargeResponse> {
    return request<ChargeResponse>(`/charges/${chargeId}/cancel`, {
      method: "POST",
    })
  },

  async createPixCharge(params: {
    amount: number
    description: string
    orderId: string
  }): Promise<ChargeResponse> {
    return infinitePay.createCharge({
      ...params,
      paymentMethod: "pix",
    })
  },

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = process.env.INFINITEPAY_WEBHOOK_SECRET ?? ""
    if (!secret) return false

    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("hex")
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)

    if (signatureBuffer.length !== expectedBuffer.length) return false

    return timingSafeEqual(signatureBuffer, expectedBuffer)
  },
}
