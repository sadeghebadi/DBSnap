"use client"

import { useState } from "react"
import { usePromoCodes } from "@/lib/hooks/use-promo-codes"
import { Tag, Save, Loader2 } from "lucide-react"

export function CreatePromoCodeForm() {
    const { createPromoCode, isCreating } = usePromoCodes()
    const [formData, setFormData] = useState({
        code: "",
        discountType: "PERCENT",
        discountValue: "",
        expiresAt: "",
        usageLimit: "",
        eligiblePlans: ["FREE", "PRO", "TEAM"]
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createPromoCode({
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
            })
            setFormData({
                code: "",
                discountType: "PERCENT",
                discountValue: "",
                expiresAt: "",
                usageLimit: "",
                eligiblePlans: ["FREE", "PRO", "TEAM"]
            })
        } catch (e) {
            alert('Failed to create promo code')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Create New Promo Code
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Code Name</label>
                    <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="e.g. WELCOME10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Discount Type</label>
                    <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="PERCENT">Percentage (%)</option>
                        <option value="AMOUNT">Fixed Amount ($)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Discount Value</label>
                    <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="e.g. 10.00"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Usage Limit</label>
                    <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Unlimited if empty"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Expiration Date</label>
                    <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Create Promo Code
            </button>
        </form>
    )
}
