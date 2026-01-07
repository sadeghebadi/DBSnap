"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Settings2, Save, Loader2 } from "lucide-react"

export function ConcurrencyControl({ queueName }: { queueName: string }) {
    const queryClient = useQueryClient()
    const [value, setValue] = useState<number | "">("")

    const { data: settings, isLoading } = useQuery({
        queryKey: ['queue-settings', queueName],
        queryFn: async () => {
            const res = await api.get(`/queues/${queueName}/settings`)
            setValue(res.data.concurrency)
            return res.data
        }
    })

    const mutation = useMutation({
        mutationFn: async (concurrency: number) => {
            await api.post(`/queues/${queueName}/concurrency`, { concurrency })
        },
        onSuccess: () => {
            alert(`Concurrency for ${queueName} updated`)
            queryClient.invalidateQueries({ queryKey: ['queue-settings', queueName] })
        }
    })

    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />

    return (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-auto">Concurrency</span>
            <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="w-12 h-6 text-center text-xs border rounded outline-none focus:ring-1 focus:ring-primary"
            />
            <button
                onClick={() => value !== "" && mutation.mutate(value)}
                disabled={mutation.isPending}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors disabled:opacity-50"
            >
                {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            </button>
        </div>
    )
}
