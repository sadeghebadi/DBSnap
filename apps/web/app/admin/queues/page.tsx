"use client"

import { useHealthStats } from "@/lib/hooks/use-health-stats"
import { Loader2, Activity, CheckCircle, XCircle, Clock } from "lucide-react"

export default function QueuesPage() {
    const { stats, isLoading, error } = useHealthStats()

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load system health stats.</div>
    }

    const { backup, restore, diff } = stats!.queues

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl">Queues & Workers</h1>
                <p className="text-muted-foreground">Monitor real-time job processing across the system.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <QueueCard name="Backup Queue" stats={backup} />
                <QueueCard name="Restore Queue" stats={restore} />
                <QueueCard name="Diff Queue" stats={diff} />
            </div>

            <div className="rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">API: {stats?.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Workers: Online</span>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                        Last checked: {new Date(stats!.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Active Workers</h3>
                <WorkersList />
            </div>
        </div>
    )
}
import { WorkersList } from "./workers-list"


function QueueCard({ name, stats }: { name: string, stats: any }) {
    return (
        <div className="rounded-xl border p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{name}</h3>

            <div className="grid grid-cols-2 gap-4">
                <StatItem icon={<Activity className="h-4 w-4 text-blue-500" />} label="Active" value={stats.active} />
                <StatItem icon={<Clock className="h-4 w-4 text-yellow-500" />} label="Waiting" value={stats.waiting} />
                <StatItem icon={<XCircle className="h-4 w-4 text-red-500" />} label="Failed" value={stats.failed} />
                <StatItem icon={<CheckCircle className="h-4 w-4 text-green-500" />} label="Completed" value={stats.completed} />
            </div>

            <ConcurrencyControl queueName={name.toLowerCase().split(' ')[0]} />
        </div>
    )
}
import { ConcurrencyControl } from "@/components/admin/concurrency-control"


function StatItem({ icon, label, value }: { icon: any, label: string, value: number }) {
    return (
        <div className="flex items-center gap-2">
            {icon}
            <div className="flex flex-col">
                <span className="text-2xl font-bold leading-none">{value}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
            </div>
        </div>
    )
}
