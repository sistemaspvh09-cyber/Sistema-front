/**
 * Supabase Client — BarberPro
 *
 * Para ativar o banco real:
 * 1. Crie um projeto em https://supabase.com
 * 2. Copie as variáveis para .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
 * 3. Execute o schema SQL abaixo no Editor SQL do Supabase
 *
 * Enquanto as variáveis não estiverem definidas, o sistema
 * roda em modo demo (dados em memória).
 */

import { createClient } from "@supabase/supabase-js"

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ""
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const supabase = url && key ? createClient(url, key) : null

export const SUPABASE_ENABLED = Boolean(url && key)

/* ── Helpers de auth ────────────────────────────────────────────────── */

export async function signIn(email: string, password: string) {
  if (!supabase) return { user: null, error: new Error("Supabase não configurado") }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

/* ── Database helpers ───────────────────────────────────────────────── */

export async function fetchClientes(unidadeId?: string) {
  if (!supabase) return []
  let query = supabase.from("clientes").select("*").order("created_at", { ascending: false })
  if (unidadeId) query = query.eq("unidade_id", unidadeId)
  const { data } = await query
  return data ?? []
}

export async function fetchAgendamentos(data?: string, unidadeId?: string) {
  if (!supabase) return []
  let query = supabase.from("agendamentos").select("*, clientes(*), barbeiros(*), servicos(*)")
  if (data) query = query.eq("data", data)
  if (unidadeId) query = query.eq("unidade_id", unidadeId)
  const { data: rows } = await query.order("hora_inicio")
  return rows ?? []
}

export async function fetchVendas(unidadeId?: string, inicio?: string, fim?: string) {
  if (!supabase) return []
  let query = supabase.from("vendas").select("*").order("created_at", { ascending: false })
  if (unidadeId) query = query.eq("unidade_id", unidadeId)
  if (inicio) query = query.gte("created_at", inicio)
  if (fim)    query = query.lte("created_at", fim)
  const { data } = await query
  return data ?? []
}
