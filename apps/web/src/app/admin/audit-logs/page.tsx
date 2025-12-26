"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";

interface AuditLog {
    id: string;
    action: string;
    resource?: string;
    adminId?: string;
    userId?: string;
    ipAddress?: string;
    details?: any;
    createdAt: string;
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await AdminService.getAuditLogs();
                setLogs(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="admin-card animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Audit Logs</h2>
            {loading ? <div className="text-muted">Loading logs...</div> : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Actor</th>
                            <th>IP Address</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td>
                                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'monospace' }}>{log.resource || '-'}</td>
                                <td>
                                    {log.adminId ? <span style={{ color: '#fbbf24' }}>Admin</span> : 'User'}
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                                        {log.adminId || log.userId}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ipAddress || '-'}</td>
                                <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {JSON.stringify(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
