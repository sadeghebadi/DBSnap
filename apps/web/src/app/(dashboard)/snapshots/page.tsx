"use client";

import { useState, useEffect } from "react";
import SnapshotTable, { Snapshot } from "../../../components/SnapshotTable";

export default function SnapshotsPage() {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking API call
        setTimeout(() => {
            setSnapshots([
                {
                    id: 'snap_12345abcde',
                    status: 'success',
                    connectionName: 'Production Main',
                    connectionType: 'PostgreSQL',
                    name: 'Daily Backup - Midnight',
                    size: '2.4 GB',
                    createdAt: 'Today, 00:00 AM'
                },
                {
                    id: 'snap_67890fghij',
                    status: 'success',
                    connectionName: 'Staging Auth',
                    connectionType: 'MongoDB',
                    name: 'Pre-Deployment Backup',
                    size: '450 MB',
                    createdAt: 'Yesterday, 4:30 PM'
                },
                {
                    id: 'snap_13579klmno',
                    status: 'error',
                    connectionName: 'Legacy MySQL',
                    connectionType: 'MySQL',
                    name: 'Hourly Log Dump',
                    size: '0 B',
                    createdAt: 'Yesterday, 3:00 PM'
                },
                {
                    id: 'snap_24680pqrst',
                    status: 'info',
                    connectionName: 'Production Main',
                    connectionType: 'PostgreSQL',
                    name: 'Manual Trigger',
                    size: 'Processing...',
                    createdAt: 'Just now'
                },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '50vh' }}>
            <div className="animate-fade-in">Loading snapshots...</div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Snapshot History</h1>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>View and manage your database backups</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Filter snapshots..."
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            color: 'white',
                            width: '240px'
                        }}
                    />
                    <button className="btn btn-primary" style={{ width: 'auto' }}>
                        + New Snapshot
                    </button>
                </div>
            </div>

            <SnapshotTable snapshots={snapshots} />
        </div>
    );
}
