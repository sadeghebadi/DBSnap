"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import DiffViewer from "../../../components/DiffViewer";

export default function DiffPage({ params }: { params: { id: string } }) {
    const [diffData, setDiffData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock diff data
        setTimeout(() => {
            setDiffData({
                meta: {
                    snapshotA: "Snap-001 (Yesterday)",
                    snapshotB: "Snap-002 (Today)",
                    totalChanges: 5
                },
                collections: {
                    "users": [
                        { type: "modified", docId: "user_123", oldValue: { role: "member" }, newValue: { role: "admin" } },
                        { type: "added", docId: "user_999", newValue: { id: "user_999", name: "New User", role: "member" } }
                    ],
                    "orders": [
                        { type: "removed", docId: "order_555", oldValue: { id: "order_555", amount: 120, status: "pending" } },
                        { type: "modified", docId: "order_556", oldValue: { status: "processing" }, newValue: { status: "shipped" } },
                        { type: "modified", docId: "order_557", oldValue: { total: 49.99 }, newValue: { total: 59.99 } }
                    ]
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '50vh' }}>
            <div className="animate-fade-in">Loading comparison...</div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/snapshots">
                    <span className="btn-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back to Snapshots</span>
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Snapshot Comparison</h1>
                        <p style={{ color: 'hsl(var(--text-muted))' }}>
                            Comparing <span style={{ color: 'white' }}>{diffData.meta.snapshotA}</span> vs <span style={{ color: 'white' }}>{diffData.meta.snapshotB}</span>
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', marginRight: '0.5rem' }}>Total Changes</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--accent))' }}>{diffData.meta.totalChanges}</span>
                    </div>
                </div>
            </div>

            <DiffViewer diffData={diffData} />
        </div>
    );
}
