"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Scissors, HouseSimple, ArrowLeft } from "@phosphor-icons/react"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        {/* Ícone 3D animado */}
        <motion.div
          animate={{ rotateY: [0, 15, -15, 0], rotateZ: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl shadow-orange-500/30"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Scissors weight="duotone" size={48} className="text-white" />
        </motion.div>

        {/* Número 404 */}
        <div className="mb-4 text-[9rem] font-black leading-none tracking-tighter">
          <span className="bg-gradient-to-br from-[var(--foreground)] to-[var(--muted-foreground)] bg-clip-text text-transparent">
            404
          </span>
        </div>

        <h2 className="mb-3 text-2xl font-bold">Página não encontrada</h2>
        <p className="mb-8 max-w-xs text-sm text-[var(--muted-foreground)]">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-0.5"
          >
            <HouseSimple weight="duotone" size={16} />
            Ir ao Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--muted)] transition-all"
          >
            <ArrowLeft size={16} weight="bold" />
            Voltar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
