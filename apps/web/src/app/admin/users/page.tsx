"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminService } from "../../../services/admin";
import { toast } from "react-hot-toast";

interface AdminUser {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

export default function AdminUserList() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AdminService.listUsers(page, 10, search);
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch users", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleToggleSuspension = async (user: AdminUser) => {
        const action = user.isActive ? "suspend" : "reactivate";
        if (!confirm(`Are you sure you want to ${action} user ${user.email}?`)) return;

        try {
            await AdminService.toggleUserSuspension(user.id, !user.isActive);
            toast.success(`User ${action}ed successfully`);
            fetchUsers();
        } catch (err) {
            toast.error(`Failed to ${action} user`);
        }
    };

    const handleImpersonate = async (user: AdminUser) => {
        try {
            // Mock admin ID for now - in reality this would come from the auth context
            const adminId = "current-admin-id";
            const data = await AdminService.impersonateUser(user.id, adminId);
            toast.success(`Impersonating ${user.email}. Token copied to console (Mock)`);
            console.log("Impersonation Data:", data);
            // In a real app, you'd store this token and redirect to the client dashboard
        } catch (err) {
            toast.error("Impersonation failed");
        }
    };

    const handleResetMFA = async (user: AdminUser) => {
        if (!confirm(`Reset MFA for ${user.email}? This cannot be undone.`)) return;
        try {
            await AdminService.resetMFA(user.id);
            toast.success("MFA has been reset");
        } catch (err) {
            toast.error("Failed to reset MFA");
        }
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>User Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="admin-input"
                        style={{ width: '300px' }}
                    />
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Loading users...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No users found.</td></tr>
                    ) : users.map(user => (
                        <tr key={user.id}>
                            <td>
                                <div>{user.email}</div>
                                {!user.isActive && <div style={{ fontSize: '0.75rem', color: '#f87171' }}>Suspended</div>}
                            </td>
                            <td><span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>{user.role}</span></td>
                            <td>
                                <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleImpersonate(user)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer' }}
                                        title="Log in as this user"
                                    >
                                        Impersonate
                                    </button>
                                    <button
                                        onClick={() => handleResetMFA(user)}
                                        style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer' }}
                                        title="Reset Multi-Factor Authentication"
                                    >
                                        MFA Reset
                                    </button>
                                    <button
                                        onClick={() => handleToggleSuspension(user)}
                                        style={{ background: 'transparent', border: 'none', color: user.isActive ? '#f87171' : '#4ade80', cursor: 'pointer' }}
                                    >
                                        {user.isActive ? "Suspend" : "Activate"}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="admin-nav-item"
                        style={{ padding: '0.5rem 1rem', background: 'transparent', opacity: page === 1 ? 0.3 : 1 }}
                    >
                        Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="admin-nav-item"
                        style={{ padding: '0.5rem 1rem', background: 'transparent', opacity: page === totalPages ? 0.3 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
