"use client";

import { useState, useEffect } from "react";
import SnapshotTable, { Snapshot } from "../../../components/SnapshotTable";
import { SnapshotsService } from "../../../services/snapshots";
import { ConnectionsService } from "../../../services/connections";
import { toast } from "react-hot-toast";

export default function SnapshotsPage() {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewSnapshotModal, setShowNewSnapshotModal] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadSnapshots();
    }, []);

    const loadSnapshots = async () => {
        try {
            const data = await SnapshotsService.list();
            const mappedSnapshots = data.map((s: any) => ({
                id: s.id,
                status: s.status === 'PENDING' || s.status === 'RUNNING' ? 'info' :
                    s.status === 'COMPLETED' ? 'success' :
                        s.status === 'FAILED' ? 'error' : 'secondary',
                connectionName: s.connection?.name || 'Unknown',
                connectionType: s.connection?.type || 'Unknown',
                name: s.status === 'PENDING' ? 'Snapshot in progress...' : `Snapshot ${s.id.substring(0, 8)}`,
                size: s.sizeBytes ? `${(s.sizeBytes / 1024 / 1024).toFixed(2)} MB` : 'Processing...',
                createdAt: new Date(s.createdAt).toLocaleString()
            }));
            setSnapshots(mappedSnapshots);
        } catch (err) {
            toast.error("Failed to load snapshots");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenNewSnapshot = async () => {
        setShowNewSnapshotModal(true);
        try {
            const conns = await ConnectionsService.list();
            setConnections(conns);
            if (conns.length > 0) setSelectedConnectionId(conns[0].id);
        } catch (err) {
            toast.error("Failed to load connections");
        }
    };

    const handleCreateSnapshot = async () => {
        if (!selectedConnectionId) return;
        setCreating(true);
        try {
            await SnapshotsService.create(selectedConnectionId);
            toast.success("Snapshot started!");
            setShowNewSnapshotModal(false);
            loadSnapshots();
        } catch (err) {
            toast.error("Failed to start snapshot");
        } finally {
            setCreating(false);
        }
    };

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
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={handleOpenNewSnapshot}
                    >
                        + New Snapshot
                    </button>
                </div>
            </div>

            <SnapshotTable snapshots={snapshots} />

            {showNewSnapshotModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Snapshot</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">Select Connection</label>
                            <select
                                className="input-field"
                                value={selectedConnectionId}
                                onChange={(e) => setSelectedConnectionId(e.target.value)}
                            >
                                {connections.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'transparent' }}
                                onClick={() => setShowNewSnapshotModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateSnapshot}
                                disabled={creating}
                            >
                                {creating ? 'Starting...' : 'Start Snapshot'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
