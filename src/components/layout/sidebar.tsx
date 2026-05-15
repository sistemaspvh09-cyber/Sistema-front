"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  SquaresFour, ShoppingCart, CalendarBlank, Users, CurrencyDollar,
  Scissors, Package, ChartBar, Gear, SignOut, CaretRight,
  Lightning, UserCircle, CalendarCheck, List, X,
  CaretDoubleLeft, CaretDoubleRight, Star, Buildings,
  CashRegister, Globe, QrCode, Money, StarHalf, Cake
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/client"
import { useAuthStore, type UserRole } from "@/store/auth-store"
import { useUIStore } from "@/store/ui-store"
import { Avatar } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  roles?: UserRole[]
}

const nav: NavItem[] = [
  { label: "Dashboard",      href: "/dashboard",      icon: SquaresFour                            },
  { label: "PDV",            href: "/pdv",             icon: ShoppingCart, badge: "novo"           },
  { label: "Caixa",          href: "/caixa",           icon: CashRegister, roles: ["caixa","admin"] },
  { label: "Agendamentos",   href: "/agendamentos",    icon: CalendarBlank                          },
  { label: "Clientes",       href: "/clientes",        icon: Users                                  },
  { label: "Barbeiros",      href: "/barbeiros",       icon: Scissors,     roles: ["admin"]         },
  { label: "Serviços",       href: "/servicos",        icon: Lightning                              },
  { label: "Produtos",       href: "/produtos",        icon: Package                                },
  { label: "Fidelidade",     href: "/fidelidade",      icon: Star                                   },
  { label: "Avaliações",     href: "/avaliacoes",      icon: StarHalf                               },
  { label: "Aniversariantes",href: "/aniversariantes", icon: Cake,         badge: "3"              },
  { label: "Financeiro",     href: "/financeiro",      icon: CurrencyDollar, roles: ["admin","caixa"] },
  { label: "Relatórios",     href: "/relatorios",      icon: ChartBar,     roles: ["admin"]         },
  { label: "Comissões",      href: "/comissoes",       icon: Money,        roles: ["admin"]         },
  { label: "Unidades",       href: "/unidades",        icon: Buildings,    roles: ["admin"]         },
  { label: "QR Code",        href: "/qrcode",          icon: QrCode,       roles: ["admin"]         },
  { label: "Configurações",  href: "/configuracoes",   icon: Gear,         roles: ["admin"]         },
]
const userNav: NavItem[] = [
  { label: "Minha Agenda",   href: "/minha-agenda",   icon: CalendarCheck, roles: ["barbeiro"] },
  { label: "Link Agendamento",href: "/agendar",        icon: Globe,         roles: ["admin"]   },
  { label: "Meu Perfil",    href: "/perfil",         icon: UserCircle                        },
]

/* ── Tooltip para modo colapsado ─────────────────────────────────── */
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 rounded-lg border border-[var(--border)] bg-[var(--popover)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] shadow-lg whitespace-nowrap"
          >
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--border)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── NavLink ─────────────────────────────────────────────────────── */
function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        collapsed ? "justify-center px-2.5" : "",
        active
          ? "bg-[var(--primary)] text-white shadow-md shadow-orange-500/30"
          : "text-[var(--sidebar-muted-fg)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-fg)]"
      )}
    >
      <motion.span
        whileHover={{ rotateY: active ? 0 : 10, scale: 1.06 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d", display: "flex", flexShrink: 0 }}
      >
        <item.icon weight={active ? "fill" : "duotone"} size={18} />
      </motion.span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && !active && (
            <span className="rounded-full bg-[var(--primary)] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">
              {item.badge}
            </span>
          )}
          {active && <CaretRight weight="bold" size={11} className="opacity-70" />}
        </>
      )}
    </Link>
  )

  if (collapsed) return <Tip label={item.label}>{link}</Tip>
  return link
}

