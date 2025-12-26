"use client";

import StatusBadge from "./StatusBadge";

export interface Snapshot {
    id: string;
    status: 'success' | 'warning' | 'error' | 'info';
    connectionName: string;
    connectionType: string;
    name: string;
    size: string;
    createdAt: string;
}

interface SnapshotTableProps {
    snapshots: Snapshot[];
}

export default function SnapshotTable({ snapshots }: SnapshotTableProps) {
    return (
        <div className="table-container glass-card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '120px' }}>Status</th>
                        <th>Snapshot Name</th>
                        <th>Connection</th>
                        <th>Size</th>
                        <th>Created At</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {snapshots.map((snap) => (
                        <tr key={snap.id}>
                            <td>
                                <StatusBadge status={snap.status} />
                            </td>
                            <td>
                                <div className="snap-name">{snap.name}</div>
                                <div className="snap-id">{snap.id}</div>
                            </td>
                            <td>
                                <div className="conn-info">
                                    <span className={`conn-icon ${snap.connectionType.toLowerCase()}`}></span>
                                    {snap.connectionName}
                                </div>
                            </td>
                            <td style={{ fontFamily: 'monospace', color: 'hsl(var(--text-muted))' }}>{snap.size}</td>
                            <td style={{ color: 'hsl(var(--text-muted))' }}>{snap.createdAt}</td>
                            <td style={{ textAlign: 'right' }}>
                                <div className="actions">
                                    <button className="btn-icon-sm" title="Restore">↺</button>
                                    <button className="btn-icon-sm" title="Diff">🔍</button>
                                    <button className="btn-icon-sm" title="Download">⬇</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style jsx>{`
                .table-container {
                    padding: 0;
                    overflow: hidden;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .data-table th {
                    padding: 1.25rem 1.5rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: hsl(var(--text-muted));
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(0, 0, 0, 0.1);
                    font-weight: 600;
                }

                .data-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                    vertical-align: middle;
                    font-size: 0.9375rem;
                }

                .data-table tr:last-child td {
                    border-bottom: none;
                }

                .data-table tr:hover td {
                    background: rgba(255, 255, 255, 0.02);
                }

                .snap-name {
                    font-weight: 500;
                    color: white;
                }

                .snap-id {
                    font-size: 0.75rem;
                    color: hsl(var(--text-muted));
                    font-family: monospace;
                    margin-top: 0.25rem;
                }

                .conn-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    opacity: 0.5;
                    transition: var(--trans-fast);
                }

                .data-table tr:hover .actions {
                    opacity: 1;
                }

                .btn-icon-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 0.5rem;
                    border: 1px solid var(--glass-border);
                    background: transparent;
                    color: hsl(var(--text-muted));
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--trans-fast);
                }

                .btn-icon-sm:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border-color: hsl(var(--primary) / 0.5);
                }

                /* Connection Type Icons (Simple colored dots for now) */
                .conn-icon {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .conn-icon.postgresql { background: #336791; }
                .conn-icon.mysql { background: #00758f; }
                .conn-icon.mongodb { background: #47a248; }
            `}</style>
        </div>
    );
}
