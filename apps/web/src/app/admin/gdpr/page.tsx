"use client";

import { useState } from "react";
import { AdminService } from "../../services/admin";
import { toast } from "react-hot-toast";

export default function GDPRPage() {
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleExport = async () => {
        if (!userId) return toast.error("User ID required");
        setLoading(true);
        try {
            const data = await AdminService.gdprAction(userId, 'export');
            setResult(data);
            toast.success("Data export generated successfully");
        } catch (err) {
            toast.error("Export failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userId) return toast.error("User ID required");
        if (!confirm("CRITICAL: This will permanently purge the user and all associated settings according to GDPR Right to be Forgotten. Proceed?")) return;

        setLoading(true);
        try {
            await AdminService.gdprAction(userId, 'delete');
            toast.success("User successfully purged from system");
            setUserId("");
            setResult(null);
        } catch (err) {
            toast.error("Delete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <h2 className="section-title">GDPR & Privacy Workbench</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
                Tools to manage Data Portability (Export) and the Right to be Forgotten (Deletion) for users and organizations.
            </p>

            <div className="admin-card">
                <div className="input-group">
                    <label className="stat-label">TARGET USER ID (UUID)</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <input
                            className="admin-input"
                            style={{ flex: 1 }}
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                        />
                        <button
                            className="cta-button cta-primary"
                            onClick={handleExport}
                            disabled={loading}
                        >
                            Export Data
                        </button>
                        <button
                            className="cta-button cta-danger"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Purge User
                        </button>
                    </div>
                </div>

                {result && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Export Outcome</h3>
                        <pre style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '400px' }}>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                        <button
                            className="cta-button cta-secondary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => {
                                const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `gdpr-export-${userId}.json`;
                                a.click();
                            }}
                        >
                            Download Export (.json)
                        </button>
                    </div>
                )}
            </div>

            <div className="admin-card" style={{ marginTop: '2rem', border: '1px solid rgba(248, 113, 113, 0.2)', background: 'rgba(248, 113, 113, 0.05)' }}>
                <h3 style={{ fontSize: '1rem', color: '#f87171', marginBottom: '1rem' }}>⚠️ Compliance Warning</h3>
                <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>• Purging a user will remove all authentication records and sessions.</li>
                    <li>• Associated snapshots and connection metadata will be anonymized or removed.</li>
                    <li>• This action is strictly reserved for "Right to be Forgotten" legal requests.</li>
                </ul>
            </div>
        </div>
    );
}
