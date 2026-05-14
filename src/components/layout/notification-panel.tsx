"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, CalendarBlank, CurrencyDollar, Warning,
  Crown, X, CheckCircle, DotsThree
} from "@phosphor-icons/react"
import { useNotifStore, type NotificationType } from "@/store/notification-store"
import { cn } from "@/lib/utils"

const tipoConfig: Record<NotificationType, { icon: React.ElementType; bg: string; color: string }> = {
  agendamento: { icon: CalendarBlank,  bg: "bg-blue-500/10",    color: "text-blue-500"    },
  pagamento:   { icon: CurrencyDollar, bg: "bg-emerald-500/10", color: "text-emerald-500" },
  estoque:     { icon: Warning,        bg: "bg-amber-500/10",   color: "text-amber-500"   },
  fidelidade:  { icon: Crown,          bg: "bg-violet-500/10",  color: "text-violet-500"  },
  sistema:     { icon: CheckCircle,    bg: "bg-gray-500/10",    color: "text-gray-500"    },
}

function tempo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diff < 1)  return "agora"
  if (diff < 60) return `${diff}min`
  const h = Math.floor(diff / 60)
  if (h < 24)    return `${h}h`
  return `${Math.floor(h/24)}d`
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const { notificacoes, marcarLida, marcarTodasLidas, naoLidas } = useNotifStore()
  const count = naoLidas()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <Bell weight="duotone" size={16} />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[9px] font-black text-white ring-2 ring-[var(--card)]">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Bell weight="duotone" size={15} className="text-[var(--primary)]" />
                  <span className="text-sm font-semibold">Notificações</span>
                  {count > 0 && (
                    <span className="rounded-full bg-[var(--primary)] px-1.5 py-px text-[10px] font-bold text-white">{count}</span>
                  )}
                </div>
                <button
                  onClick={marcarTodasLidas}
                  className="text-[10px] font-medium text-[var(--primary)] hover:underline"
                >
                  Marcar tudo lido
                </button>
              </div>

              {/* Lista */}
              <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
                {notificacoes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-[var(--muted-foreground)]">
                    <Bell size={28} weight="duotone" />
                    <p className="text-xs">Nenhuma notificação</p>
                  </div>
                ) : (
                  notificacoes.map(n => {
                    const cfg = tipoConfig[n.tipo]
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors cursor-pointer",
                          !n.lida && "bg-[var(--primary)]/3"
                        )}
                        onClick={() => { marcarLida(n.id); setOpen(false) }}
                      >
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5", cfg.bg)}>
                          <cfg.icon weight="duotone" size={15} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={cn("text-xs font-semibold truncate", !n.lida && "text-[var(--foreground)]")}>{n.titulo}</p>
                            <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">{tempo(n.createdAt)}</span>
                          </div>
                          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{n.mensagem}</p>
                        </div>
                        {!n.lida && (
                          <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--primary)] mt-2" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--border)] px-4 py-2.5">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Ver todas
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
