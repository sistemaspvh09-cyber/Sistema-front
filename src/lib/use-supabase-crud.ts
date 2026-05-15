"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/client"

type Payload = Record<string, unknown>

export function useUpsertRow(table: string, queryKey: readonly unknown[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(table)
        .upsert(payload)
        .select()
        .single()

      if (error) throw error
      return data as Payload
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useUpdateRow(table: string, queryKey: readonly unknown[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Payload }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as Payload
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
