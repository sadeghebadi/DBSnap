"use client"

import { useState } from "react"
import { useGlobalSnapshots } from "@/lib/hooks/use-analytics"
import { Search, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { bytesToSize } from "@/lib/utils"

export function GlobalSnapshotBrowser() {
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")

    const { snapshots, isLoading } = useGlobalSnapshots(search, status === "all" ? undefined : status)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "Failed": return <AlertCircle className="h-4 w-4 text-red-500" />
            case "InProgress": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            default: return <Clock className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search snapshot ID or DB name..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[180px]"
                >
                    <option value="all">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="InProgress">In Progress</option>
                </select>
            </div>

            <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Snapshot ID</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Database</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Organization</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Size</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Started At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                </td>
                            </tr>
                        ) : snapshots?.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                    No snapshots found.
                                </td>
                            </tr>
                        ) : (
                            snapshots?.map((snapshot: any) => (
                                <tr key={snapshot.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-4 align-middle font-mono text-xs">
                                        {snapshot.id}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span>{snapshot.database.name}</span>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground w-fit">
                                                {snapshot.database.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col text-xs">
                                            <span>{snapshot.database.project.user.email}</span>
                                            <span className="text-muted-foreground">{snapshot.database.project.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {bytesToSize(Number(snapshot.sizeBytes))}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(snapshot.status)}
                                            <span className="text-sm">{snapshot.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-xs text-muted-foreground font-mono">
                                        {new Date(snapshot.startedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
