"use client"

import { PromoCodeList } from "@/components/admin/promo-code-list"
import { CreatePromoCodeForm } from "@/components/admin/create-promo-code-form"

export default function PromoCodesPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-lg font-semibold md:text-2xl">Promo Code Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <PromoCodeList />
                </div>
                <div>
                    <CreatePromoCodeForm />
                </div>
            </div>
        </div>
    )
}
