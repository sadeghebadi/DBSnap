"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Connection {
    id: string;
    name: string;
    type: string;
    host: string;
    status: 'healthy' | 'warning' | 'error';
    lastBackup?: string;
}

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking API call for now
        setTimeout(() => {
            setConnections([
                { id: '1', name: 'Production Main', type: 'PostgreSQL', host: 'db.example.com', status: 'healthy', lastBackup: '2 hours ago' },
                { id: '2', name: 'Staging Auth', type: 'MongoDB', host: 'mongo-stg.local', status: 'healthy', lastBackup: '5 mins ago' },
                { id: '3', name: 'Legacy Analytics', type: 'MySQL', host: '192.168.1.45', status: 'warning', lastBackup: '1 day ago' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '50vh' }}>
            <div className="animate-fade-in">Loading your connections...</div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Connections</h1>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Manage your database source connections</p>
                </div>
                <Link href="/connections/add">
                    <button className="btn btn-primary" style={{ width: 'auto' }}>
                        + Add Connection
                    </button>
                </Link>
            </div>

            {connections.length === 0 ? (
                <div className="glass-card flex-center" style={{ padding: '5rem', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔌</div>
                        <h2 style={{ marginBottom: '1rem' }}>No connections found</h2>
                        <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '2rem', maxWidth: '400px' }}>
                            Start by adding your first database connection to enable automated backups and snapshots.
                        </p>
                        <Link href="/connections/add">
                            <button className="btn btn-primary">Add Your First Connection</button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="connection-grid">
                    {connections.map((conn) => (
                        <div key={conn.id} className="glass-card connection-card">
                            <div className="card-header">
                                <div className={`status-dot ${conn.status}`}></div>
                                <span className="conn-type">{conn.type}</span>
                            </div>

                            <h3 className="conn-name">{conn.name}</h3>
                            <p className="conn-host">{conn.host}</p>

                            <div className="card-footer">
                                <div className="backup-info">
                                    <span className="label">Last Backup</span>
                                    <span className="value">{conn.lastBackup}</span>
                                </div>
                                <div className="card-actions">
                                    <button className="btn-icon">⚙️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .connection-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                }

                .connection-card {
                    padding: 2rem;
                    transition: var(--trans-fast);
                    cursor: pointer;
                }

                .connection-card:hover {
                    transform: translateY(-5px);
                    border-color: hsl(var(--primary) / 0.3);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .status-dot.healthy { background: hsl(var(--success)); box-shadow: 0 0 10px hsl(var(--success) / 0.5); }
                .status-dot.warning { background: orange; box-shadow: 0 0 10px orange; }
                .status-dot.error { background: hsl(var(--error)); box-shadow: 0 0 10px hsl(var(--error) / 0.5); }

                .conn-type {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: hsl(var(--text-muted));
                    background: rgba(255,255,255,0.05);
                    padding: 0.25rem 0.75rem;
                    border-radius: 2rem;
                }

                .conn-name {
                    font-size: 1.25rem;
                    margin-bottom: 0.25rem;
                }

                .conn-host {
                    font-size: 0.875rem;
                    color: hsl(var(--text-muted));
                    margin-bottom: 2rem;
                }

                .card-footer {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    border-top: 1px solid var(--glass-border);
                    padding-top: 1.5rem;
                }

                .backup-info {
                    display: flex;
                    flex-direction: column;
                }

                .backup-info .label {
                    font-size: 0.75rem;
                    color: hsl(var(--text-muted));
                    margin-bottom: 0.25rem;
                }

                .backup-info .value {
                    font-size: 0.875rem;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