/* ── Conteúdo interno ────────────────────────────────────────────── */
function SidebarContent({ onClose, forceExpanded }: { onClose?: () => void; forceExpanded?: boolean }) {
  const pathname  = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const role = user?.role ?? "admin"
  const collapsed = forceExpanded ? false : sidebarCollapsed

  const visibleNav     = nav.filter(i => !i.roles || i.roles.includes(role))
  const visibleUserNav = userNav.filter(i => !i.roles || i.roles.includes(role))

  async function handleLogout() {
    await createClient().auth.signOut()
    logout()
    router.replace("/login")
  }

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--sidebar-bg)" }}>

      {/* Logo */}
      <div
        className={cn("flex h-16 items-center border-b shrink-0 transition-all duration-300", collapsed ? "px-3 justify-center" : "px-5 justify-between")}
        style={{ borderColor: "var(--sidebar-muted)" }}
      >
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <motion.div
            whileHover={{ rotateY: 15, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Scissors weight="duotone" size={17} className="text-white" />
          </motion.div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: "var(--sidebar-fg)" }}>BarberPro</p>
              <p className="text-[10px] mt-0.5 capitalize" style={{ color: "var(--sidebar-muted-fg)" }}>{role}</p>
            </div>
          )}
        </div>

        {/* Botão fechar (mobile) ou colapsar (desktop) */}
        {onClose ? (
          <button onClick={onClose} className="p-1 text-[var(--sidebar-muted-fg)] hover:text-white transition-colors">
            <X size={16} />
          </button>
        ) : !collapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[var(--sidebar-muted-fg)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-fg)] transition-colors"
            title="Recolher menu"
          >
            <CaretDoubleLeft size={14} />
          </button>
        )}
      </div>

      {/* Toggle expand (colapsado) */}
      {collapsed && !onClose && (
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center py-2 text-[var(--sidebar-muted-fg)] hover:text-[var(--sidebar-fg)] transition-colors"
          title="Expandir menu"
        >
          <CaretDoubleRight size={14} />
        </button>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto py-3 space-y-0.5 transition-all duration-300", collapsed ? "px-2" : "px-3")}>
        {visibleNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))}
            collapsed={collapsed}
          />
        ))}

        <div className="my-2 mx-1 h-px" style={{ background: "var(--sidebar-muted)" }} />

        {!collapsed && (
          <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--sidebar-muted-fg)" }}>
            Conta
          </p>
        )}

        {visibleUserNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="mx-3 h-px" style={{ background: "var(--sidebar-muted)" }} />

      {/* User */}
      <div className={cn("p-3", collapsed && "px-2")}>
        {collapsed ? (
          <Tip label={`Sair — ${user?.nome ?? "Usuário"}`}>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl p-2.5 transition-all hover:bg-red-500/20 hover:text-red-400"
              style={{ color: "var(--sidebar-muted-fg)" }}
            >
              <SignOut weight="duotone" size={18} />
            </button>
          </Tip>
        ) : (
          <div
            className="flex items-center gap-2.5 rounded-xl p-2.5"
            style={{ background: "var(--sidebar-hover)" }}
          >
            <Avatar name={user?.nome ?? "Usuário"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold" style={{ color: "var(--sidebar-fg)" }}>
                {user?.nome ?? "Usuário"}
              </p>
              <p className="truncate text-[10px] capitalize" style={{ color: "var(--sidebar-muted-fg)" }}>
                {user?.role ?? "admin"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 transition-all hover:bg-red-500/20 hover:text-red-400 hover:scale-110"
              style={{ color: "var(--sidebar-muted-fg)" }}
            >
              <SignOut weight="duotone" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Desktop sidebar ─────────────────────────────────────────────── */
export function Sidebar() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="hidden lg:flex shrink-0 flex-col h-screen overflow-hidden"
    >
      <SidebarContent />
    </motion.aside>
  )
}

/* ── Mobile sidebar (hamburger + drawer) ────────────────────────── */
export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
      >
        <List weight="bold" size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden shadow-2xl"
            >
              <SidebarContent onClose={() => setOpen(false)} forceExpanded />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
