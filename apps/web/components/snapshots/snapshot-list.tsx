"use client"

import { Backup, useSnapshots } from "@/lib/hooks/use-snapshots"
import { Loader2, Database, Download, RotateCcw, FileDiff } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { bytesToSize } from "@/lib/utils" // Note: Need to implement bytesToSize in utils

interface SnapshotListProps {
    projectId: string
}

export function SnapshotList({ projectId }: SnapshotListProps) {
    const { snapshots, isLoading, restoreBackup } = useSnapshots(projectId)

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    if (!snapshots || snapshots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <Database className="h-10 w-10 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold">No snapshots yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Snapshots will appear here once you trigger a backup or a scheduled backup runs.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Database</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Size</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {snapshots.map((snap) => (
                            <tr key={snap.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{snap.database.name}</td>
                                <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${snap.status === 'Completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                            snap.status === 'Failed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                        }`}>
                                        {snap.status}
                                    </span>
                                </td>
                                <td className="p-4 align-middle">{bytesToSize(Number(snap.sizeBytes))}</td>
                                <td className="p-4 align-middle">
                                    <div className="flex flex-col">
                                        <span>{format(new Date(snap.startedAt), 'PP p')}</span>
                                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(snap.startedAt))} ago</span>
                                    </div>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                            title="Restore"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to restore this snapshot? This will overwrite the current database state.")) {
                                                    restoreBackup.mutate(snap.id);
                                                }
                                            }}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        {/* Placeholder for Diff */}
                                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8" title="Diff">
                                            <FileDiff className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
