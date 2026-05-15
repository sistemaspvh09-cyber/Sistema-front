"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { useState } from "react"
import { Toaster } from "sonner"
import { ToastProvider } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ToastProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            expand
            toastOptions={{
              style: {
                borderRadius: "1rem",
                fontSize: "0.8125rem",
                fontFamily: "var(--font-geist-sans)",
              },
            }}
          />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
