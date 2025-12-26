"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";

export default function AdminBillingPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await AdminService.listPlans();
                setPlans(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div className="admin-card animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Plans & Billing</h2>

            {loading ? <div className="text-muted">Loading plans...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {plans.map(plan => (
                        <div key={plan.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{plan.name}</h3>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>${plan.price}/mo</div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div>📦 Storage: <strong>{plan.storageLimitGb} GB</strong></div>
                                <div>📸 Snapshots: <strong>{plan.maxSnapshots}</strong></div>
                                <div>🔌 Connections: <strong>{plan.maxConnections}</strong></div>
                                <div>👥 Projects: <strong>{plan.maxProjects}</strong></div>
                            </div>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Stripe ID: <code style={{ color: '#fbbf24' }}>{plan.stripePriceId || 'N/A'}</code>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
