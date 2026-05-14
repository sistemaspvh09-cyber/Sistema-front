"use client"

import { useState } from "react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import type { GraficoData } from "@/lib/types"

export function RevenueChartClient({ data }: { data: GraficoData[] }) {
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "90d">("7d")
  return <RevenueChart data={data} periodo={periodo} onPeriodoChange={setPeriodo} />
}
