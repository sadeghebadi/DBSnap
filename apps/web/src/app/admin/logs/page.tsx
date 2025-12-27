"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../services/admin";
import { toast } from "react-hot-toast";

interface AuditLog {
    id: string;
    action: string;
    adminId?: string;
    userId?: string;
    orgId?: string;
    resource?: string;
    details: any;
    ipAddress?: string;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const fetchLogs = async () => {
        try {
            const data = await AdminService.getAuditLogs({ q: filter });
            setLogs(data || []);
        } catch (err) {
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadgeClass = (action: string) => {
        if (action.startsWith('SUPPORT_')) return 'badge-info';
        if (action.includes('DELETE') || action.includes('SUSPEND')) return 'badge-error';
        if (action.includes('CREATE') || action.includes('UPDATE')) return 'badge-success';
        return 'badge-warning';
    };

    if (loading) return <div className="animate-fade-in">Loading security logs...</div>;

    return (
        <div className="animate-fade-in">
            <div className="admin-header-actions">
                <h2 className="section-title" style={{ margin: 0 }}>System Audit Logs</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Filter by action or ID..."
                        className="admin-input"
                        style={{ width: '300px' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <button className="cta-button cta-secondary" onClick={fetchLogs}>Refresh</button>
                </div>
            </div>

            <div className="admin-card" style={{ padding: 0, marginTop: '2rem' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>IP Address</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>No logs matching the criteria.</td></tr>
                        )}
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td>
                                    <div style={{ fontSize: '0.875rem' }}>{log.adminId ? `Admin: ${log.adminId.slice(0, 8)}` : `User: ${log.userId?.slice(0, 8)}`}</div>
                                </td>
                                <td>
                                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{log.resource || 'N/A'}</td>
                                <td style={{ fontSize: '0.875rem' }}>{log.ipAddress || 'Internal'}</td>
                                <td>
                                    <button
                                        onClick={() => alert(JSON.stringify(log.details, null, 2))}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        View JSON
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
