"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentProfile } from "@/lib/supabase-auth"
import { useAuthStore } from "@/store/auth-store"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useAuthStore()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const profile = await getCurrentProfile()
      if (!active) return

      if (!profile) {
        logout()
        router.replace("/login")
        return
      }

      setUser(profile)
      setChecking(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [logout, router, setUser])

  if (checking) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--background)] text-sm text-[var(--muted-foreground)]">
        Carregando sessão...
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">{children}</main>
    </div>
  )
}
