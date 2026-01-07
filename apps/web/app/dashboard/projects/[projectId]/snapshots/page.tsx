"use client"

import { use } from "react"
import { SnapshotList } from "@/components/snapshots/snapshot-list"
import { useSnapshots } from "@/lib/hooks/use-snapshots"
import { Loader2, RefreshCw } from "lucide-react"

interface SnapshotsPageProps {
    params: Promise<{ projectId: string }>
}

export default function SnapshotsPage({ params }: SnapshotsPageProps) {
    const { projectId } = use(params);
    // TODO: Add Trigger Backup Button (requires database selection context or generic trigger modal)

    return (
        <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Snapshots</h2>
                    <p className="text-muted-foreground">
                        View and manage your database snapshots.
                    </p>
                </div>
            </div>

            <SnapshotList projectId={projectId} />
        </div>
    )
}
