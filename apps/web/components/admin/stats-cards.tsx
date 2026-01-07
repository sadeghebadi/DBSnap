"use client"

import { useAnalytics } from "@/lib/hooks/use-analytics"
import { Users, Database, Server, HardDrive, Loader2 } from "lucide-react"
import { bytesToSize } from "@/lib/utils"

export function StatsCards() {
    const { overview, isLoading, error } = useAnalytics()

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Loader2 className="animate-spin" /></div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load analytics.</div>
    }

    if (!overview) return null

    const cards = [
        {
            title: "Total Users",
            value: overview.totalUsers,
            icon: Users,
            description: "+10% from last month (mock)"
        },
        {
            title: "Projects",
            value: overview.totalProjects,
            icon: Server,
            description: "Active projects"
        },
        {
            title: "Databases",
            value: overview.totalDatabases,
            icon: Database,
            description: "Managed databases"
        },
        {
            title: "Storage Used",
            value: bytesToSize(Number(overview.totalStorageBytes)),
            icon: HardDrive,
            description: "Total S3 usage"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <div key={index} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{card.title}</h3>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-0">
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground pt-1">{card.description}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
