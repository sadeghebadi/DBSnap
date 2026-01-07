
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import api from '@/lib/api' // Using the axios instance directly if available, or fetch

export default function UserDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.userId as string
    const { token } = useAuth()

    const [user, setUser] = useState<any>(null)
    const [exports, setExports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Helper for toast-like notifications
    const notify = (msg: string, type: 'success' | 'error' = 'success') => {
        alert(msg); // Simple alert for now, or console
    }

    useEffect(() => {
        if (token) fetchUser()
    }, [token, userId])

    async function fetchUser() {
        try {
            setLoading(true)
            // Using fetch explicitly to ensure headers approach matches what I wrote in useAuth/Login context
            // But UserList uses api mock or real. Let's use fetch.
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch user')
            const data = await res.json()
            setUser(data)
            fetchExports()
        } catch (err) {
            console.error(err)
            notify('Failed to load user data', 'error')
        } finally {
            setLoading(false)
        }
    }

    async function fetchExports() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compliance/${userId}/exports`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setExports(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    async function handleExport() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compliance/${userId}/export`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Export failed')
            notify('Export started')
            fetchExports()
        } catch (err) {
            notify('Failed to trigger export', 'error')
        }
    }

    async function toggleLegalHold(checked: boolean) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compliance/legal-hold/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isHeld: checked })
            })
            if (!res.ok) throw new Error('Update failed')
            setUser({ ...user, isLegalHold: checked })
            notify(`Legal Hold ${checked ? 'Applied' : 'Removed'}`)
        } catch (err) {
            notify('Failed to update Legal Hold', 'error')
        }
    }

    async function handleDelete() {
        if (!confirm('PERMANENTLY DELETE USER? This action cannot be undone and deletes all backups immediately.')) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compliance/${userId}/data`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Deletion failed')
            }
            notify('Deletion scheduled')
            router.push('/admin/users')
        } catch (err: any) {
            notify(err.message, 'error')
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!user) return <div className="p-8">User not found</div>

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">User Details: {user.email}</h1>
                <Link href="/admin/users" className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Back to List
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Profile Card */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 space-y-1.5 ">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Profile</h3>
                    </div>
                    <div className="p-6 pt-0 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID:</span>
                            <span className="font-mono text-sm">{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{user.plan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined:</span>
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Projects:</span>
                            <span>{user.projects?.length || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div className="rounded-lg border border-red-200 bg-red-50 text-card-foreground shadow-sm dark:bg-red-950/20 dark:border-red-900/50">
                    <div className="p-6 space-y-1.5">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight text-red-600">Danger Zone (GDPR)</h3>
                        <p className="text-sm text-muted-foreground">Compliance actions for Data Subject Rights.</p>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="font-medium">Legal Hold</span>
                                <p className="text-xs text-muted-foreground">Prevent deletion of this user.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.isLegalHold}
                                    onChange={(e) => toggleLegalHold(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-red-200 dark:border-red-900/50">
                            <div className="space-y-0.5">
                                <span className="font-medium">Permanent Deletion</span>
                                <p className="text-xs text-muted-foreground">Right to Erasure (Purge S3 & DB).</p>
                            </div>
                            <button
                                onClick={handleDelete}
                                disabled={user.isLegalHold}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete User Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exports Card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-1.5">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">Data Exports</h3>
                    <p className="text-sm text-muted-foreground">History of GDPR data export requests.</p>
                </div>
                <div className="p-6 pt-0">
                    <div className="mb-4">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Trigger New Export
                        </button>
                    </div>
                    {exports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No exports found.</p>
                    ) : (
                        <div className="w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-2 font-medium">Date</th>
                                        <th className="pb-2 font-medium">Status</th>
                                        <th className="pb-2 font-medium">Expiry</th>
                                        <th className="pb-2 font-medium">Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exports.map((ex: any) => (
                                        <tr key={ex.id} className="border-b last:border-0">
                                            <td className="py-2">{new Date(ex.createdAt).toLocaleString()}</td>
                                            <td className="py-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ex.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {ex.status}
                                                </span>
                                            </td>
                                            <td className="py-2">{ex.expiresAt ? new Date(ex.expiresAt).toLocaleDateString() : '-'}</td>
                                            <td className="py-2">
                                                {ex.s3Key && (
                                                    <span className="font-mono text-xs text-muted-foreground">{ex.s3Key}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
