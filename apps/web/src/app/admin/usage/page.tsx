"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";

export default function AdminUsagePage() {
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const data = await AdminService.getOrgUsageStats();
                setUsage(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsage();
    }, []);

    // Helper to calculate percentage
    const getPercent = (value: number, max: number) => {
        if (!max) return 0;
        return Math.min(100, (value / max) * 100);
    };

    return (
        <div className="admin-card animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>System Usage & Quotas</h2>

            {loading ? <div className="text-muted">Loading usage stats...</div> : (
                <div>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="stat-card">
                            <div className="label">Total Orgs</div>
                            <div className="value">{usage?.length || 0}</div>
                        </div>
                        {/* Placeholder for aggregate stats if API provided them, here we just list orgs */}
                    </div>

                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Organization</th>
                                <th>Snapshots</th>
                                <th>Storage (GB)</th>
                                <th>Connections</th>
                                <th>Plan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usage?.map((org: any) => (
                                <tr key={org.id}>
                                    <td style={{ fontWeight: 500 }}>{org.name}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                <div style={{ width: `${getPercent(org._count.snapshots, org.subscription?.plan?.maxSnapshots || 10)}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                                            </div>
                                            {org._count.snapshots} / {org.overrideMaxSnapshots || org.subscription?.plan?.maxSnapshots || 10}
                                        </div>
                                    </td>
                                    <td>
                                        {/* Mock storage value since we don't track bytes strictly yet */}
                                        <span className="text-muted">- / {org.overrideStorageLimitGb || org.subscription?.plan?.storageLimitGb || 5}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                <div style={{ width: `${getPercent(org._count.connections, org.subscription?.plan?.maxConnections || 5)}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                                            </div>
                                            {org._count.connections} / {org.overrideMaxConnections || org.subscription?.plan?.maxConnections || 5}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge">{org.subscription?.plan?.name || 'Free'}</span>
                                        {org.ignorePlanLimits && <span className="badge badge-warning" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>Unlimited</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
