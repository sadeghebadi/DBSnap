"use client"

import { useEffect, useState } from "react"
import { Hammer } from "lucide-react"

export default function MaintenancePage() {
    const [message, setMessage] = useState("System is currently undergoing maintenance.")

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/maintenance/status`)
                const data = await res.json()
                if (data.enabled) {
                    setMessage(data.message)
                } else {
                    window.location.href = "/"
                }
            } catch (e) {
                // Ignore
            }
        }
        checkStatus()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-600 mb-4">
                    <Hammer className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                    Under Maintenance
                </h1>
                <p className="text-slate-600 text-lg">
                    {message}
                </p>
                <div className="pt-8 text-sm text-slate-400">
                    We'll be back online as soon as possible.
                </div>
            </div>
        </div>
    )
}
