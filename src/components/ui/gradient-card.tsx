"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendUp, TrendDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export interface GradientCardProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  icon: React.ElementType
  gradient: string          // Tailwind gradient classes
  glowClass?: string        // .glow-* class
  sparkline?: number[]
  delay?: number
  onClick?: () => void
  className?: string
}

function Sparkline({ data, light = false }: { data: number[]; light?: boolean }) {
  if (data.length < 2) return null
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const w = 64, h = 28
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) + 2}`
  ).join(" ")

  return (
    <svg width={w} height={h} className={light ? "opacity-50" : "opacity-70"}>
      <defs>
        <linearGradient id={`sg-${data.length}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  )
}

/* Decorative dot-grid pattern */
function DotPattern({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 w-full h-full opacity-[0.07]", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

export function GradientCard({
  title, value, subtitle, change, icon: Icon,
  gradient, glowClass = "", sparkline, delay = 0,
  onClick, className,
}: GradientCardProps) {
  const isPos = (change ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        `stat-card bg-gradient-to-br ${gradient} ${glowClass} cursor-default`,
        onClick && "cursor-pointer",
        className
      )}
    >
      <DotPattern />

      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      <div className="pointer-events-none absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-black/10 blur-lg" />

      <div className="relative p-5">
        {/* Linha superior: ícone + sparkline */}
        <div className="flex items-start justify-between mb-4">
          {/* Ícone com glassmorphism */}
          <motion.div
            whileHover={{ rotateY: 15, rotateX: -8, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-icon flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Icon weight="duotone" size={24} className="text-white drop-shadow-sm" />
          </motion.div>

          {sparkline && <Sparkline data={sparkline} />}
        </div>

        {/* Valor */}
        <p className="text-2xl font-black tracking-tight text-white leading-none">
          {value}
        </p>
        <p className="mt-1 text-sm font-medium text-white/75">{title}</p>

        {/* Rodapé */}
        {(change !== undefined || subtitle) && (
          <div className="mt-3 flex items-center gap-1.5">
            {change !== undefined && (
              <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isPos ? "bg-white/20 text-white" : "bg-black/20 text-white/80"
              }`}>
                {isPos ? <TrendUp weight="bold" size={10} /> : <TrendDown weight="bold" size={10} />}
                {Math.abs(change)}%
              </div>
            )}
            {subtitle && (
              <span className="text-[10px] font-medium text-white/60">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
