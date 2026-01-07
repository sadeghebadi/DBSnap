"use client"

import { useState } from "react"
import { GlobalDatabaseBrowser } from "@/components/admin/global-database-browser"
import { GlobalSnapshotBrowser } from "@/components/admin/global-snapshot-browser"
import { Database, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminBrowserPage() {
    const [activeTab, setActiveTab] = useState<"databases" | "snapshots">("databases")

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Resource Browser</h1>
                <p className="text-muted-foreground">
                    Search and browse all databases and snapshots across the entire platform.
                </p>
            </div>

            <div className="w-full">
                <div className="flex bg-muted/50 p-1 rounded-lg max-w-fit gap-1">
                    <button
                        onClick={() => setActiveTab("databases")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            activeTab === "databases"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Database className="h-4 w-4" />
                        Databases
                    </button>
                    <button
                        onClick={() => setActiveTab("snapshots")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            activeTab === "snapshots"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Camera className="h-4 w-4" />
                        Snapshots
                    </button>
                </div>

                <div className="mt-6">
                    {activeTab === "databases" ? (
                        <GlobalDatabaseBrowser />
                    ) : (
                        <GlobalSnapshotBrowser />
                    )}
                </div>
            </div>
        </div>
    )
}
