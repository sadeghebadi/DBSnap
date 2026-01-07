"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import {
    ChevronLeft,
    Database,
    Box,
    History,
    Calendar,
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    HardDrive,
    Server,
    ExternalLink,
    Loader2,
    Settings2
} from "lucide-react"
import { cn, bytesToSize } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { use } from "react"
import { QuotaManagementForm } from "@/components/admin/quota-management-form"

export default function OrgDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params)
    const router = useRouter()

    const { data: org, isLoading, error } = useQuery({
        queryKey: ['org-details', userId],
        queryFn: async () => {
            const res = await api.get(`/analytics/organizations/${userId}`)
            return res.data
        }
    })

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
    if (error || !org) return <div className="p-12 text-center text-red-500">Failed to load organization details.</div>

    const totalBackups = org.projects.reduce((acc: number, p: any) => acc + p.databaseCount, 0);

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Organizations
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{org.email}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                <Shield className="h-3.5 w-3.5" />
                                {org.plan} Plan
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Member since {format(new Date(org.createdAt), 'MMM yyyy')}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>ID: {org.id}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <Box className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Projects</p>
                            <p className="text-2xl font-bold">{org.projects.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <Database className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">DB Connections</p>
                            <p className="text-2xl font-bold">{totalBackups}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <HardDrive className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Global Usage</p>
                            <p className="text-2xl font-bold">--</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Projects & Databases */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Server className="h-5 w-5 text-slate-400" />
                            Infrastructure
                        </h2>
                        <div className="grid gap-4">
                            {org.projects.map((project: any) => (
                                <div key={project.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{project.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{project.environment} Environment</p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-white border rounded-lg">
                                            {project.databases.length} DBs
                                        </span>
                                    </div>
                                    <div className="divide-y">
                                        {project.databases.map((db: any) => (
                                            <div key={db.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg">
                                                        <Database className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{db.name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{db.type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        {db.snapshotCount} snapshots
                                                    </div>
                                                    {db.latestSnapshot && (
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                                            Last: {format(new Date(db.latestSnapshot.startedAt), 'MMM d, HH:mm')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {project.databases.length === 0 && (
                                            <div className="p-6 text-center text-sm text-muted-foreground italic">
                                                No database connections configured.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {org.projects.length === 0 && (
                                <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
                                    <Box className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p>No projects found for this organization.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                            <Settings2 className="h-5 w-5 text-slate-400" />
                            Account Settings
                        </h2>
                        <QuotaManagementForm userId={org.id} />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-400" />
                        Recent Snapshot Activity
                    </h2>
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {org.recentActivity.map((activity: any) => (
                                <div key={activity.id} className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            {activity.status === 'Completed' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : activity.status === 'InProgress' ? (
                                                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Backup for {activity.databaseName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                In project <span className="text-slate-900 font-medium">{activity.projectName}</span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                                    ID: {activity.id.slice(0, 8)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(activity.startedAt), 'MMM d, HH:mm:ss')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900">{bytesToSize(Number(activity.sizeBytes))}</p>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase mt-1",
                                            activity.status === 'Completed' ? 'text-emerald-600' : 'text-red-600'
                                        )}>
                                            {activity.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {org.recentActivity.length === 0 && (
                                <div className="p-12 text-center text-sm text-slate-400">
                                    No snapshots have been recorded yet.
                                </div>
                            )}
                        </div>
                        {org.recentActivity.length > 0 && (
                            <div className="p-4 bg-slate-50 border-t items-center justify-center flex">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    Showing last 10 snapshots
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
