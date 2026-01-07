"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Activity, RefreshCw, Server, Cpu, Layers, Loader2 } from "lucide-react"

export function WorkersList() {
    const queryClient = useQueryClient()
    const { data: workers, isLoading } = useQuery({
        queryKey: ['workers'],
        queryFn: async () => {
            const res = await api.get('/queues/workers')
            return res.data
        },
        refetchInterval: 10000 // Every 10s
    })

    const restartMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.post(`/queues/workers/${id}/restart`)
        },
        onSuccess: () => {
            alert('Restart signal sent')
            queryClient.invalidateQueries({ queryKey: ['workers'] })
        }
    })

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workers?.map((worker: any) => (
                <div key={worker.id} className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Server className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 truncate max-w-[150px]">{worker.id}</p>
                                <p className="text-xs text-muted-foreground">{worker.hostname}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => restartMutation.mutate(worker.id)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Restart Worker"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU Usage</span>
                                <span className="font-mono">{Math.round((worker.cpuUsage.user + worker.cpuUsage.system) / 1000000)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (worker.cpuUsage.user + worker.cpuUsage.system) / 5000000)}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> Memory</span>
                                <span className="font-mono">{Math.round(worker.memoryUsage.rss / 1024 / 1024)} MB</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (worker.memoryUsage.rss / (512 * 1024 * 1024)) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground border-t">
                        <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-green-500" />
                            {Math.round(worker.uptime / 60)}m uptime
                        </div>
                        <div>v{worker.version}</div>
                    </div>
                </div>
            ))}
            {workers?.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                    No active workers detected.
                </div>
            )}
        </div>
    )
}
