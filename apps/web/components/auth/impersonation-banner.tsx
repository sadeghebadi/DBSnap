"use client"

import { useState, useEffect } from "react"
import { AlertCircle, LogOut } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

export function ImpersonationBanner() {
    const [impersonating, setImpersonating] = useState(false)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.impersonatorId) {
                    setImpersonating(true)
                    setUserEmail(payload.email)
                } else {
                    setImpersonating(false)
                }
            } catch (e) {
                setImpersonating(false)
            }
        }
    }, [])

    const stopImpersonating = async () => {
        try {
            await api.post('/auth/admin/impersonate/stop')
        } catch (e) {
            // Non-blocking
        }
        const adminToken = localStorage.getItem('admin_token')
        if (adminToken) {
            localStorage.setItem('token', adminToken)
            localStorage.removeItem('admin_token')
            setImpersonating(false)
            router.push('/admin/users')
            router.refresh()
        }
    }

    if (!impersonating) return null

    return (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-lg z-[100] sticky top-0">
            <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-5 w-5" />
                <span>Impersonating: <span className="font-bold">{userEmail}</span></span>
            </div>
            <button
                onClick={stopImpersonating}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-sm font-semibold transition-colors"
            >
                <LogOut className="h-4 w-4" />
                Return to Admin
            </button>
        </div>
    )
}
