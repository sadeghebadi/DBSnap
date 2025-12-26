"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../services/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, eventsData] = await Promise.all([
                    AdminService.getStats(),
                    AdminService.getRecentEvents()
                ]);
                setStats(statsData);
                setEvents(eventsData);
            } catch (err) {
                console.error("Failed to load admin dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '50vh' }}>
            <div className="animate-fade-in">Loading dashboard data...</div>
        </div>
    );

    if (!stats) return <div>Failed to load data.</div>;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="animate-fade-in">
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
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Across all organizations
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-value">{stats.successRate.toFixed(1)}%</div>
                    <div className={`badge ${stats.successRate > 95 ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                        {stats.successRate > 95 ? 'Healthy' : 'Needs Attention'}
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Global Storage</div>
                    <div className="stat-value">{formatBytes(stats.totalStorageBytes)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Total S3 usage
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="admin-card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Recent Critical Events</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.length === 0 && <div className="text-muted">No recent events.</div>}
                        {events.map((event: any) => (
                            <div key={event.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                <span className={`badge ${event.type === 'CRITICAL' ? 'badge-error' : event.type === 'SECURITY' ? 'badge-warning' : 'badge-success'}`}>
                                    {event.type}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{event.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(event.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => router.push('/admin/settings')}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                        >
                            Toggle Maintenance Mode
                        </button>
                        <button
                            onClick={() => router.push('/admin/promo-codes')}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                        >
                            Manage Promo Codes
                        </button>
                        <button
                            onClick={() => router.push('/admin/workers')}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                        >
                            Manage Workers
                        </button>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>SYSTEM HEALTH</h3>
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
