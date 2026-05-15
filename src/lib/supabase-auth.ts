"use client"

import { createClient } from "@/lib/client"
import type { User, UserRole } from "@/store/auth-store"

interface PerfilRow {
  id: string
  nome: string | null
  role: string | null
  avatar_url: string | null
  barbeiro_id: string | null
  unidade_id: string | null
}

function isUserRole(role: string | null): role is UserRole {
  return role === "admin" || role === "barbeiro" || role === "caixa"
}

export async function getCurrentProfile(): Promise<User | null> {
  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) return null

  const { data: perfil, error: perfilError } = await supabase
    .from("perfis")
    .select("id,nome,role,avatar_url,barbeiro_id,unidade_id")
    .eq("id", userData.user.id)
    .maybeSingle<PerfilRow>()

  if (perfilError || !perfil || !isUserRole(perfil.role)) return null

  return {
    id: userData.user.id,
    nome: perfil.nome ?? userData.user.email ?? "Usuário",
    email: userData.user.email ?? "",
    role: perfil.role,
    avatar: perfil.avatar_url ?? undefined,
    barbeiroId: perfil.barbeiro_id ?? undefined,
    unidadeId: perfil.unidade_id ?? undefined,
  }
}
