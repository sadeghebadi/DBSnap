"use client"

import { useState } from "react"
import { useAuditLogs } from "@/lib/hooks/use-audit-logs"
import { Loader2, Search } from "lucide-react"
import { format } from "date-fns"

export function AuditLogTable() {
    const [page, setPage] = useState(1)
    const { logs, meta, isLoading, error } = useAuditLogs(page)

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load audit logs.</div>
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <table className="w-full text-sm font-medium">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground w-[180px]">Timestamp</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">User</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Action</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Resource</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Metadata</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle whitespace-nowrap text-muted-foreground">
                                    {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                </td>
                                <td className="p-4 align-middle">{log.user?.email || 'System'}</td>
                                <td className="p-4 align-middle">
                                    <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 align-middle">
                                    {log.resourceType && (
                                        <div className="text-xs">
                                            <span className="text-muted-foreground">{log.resourceType}:</span> {log.resourceId}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-middle">
                                    <div className="max-w-[300px] truncate text-xs text-muted-foreground" title={JSON.stringify(log.metadata)}>
                                        {JSON.stringify(log.metadata)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="h-24 text-center">No logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <button
                    className="h-9 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent disabled:opacity-50"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-sm text-muted-foreground">
                    Page {page} of {meta ? Math.ceil(meta.total / meta.limit) : 1}
                </span>
                <button
                    className="h-9 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent disabled:opacity-50"
                    onClick={() => setPage(p => p + 1)}
                    disabled={meta ? page >= Math.ceil(meta.total / meta.limit) : true}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
