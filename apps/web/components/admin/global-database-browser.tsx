"use client"

import { useState } from "react"
import { useGlobalDatabases } from "@/lib/hooks/use-analytics"
import { Search, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"

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
                                <tr key={db.id} className="hover:bg-muted/50 transition-colors">
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
                                        <Link href={`/admin/organizations/${db.project.user.id}`}>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground hover:bg-secondary cursor-pointer">
                                                <ExternalLink className="mr-1 h-3 w-3" />
                                                View Owner
                                            </span>
                                        </Link>
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
