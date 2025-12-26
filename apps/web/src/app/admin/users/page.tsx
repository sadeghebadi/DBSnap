"use client";

import { useEffect, useState } from "react";

interface AdminUser {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
}

export default function AdminUserList() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [page] = useState(1);

    useEffect(() => {
        // Mocking API call
        setTimeout(() => {
            setUsers([
                { id: '1', email: 'john@example.com', role: 'MEMBER', isVerified: true, createdAt: '2023-12-01' },
                { id: '2', email: 'admin@dbsnap.com', role: 'ADMIN', isVerified: true, createdAt: '2023-11-20' },
                { id: '3', email: 'sarah@org.com', role: 'MEMBER', isVerified: false, createdAt: '2023-12-15' },
                { id: '4', email: 'dev@test.com', role: 'READ_ONLY', isVerified: true, createdAt: '2023-12-10' },
            ]);
        }, 800);
    }, [page, search]);

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>User Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'white', width: '300px' }}
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
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.email}</td>
                            <td><span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>{user.role}</span></td>
                            <td>
                                <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </td>
                            <td>{user.createdAt}</td>
                            <td>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--admin-accent)', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                                <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>Suspend</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button disabled className="admin-nav-item" style={{ padding: '0.5rem 1rem', background: 'transparent', opacity: 0.5 }}>Previous</button>
                <button className="admin-nav-item active" style={{ padding: '0.5rem 1rem' }}>1</button>
                <button className="admin-nav-item" style={{ padding: '0.5rem 1rem', background: 'transparent' }}>Next</button>
            </div>
        </div>
    );
}
