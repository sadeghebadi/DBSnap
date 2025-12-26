"use client";

import { useEffect, useState } from "react";

interface OrgStats {
    id: string;
    name: string;
    projectCount: number;
    connectionCount: number;
    snapshotCount: number;
    storageBytes: number;
    createdAt: string;
}

export default function OrgUsageStatsPage() {
    const [orgs, setOrgs] = useState<OrgStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would be: fetch('/api/admin/usage-stats')
        // Mocking for demonstration
        setTimeout(() => {
            setOrgs([
                { id: '1', name: 'Acme Corp', projectCount: 3, connectionCount: 5, snapshotCount: 120, storageBytes: 1024 * 1024 * 500, createdAt: '2025-01-01' },
                { id: '2', name: 'Globex', projectCount: 1, connectionCount: 2, snapshotCount: 45, storageBytes: 1024 * 1024 * 150, createdAt: '2025-02-15' },
                { id: '3', name: 'Soylent Corp', projectCount: 5, connectionCount: 12, snapshotCount: 890, storageBytes: 1024 * 1024 * 1024 * 12, createdAt: '2024-12-10' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Organization Usage Statistics</h2>
                <button className="badge badge-success" style={{ border: 'none', cursor: 'pointer' }}>Export CSV</button>
            </div>

            {loading ? (
                <div>Loading usage stats...</div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Organization</th>
                            <th>Projects</th>
                            <th>Connections</th>
                            <th>Snapshots</th>
                            <th>Storage</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orgs.map(org => (
                            <tr key={org.id}>
                                <td style={{ fontWeight: 500 }}>{org.name}</td>
                                <td>{org.projectCount}</td>
                                <td>{org.connectionCount}</td>
                                <td>{org.snapshotCount}</td>
                                <td>{formatSize(org.storageBytes)}</td>
                                <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
