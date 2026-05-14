import { Crown, Medal, Star, Diamond } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import type { TierConfig, VipTier } from "@/lib/vip"

const icons: Record<VipTier, React.ElementType> = {
  bronze:   Medal,
  silver:   Star,
  gold:     Crown,
  platinum: Diamond,
}

interface TierBadgeProps {
  tier: TierConfig
  size?: "xs" | "sm" | "md"
  showLabel?: boolean
  className?: string
}

export function TierBadge({ tier, size = "sm", showLabel = true, className }: TierBadgeProps) {
  const Icon = icons[tier.tier]
  const sizes = { xs: "text-[9px] px-1.5 py-px gap-0.5", sm: "text-xs px-2 py-0.5 gap-1", md: "text-sm px-2.5 py-1 gap-1.5" }
  const iconSizes = { xs: 9, sm: 11, md: 14 }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        `bg-gradient-to-r ${tier.corGradient} text-white`,
        tier.corBorda,
        sizes[size],
        "shadow-sm",
        className
      )}
    >
      <Icon weight="fill" size={iconSizes[size]} />
      {showLabel && tier.label}
    </span>
  )
}
