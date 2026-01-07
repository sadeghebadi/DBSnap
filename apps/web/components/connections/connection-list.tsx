"use client"

import { Connection, useConnections } from "@/lib/hooks/use-connections"
import { Loader2, Trash2, Database, MoreVertical, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ConnectionListProps {
    projectId: string
}

export function ConnectionList({ projectId }: ConnectionListProps) {
    const { connections, isLoading, deleteConnection } = useConnections(projectId)

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    if (!connections || connections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <Database className="h-10 w-10 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold">No connections yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Connect a database to start taking snapshots. You can connect PostgreSQL, MongoDB, or MySQL.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((conn) => (
                <div key={conn.id} className="relative flex flex-col justify-between rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Database className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold tracking-tight">{conn.name}</h4>
                                    <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-secondary">
                                        {conn.type}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this connection? Data will be retained but connection lost.')) {
                                        deleteConnection.mutate(conn.id)
                                    }
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                disabled={deleteConnection.isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                            {/* Mock Status for now */}
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Online</span>
                        </div>
                    </div>
                    <div className="border-t bg-muted/50 p-3 px-6 text-xs text-muted-foreground flex justify-between">
                        <span>Added {formatDistanceToNow(new Date(conn.createdAt))} ago</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
