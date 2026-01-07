"use client"

import { useOrgAnalytics } from "@/lib/hooks/use-org-analytics"
import { Loader2 } from "lucide-react"
import { bytesToSize } from "@/lib/utils"
import Link from "next/link"

export function OrgUsageTable() {
    const { usage, isLoading, error } = useOrgAnalytics()

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load usage statistics.</div>
    }

    return (
        <div className="rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        <th className="h-12 px-4 text-left align-middle text-muted-foreground">Organization (User)</th>
                        <th className="h-12 px-4 text-left align-middle text-muted-foreground text-center">Databases</th>
                        <th className="h-12 px-4 text-left align-middle text-muted-foreground text-center">Total Snapshots</th>
                        <th className="h-12 px-4 text-left align-middle text-muted-foreground text-right">Storage Used</th>
                    </tr>
                </thead>
                <tbody>
                    {usage.map((org) => (
                        <tr key={org.userId} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-medium">
                                <Link
                                    href={`/admin/organizations/${org.userId}`}
                                    className="hover:text-blue-600 hover:underline transition-all"
                                >
                                    {org.email}
                                </Link>
                            </td>
                            <td className="p-4 align-middle text-center">{org.databaseCount}</td>
                            <td className="p-4 align-middle text-center">{org.snapshotCount}</td>
                            <td className="p-4 align-middle text-right">{bytesToSize(Number(org.storageBytes))}</td>
                        </tr>
                    ))}
                    {usage.length === 0 && (
                        <tr>
                            <td colSpan={4} className="h-24 text-center">No organization data found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
