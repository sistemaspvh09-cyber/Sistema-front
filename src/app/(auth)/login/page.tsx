"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Scissors, Eye, EyeSlash, ArrowRight,
  LockKey, EnvelopeSimple, SpinnerGap
} from "@phosphor-icons/react"
import { useAuthStore } from "@/store/auth-store"
import { useToast } from "@/components/ui/toast"

const DEMO_USERS = [
  { email: "admin@barberpro.com",    senha: "123456", nome: "Admin BarberPro", role: "admin"    as const },
  { email: "joao@barberpro.com",     senha: "123456", nome: "João Mendes",     role: "barbeiro" as const },
  { email: "caixa@barberpro.com",    senha: "123456", nome: "Caixa",          role: "caixa"    as const },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro("")

    await new Promise((r) => setTimeout(r, 800))

    const user = DEMO_USERS.find(
      (u) => u.email === email.toLowerCase().trim() && u.senha === senha
    )

    if (!user) {
      setErro("E-mail ou senha incorretos.")
      setLoading(false)
      return
    }

    login(
      { id: crypto.randomUUID(), nome: user.nome, email: user.email, role: user.role },
      "demo_token"
    )
    toast({ type: "success", title: `Bem-vindo, ${user.nome.split(" ")[0]}!`, description: "Login realizado com sucesso." })
    router.push("/dashboard")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b]">

      {/* Fundo animado com gradientes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-[80px]" />
        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Borda gradiente */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/15 to-white/5 pointer-events-none" />

        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50">

          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div
              animate={{ rotateY: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-500/40"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Scissors weight="duotone" size={32} className="text-white" />
            </motion.div>
            <h1 className="text-xl font-bold text-white">BarberPro</h1>
            <p className="mt-1 text-sm text-white/50">Sistema de Gestão</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">E-mail</label>
              <div className="relative">
                <EnvelopeSimple
                  weight="duotone"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/8 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Senha</label>
              <div className="relative">
                <LockKey
                  weight="duotone"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showSenha ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
              >
                {erro}
              </motion.p>
            )}

            {/* Botão */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 disabled:opacity-70"
            >
              {loading ? (
                <SpinnerGap size={16} className="animate-spin" />
              ) : (
                <>Entrar <ArrowRight size={16} weight="bold" /></>
              )}
            </motion.button>
          </form>

          {/* Demo hints */}
          <div className="mt-6 rounded-xl border border-white/8 p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Acesso demo</p>
            <div className="space-y-1.5">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setSenha(u.senha) }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="text-xs text-white/60">{u.email}</span>
                  <span className="rounded-full border border-white/10 px-1.5 py-px text-[9px] font-medium uppercase text-white/40">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
