"use client"

import { useState, useEffect } from "react"
import { Hammer, Save, Loader2 } from "lucide-react"
import api from "@/lib/api"

export function MaintenanceToggle() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState({
        enabled: false,
        message: "",
        whitelist: [] as string[]
    })
    const [whitelistInput, setWhitelistInput] = useState("")

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await api.get('/maintenance/status')
            setStatus(res.data)
            setWhitelistInput(res.data.whitelist.join(', '))
        } catch (e) {
            console.error('Failed to fetch maintenance status')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const whitelist = whitelistInput.split(',').map(i => i.trim()).filter(i => i)
            await api.post('/maintenance/toggle', {
                ...status,
                whitelist
            })
            alert('Maintenance status updated')
        } catch (e) {
            alert('Failed to update maintenance status')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center gap-2">
                <Hammer className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Maintenance Mode</h3>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-900">Global Maintenance Mode</p>
                        <p className="text-sm text-slate-500 text-pretty">When enabled, all users will be redirected to the maintenance page.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={status.enabled}
                            onChange={(e) => setStatus({ ...status, enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Maintenance Message</label>
                    <textarea
                        value={status.message}
                        onChange={(e) => setStatus({ ...status, message: e.target.value })}
                        className="w-full min-h-[100px] px-3 py-2 bg-white border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. System is currently undergoing scheduled maintenance..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">IP Whitelist (comma separated)</label>
                    <input
                        type="text"
                        value={whitelistInput}
                        onChange={(e) => setWhitelistInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. 192.168.1.1, 10.0.0.1"
                    />
                    <p className="text-xs text-slate-500 italic">Whitelisted IPs bypass the maintenance screen.</p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Maintenance Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
