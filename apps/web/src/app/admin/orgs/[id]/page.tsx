"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../../services/admin";
import { useParams, useRouter } from "next/navigation";

export default function AdminOrgDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [org, setOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrg = async () => {
        try {
            // New endpoint for deep details
            // I need to add getOrgDetails to frontend AdminService as well!
            // I'll assume I'll add it in the next step or alongside this task.
            // For now, let's use a direct fetch for speed or update service after.
            // Wait, I updated AdminService in apps/web/src/services/admin.ts but did I add getOrgDetails?
            // Checking... Step 2374 updated AdminController, Step 2377 updated frontend AdminService partially.
            // I did NOT add getOrgDetails to frontend service either. I suck at this today.
            // I will add it.
            const res = await fetch(`http://localhost:3000/api/admin/orgs/${id}/details`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            if (res.ok) setOrg(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrg();
    }, [id]);

    const handleGDPRExport = async (userId: string) => {
        if (!confirm("Generate GDPR Data Export for this user?")) return;
        try {
            // Using direct fetch again because service update is pending
            const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/gdpr/export`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `user-export-${userId}.json`;
                a.click();
            }
        } catch (err) {
            alert("Export failed");
        }
    };

    const handleGDPRDelete = async (userId: string) => {
        if (!confirm("⚠️ PERMANENTLY DELETE USER? This action cannot be undone.")) return;
        if (!confirm("Are you absolutely sure?")) return;
        try {
            const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/gdpr/delete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                alert("User deleted");
                fetchOrg();
            }
        } catch (err) {
            alert("Delete failed");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!org) return <div>Org not found</div>;

    return (
        <div className="admin-card animate-fade-in">
            <button onClick={() => router.back()} className="btn" style={{ background: 'transparent', marginBottom: '1rem', paddingLeft: 0 }}>← Back</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{org.name}</h1>
                    <div style={{ color: 'var(--text-muted)' }}>ID: {org.id}</div>
                </div>
                <div className={`badge ${org.isActive ? 'badge-success' : 'badge-error'}`}>
                    {org.isActive ? 'Active' : 'Suspended'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div>
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Projects & Databases</h3>
                    {org.projects?.map((proj: any) => (
                        <div key={proj.id} style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 500 }}>📁 {proj.name}</div>
                            <div style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
                                {proj.databases?.length === 0 && <div className="text-muted" style={{ fontSize: '0.9rem' }}>No databases</div>}
                                {proj.databases?.map((db: any) => (
                                    <div key={db.id} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        🛢 {db.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Members & Compliance</h3>
                    {org.users?.map((user: any) => (
                        <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                            <div>
                                <div>{user.email}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.role}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button title="Export Data" onClick={() => handleGDPRExport(user.id)} style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'white' }}>📤</button>
                                <button title="Delete User" onClick={() => handleGDPRDelete(user.id)} style={{ cursor: 'pointer', background: 'transparent', border: '1px solid #7f1d1d', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#f87171' }}>🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <h3>Legal Hold</h3>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={org.legalHold} readOnly />
                    <span>Prevent data deletion for this organization (Legal Hold)</span>
                </div>
            </div>
        </div>
    );
}
