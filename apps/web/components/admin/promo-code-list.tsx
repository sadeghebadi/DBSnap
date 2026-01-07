"use client"

import { useState } from "react"
import { usePromoCodes } from "@/lib/hooks/use-promo-codes"
import { Tag, Plus, Trash2, Loader2, Calendar, Users } from "lucide-react"
import { format } from "date-fns"

export function PromoCodeList() {
    const { promoCodes, isLoading, deactivatePromoCode } = usePromoCodes()

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <table className="w-full text-sm font-medium">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Code</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Discount</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Usage</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Expires</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-right align-middle text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promoCodes.map((promo: any) => (
                            <tr key={promo.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle">
                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{promo.code}</span>
                                </td>
                                <td className="p-4 align-middle">
                                    {promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                                </td>
                                <td className="p-4 align-middle">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                        {promo.usageCount} / {promo.usageLimit || '∞'}
                                    </div>
                                </td>
                                <td className="p-4 align-middle">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        {promo.expiresAt ? format(new Date(promo.expiresAt), 'MMM d, yyyy') : 'Never'}
                                    </div>
                                </td>
                                <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {promo.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    {promo.isActive && (
                                        <button
                                            onClick={() => deactivatePromoCode(promo.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {promoCodes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="h-24 text-center">No promo codes found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
