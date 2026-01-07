"use client"

import { useBilling } from "@/lib/hooks/use-billing"
import { PlanCards } from "@/components/billing/plan-cards"
import { Loader2, AlertTriangle } from "lucide-react"

export default function BillingPage() {
    const { status, isLoading, error, upgrade, isUpgrading } = useBilling()

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load billing status.</div>
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
                <p className="text-muted-foreground mt-2">Manage your plan and monitor resource usage.</p>
            </div>

            {status?.isOverLimit && (
                <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 border border-yellow-200 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="text-sm font-medium">
                        You have reached the limits of your current plan. Some actions may be restricted until you upgrade.
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4">Project Usage</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Projects Created</span>
                            <span className="font-medium">{status?.usage.projects} / {status?.limits.projects}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-primary transition-all duration-500 ${(status?.usage.projects ?? 0) >= (status?.limits.projects ?? 1) ? 'bg-red-500' : ''
                                    }`}
                                style={{ width: `${Math.min(100, ((status?.usage.projects ?? 0) / (status?.limits.projects ?? 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4">Database Usage</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Connected Databases</span>
                            <span className="font-medium">{status?.usage.databases} / {status?.limits.databases}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-primary transition-all duration-500 ${(status?.usage.databases ?? 0) >= (status?.limits.databases ?? 1) ? 'bg-red-500' : ''
                                    }`}
                                style={{ width: `${Math.min(100, ((status?.usage.databases ?? 0) / (status?.limits.databases ?? 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Select a Plan</h2>
                <PlanCards
                    currentPlan={status?.plan}
                    onUpgrade={upgrade}
                    isUpgrading={isUpgrading}
                />
            </div>
        </div>
    )
}
