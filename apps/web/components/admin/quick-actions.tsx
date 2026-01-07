"use client"

import { useState } from "react"
import { Plus, UserPlus, Megaphone, AlertTriangle } from "lucide-react"
import { CreateOrgModal } from "./create-org-modal"

export function QuickActions() {
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false)

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CreateOrgModal isOpen={isOrgModalOpen} onClose={() => setIsOrgModalOpen(false)} />

            <button
                onClick={() => setIsOrgModalOpen(true)}
                className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm hover:bg-accent transition-colors text-left"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <div className="font-semibold">New Organization</div>
                    <div className="text-xs text-muted-foreground">Onboard new client</div>
                </div>
            </button>

            <button className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <div className="font-semibold">Invite User</div>
                    <div className="text-xs text-muted-foreground">Send email invitation</div>
                </div>
            </button>

            <button className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <div className="font-semibold">System Notice</div>
                    <div className="text-xs text-muted-foreground">Broadcast message</div>
                </div>
            </button>

            <button className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm hover:bg-accent transition-colors text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                    <div className="font-semibold">Maintenance</div>
                    <div className="text-xs text-muted-foreground">Toggle maintenance mode</div>
                </div>
            </button>
        </div>
    )
}
