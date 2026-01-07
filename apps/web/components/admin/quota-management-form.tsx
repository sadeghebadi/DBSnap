"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
    Settings2,
    Save,
    AlertCircle,
    Loader2,
    ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuotaManagementFormProps {
    userId: string
}

export function QuotaManagementForm({ userId }: QuotaManagementFormProps) {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<any>({
        maxProjects: '',
        maxDatabases: '',
        maxStorageGB: '',
        retentionDays: '',
        ignorePlanLimits: false
    })

    const { data: quota, isLoading } = useQuery({
        queryKey: ['user-quota', userId],
        queryFn: async () => {
            const res = await api.get(`/admin/quotas/${userId}`)
            return res.data
        }
    })

    useEffect(() => {
        if (quota) {
            setFormData({
                maxProjects: quota.maxProjects ?? '',
                maxDatabases: quota.maxDatabases ?? '',
                maxStorageGB: quota.maxStorageGB ?? '',
                retentionDays: quota.retentionDays ?? '',
                ignorePlanLimits: quota.ignorePlanLimits ?? false
            })
        }
    }, [quota])

    const mutation = useMutation({
        mutationFn: async (newData: any) => {
            return api.patch(`/admin/quotas/${userId}`, newData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-quota', userId] })
            setIsEditing(false)
        }
    })

    if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>

    const handleSave = () => {
        mutation.mutate(formData)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-slate-400" />
                    <h2 className="font-semibold text-slate-900">Quota Overrides</h2>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                        Edit Overrides
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6">
                {quota?.ignorePlanLimits && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">Manual Override Active</p>
                            <p className="text-xs text-amber-700 mt-1">This user is currently bypassing all standard plan restrictions. Exercise caution when tweaking these limits.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Max Projects</label>
                        <input
                            name="maxProjects"
                            type="number"
                            placeholder="Plan default"
                            disabled={!isEditing}
                            value={formData.maxProjects}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
                        />
                        <p className="text-[10px] text-muted-foreground font-medium italic">Empty = Plan default</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Max Databases</label>
                        <input
                            name="maxDatabases"
                            type="number"
                            placeholder="Plan default"
                            disabled={!isEditing}
                            value={formData.maxDatabases}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Max Storage (GB)</label>
                        <input
                            name="maxStorageGB"
                            type="number"
                            placeholder="Plan default"
                            disabled={!isEditing}
                            value={formData.maxStorageGB}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Retention (Days)</label>
                        <input
                            name="retentionDays"
                            type="number"
                            placeholder="Plan default"
                            disabled={!isEditing}
                            value={formData.retentionDays}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium"
                        />
                    </div>
                    <div className="md:col-span-2 pt-6 mt-2 border-t flex items-center gap-4">
                        <div className="relative flex items-center">
                            <input
                                id="ignorePlanLimits"
                                name="ignorePlanLimits"
                                type="checkbox"
                                disabled={!isEditing}
                                checked={formData.ignorePlanLimits}
                                onChange={handleChange}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                            />
                        </div>
                        <label htmlFor="ignorePlanLimits" className="text-sm font-bold text-slate-900 cursor-pointer select-none">
                            Unrestricted Mode (Ignore all plan-based limits)
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
