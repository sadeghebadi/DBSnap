"use client"

import { useState } from "react"
import { useUsers } from "@/lib/hooks/use-users"
import { Loader2, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import api from "@/lib/api"

export function UserList() {
    const [page, setPage] = useState(1)
    const { users, meta, isLoading, error } = useUsers(page)

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
        return <div className="text-red-500">Failed to load users.</div>
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <table className="w-full text-sm font-medium">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground w-[100px]">ID</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Email</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Role</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Verified</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground">Created</th>
                            <th className="h-12 px-4 text-left align-middle text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle font-mono text-xs">{user.id.slice(0, 8)}...</td>
                                <td className="p-4 align-middle">{user.email}</td>
                                <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role?.name === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role?.name || 'MEMBER'}
                                    </span>
                                    {(user as any).isSuspended && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Suspended
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 align-middle">
                                    {user.isVerified ? (
                                        <span className="text-green-600">Yes</span>
                                    ) : (
                                        <span className="text-yellow-600">No</span>
                                    )}
                                </td>
                                <td className="p-4 align-middle">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                                <td className="p-4 align-middle text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await api.post(`/auth/admin/impersonate/${user.id}`);
                                                    const adminToken = localStorage.getItem('token');
                                                    if (adminToken) localStorage.setItem('admin_token', adminToken);
                                                    localStorage.setItem('token', res.data.access_token);
                                                    window.location.href = '/dashboard';
                                                } catch (e) {
                                                    alert('Failed to impersonate user');
                                                }
                                            }}
                                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                                        >
                                            Impersonate
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const reason = prompt('Please enter a reason for MFA reset:');
                                                if (!reason) return;
                                                try {
                                                    await api.post(`/users/${user.id}/mfa-reset`, { reason });
                                                    alert('MFA reset successfully');
                                                } catch (e) {
                                                    alert('Failed to reset MFA');
                                                }
                                            }}
                                            className="text-xs border border-amber-500 text-amber-500 px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                                        >
                                            Reset MFA
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const isSuspended = !(user as any).isSuspended;
                                                const reason = isSuspended ? prompt('Reason for suspension (customer-facing):') : null;
                                                const internalNote = isSuspended ? prompt('Internal note:') : null;

                                                try {
                                                    await api.patch(`/admin/suspension/users/${user.id}`, {
                                                        isSuspended,
                                                        reason: reason || undefined,
                                                        internalNote: internalNote || undefined
                                                    });
                                                    alert(`User ${isSuspended ? 'suspended' : 'reactivated'} successfully`);
                                                    window.location.reload();
                                                } catch (e) {
                                                    alert('Failed to update suspension status');
                                                }
                                            }}
                                            className={`text-xs px-2 py-1 rounded transition-colors ${(user as any).isSuspended
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                        >
                                            {(user as any).isSuspended ? 'Reactivate' : 'Suspend'}
                                        </button>
                                        <button className="ghost h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="h-24 text-center">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-sm text-muted-foreground">
                    Page {page} of {meta ? Math.ceil(meta.total / meta.take) : 1}
                </span>
                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    onClick={() => setPage(p => p + 1)}
                    disabled={meta ? page >= Math.ceil(meta.total / meta.take) : true}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
