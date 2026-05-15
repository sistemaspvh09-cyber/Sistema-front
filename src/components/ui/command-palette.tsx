"use client"

import { useState, useEffect } from "react"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlass, SquaresFour, ShoppingCart, CalendarBlank,
  Users, Scissors, Package, CurrencyDollar, Gear, X,
  ChartBar, Star, Buildings, QrCode, Lightning, Money
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"

const items = [
  { group:"Páginas", label:"Dashboard",    href:"/dashboard",    icon:SquaresFour   },
  { group:"Páginas", label:"PDV",           href:"/pdv",           icon:ShoppingCart  },
  { group:"Páginas", label:"Agendamentos",  href:"/agendamentos",  icon:CalendarBlank },
  { group:"Páginas", label:"Clientes",      href:"/clientes",      icon:Users         },
  { group:"Páginas", label:"Barbeiros",     href:"/barbeiros",     icon:Scissors      },
  { group:"Páginas", label:"Serviços",      href:"/servicos",      icon:Lightning     },
  { group:"Páginas", label:"Produtos",      href:"/produtos",      icon:Package       },
  { group:"Páginas", label:"Fidelidade",    href:"/fidelidade",    icon:Star          },
  { group:"Financeiro", label:"Financeiro", href:"/financeiro",    icon:CurrencyDollar},
  { group:"Financeiro", label:"Comissões",  href:"/comissoes",     icon:Money         },
  { group:"Gestão",  label:"Relatórios",   href:"/relatorios",    icon:ChartBar      },
  { group:"Gestão",  label:"Unidades",     href:"/unidades",      icon:Buildings     },
  { group:"Gestão",  label:"QR Code",      href:"/qrcode",        icon:QrCode        },
  { group:"Gestão",  label:"Configurações", href:"/configuracoes", icon:Gear          },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        const tag = (e.target as HTMLElement).tagName
        if (tag === "INPUT" || tag === "TEXTAREA") return
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  function go(href: string) {
    router.push(href)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger no header */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 px-3 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
      >
        <MagnifyingGlass weight="duotone" size={14} />
        <span className="hidden sm:block">Buscar...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--card)] px-1 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
            >
              <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--muted-foreground)]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                  <MagnifyingGlass weight="duotone" size={16} className="text-[var(--muted-foreground)] shrink-0" />
                  <Command.Input
                    autoFocus
                    placeholder="Buscar página, ação..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                  <button onClick={() => setOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    <X size={14} weight="bold" />
                  </button>
                </div>

                <Command.List className="max-h-80 overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                    Nenhum resultado encontrado
                  </Command.Empty>

                  {Array.from(new Set(items.map(i => i.group))).map(group => (
                    <Command.Group key={group} heading={group}>
                      {items.filter(i => i.group === group).map(item => (
                        <Command.Item
                          key={item.href}
                          onSelect={() => go(item.href)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer data-[selected=true]:bg-[var(--primary)] data-[selected=true]:text-white transition-colors hover:bg-[var(--muted)] aria-selected:bg-[var(--primary)] aria-selected:text-white"
                        >
                          <item.icon weight="duotone" size={16} className="shrink-0" />
                          {item.label}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                <div className="border-t border-[var(--border)] px-4 py-2 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--border)] px-1 py-0.5 font-medium">↑↓</kbd>navegar</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--border)] px-1 py-0.5 font-medium">↵</kbd>abrir</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--border)] px-1 py-0.5 font-medium">Esc</kbd>fechar</span>
                </div>
              </Command>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
