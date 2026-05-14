import * as React from "react"
import { cn } from "@/lib/utils"

const COLORS = [
  "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
]

function getColor(name: string) {
  let n = 0
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i)
  return COLORS[n % COLORS.length]
}

interface AvatarProps {
  name: string
  src?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizes = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-11 w-11 text-base", xl: "h-14 w-14 text-lg" }

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div className={cn("relative shrink-0 rounded-full overflow-hidden flex items-center justify-center font-semibold text-white select-none", sizes[size], !src && getColor(name), className)}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
