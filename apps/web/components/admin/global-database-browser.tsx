"use client"

import { useState } from "react"
import { useGlobalDatabases } from "@/lib/hooks/use-analytics"
import { Search, ExternalLink, Loader2, EthernetPort, Save, Play } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function GlobalDatabaseBrowser() {
    const [search, setSearch] = useState("")
    const [type, setType] = useState("all")

    const { databases, isLoading } = useGlobalDatabases(search, type === "all" ? undefined : type)

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search by ID or name..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[180px]"
                >
                    <option value="all">All Types</option>
                    <option value="Postgres">PostgreSQL</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="MySQL">MySQL</option>
                </select>
            </div>

            <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Database Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner (Organization)</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Snapshots</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created At</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
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
                        ) : databases?.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                    No databases found.
                                </td>
                            </tr>
                        ) : (
                            databases?.map((db: any) => (
                                <DatabaseRow key={db.id} db={db} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function DatabaseRow({ db }: { db: any }) {
    const [testingConnection, setTestingConnection] = useState(false)
    const [triggeringBackup, setTriggeringBackup] = useState(false)

    const handleTestConnection = async () => {
        setTestingConnection(true)
        try {
            const res = await api.post(`/admin/support/databases/${db.id}/test-connection`)
            if (res.data.success) {
                toast.success(`Connection Successful (${res.data.version || 'Unknown Ver'})`, {
                    description: `Latency: ${res.data.latencyMs}ms`
                })
            } else {
                toast.error("Connection Failed", { description: res.data.message })
            }
        } catch (error: any) {
            toast.error("Test Failed", { description: error.response?.data?.message || error.message })
        } finally {
            setTestingConnection(false)
        }
    }

    const handleTriggerBackup = async () => {
        // Confirmation could be added here, but for admin support tools speed is often key.
        // Let's rely on button text or toast.
        setTriggeringBackup(true)
        try {
            await api.post(`/admin/support/databases/${db.id}/trigger-backup`)
            toast.success("Backup Triggered", { description: "The job has been queued." })
        } catch (error: any) {
            toast.error("Trigger Failed", { description: error.response?.data?.message || error.message })
        } finally {
            setTriggeringBackup(false)
        }
    }

    return (
        <tr className="hover:bg-muted/50 transition-colors">
            <td className="p-4 align-middle">
                <div className="flex flex-col">
                    <span className="font-medium">{db.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{db.id}</span>
                </div>
            </td>
            <td className="p-4 align-middle">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                    {db.type}
                </span>
            </td>
            <td className="p-4 align-middle">
                <div className="flex flex-col">
                    <span>{db.project.user.email}</span>
                    <span className="text-xs text-muted-foreground">{db.project.name}</span>
                </div>
            </td>
            <td className="p-4 align-middle">{db._count.backups}</td>
            <td className="p-4 align-middle text-xs">
                {new Date(db.createdAt).toLocaleDateString()}
            </td>
            <td className="p-4 align-middle text-right">
                <div className="flex justify-end items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                    >
                        {testingConnection ? <Loader2 className="h-3 w-3 animate-spin" /> : <EthernetPort className="h-3 w-3 mr-1" />}
                        Test
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleTriggerBackup}
                        disabled={triggeringBackup}
                    >
                        {triggeringBackup ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                        Backup
                    </Button>

                    <Link href={`/admin/organizations/${db.project.user.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">View Owner</span>
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </td>
        </tr>
    )
}
