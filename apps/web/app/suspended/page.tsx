"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

export default function SuspendedPage() {
    const router = useRouter()
    const [suspensionReason, setSuspensionReason] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            try {
                const decoded: any = jwtDecode(token)
                if (decoded.suspensionReason) {
                    setSuspensionReason(decoded.suspensionReason)
                }
            } catch (e) {
                console.error("Failed to decode token", e)
            }
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        router.push("/login")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                <div className="flex justify-center">
                    <div className="bg-red-100 p-3 rounded-full">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Suspended</h1>
                    <p className="text-gray-500 text-sm">
                        Your account has been suspended by an administrator. This usually happens due to security concerns, billing issues, or policy violations.
                    </p>
                </div>

                {suspensionReason && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-800 text-left">
                        <span className="font-semibold block mb-1">Reason:</span>
                        {suspensionReason}
                    </div>
                )}

                <div className="pt-4 space-y-4">
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please contact our support team at <a href="mailto:support@dbsnap.com" className="text-primary hover:underline font-medium">support@dbsnap.com</a>.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out of this account
                    </button>
                </div>
            </div>
        </div>
    )
}
