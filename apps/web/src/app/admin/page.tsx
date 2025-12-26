"use client";

import { useEffect, useState } from "react";

interface AdminStats {
    totalUsers: number;
    totalBackupsLast24h: number;
    successRate: number;
    totalStorageBytes: number;
    growthMetrics: { growthPercent: number };
}

interface AdminEvent {
    id: number;
    type: string;
    message: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking API calls for now
        setTimeout(() => {
            setStats({
                totalUsers: 1250,
                totalBackupsLast24h: 342,
                successRate: 98.5,
                totalStorageBytes: 1024 * 1024 * 1024 * 450, // 450 GB
                growthMetrics: { growthPercent: 12.4 }
            });
            setEvents([
                { id: 1, type: 'CRITICAL', message: 'Worker node 3 unresponsive', timestamp: '2 mins ago' },
                { id: 2, type: 'SECURITY', message: 'Unauthorized login attempt', timestamp: '15 mins ago' },
                { id: 3, type: 'INFO', message: 'Maintenance mode toggled OFF', timestamp: '1 hour ago' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <div>Loading dashboard data...</div>;

    return (
        <div>
            <div className="admin-grid">
                <div className="admin-card">
                    <div className="stat-label">Total Active Users</div>
                    <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                    <div style={{ color: '#4ade80', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        ↑ {stats.growthMetrics.growthPercent}% this week
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Backups (Last 24h)</div>
                    <div className="stat-value">{stats.totalBackupsLast24h}</div>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Across all organizations
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-value">{stats.successRate}%</div>
                    <div className="badge badge-success" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Healthy</div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Global Storage</div>
                    <div className="stat-value">{(stats.totalStorageBytes / (1024 ** 3)).toFixed(1)} GB</div>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Total S3 usage
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="admin-card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Recent Critical Events</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.map(event => (
                            <div key={event.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                <span className={`badge ${event.type === 'CRITICAL' ? 'badge-error' : event.type === 'SECURITY' ? 'badge-warning' : 'badge-success'}`}>
                                    {event.type}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{event.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>{event.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}>
                            Toggle Maintenance Mode
                        </button>
                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}>
                            Create Promo Code
                        </button>
                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}>
                            Flush Redis Cache
                        </button>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>SYSTEM HEALTH</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                            <span>All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
