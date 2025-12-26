"use client";

import { useEffect, useState } from "react";

interface Plan {
    id: string;
    name: string;
    price: number;
    maxSnapshots: number;
    maxConnections: number;
    storageLimitGb: number;
    activeSubscriptions: number;
}

export default function BillingManagementPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking API call
        setTimeout(() => {
            setPlans([
                { id: '1', name: 'Starter', price: 0, maxSnapshots: 5, maxConnections: 2, storageLimitGb: 1, activeSubscriptions: 450 },
                { id: '2', name: 'Professional', price: 29, maxSnapshots: 50, maxConnections: 10, storageLimitGb: 20, activeSubscriptions: 120 },
                { id: '3', name: 'Enterprise', price: 99, maxSnapshots: 500, maxConnections: 50, storageLimitGb: 200, activeSubscriptions: 15 },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div>
            <div className="admin-grid">
                <div className="admin-card">
                    <div className="stat-label">Monthly Recurring Revenue</div>
                    <div className="stat-value">$14,520</div>
                    <div style={{ color: '#4ade80', fontSize: '0.875rem', marginTop: '0.5rem' }}>↑ 8.2% from last month</div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Active Subscriptions</div>
                    <div className="stat-value">585</div>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Across 3 tiers</div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Average Revenue Per User</div>
                    <div className="stat-value">$24.8</div>
                </div>
            </div>

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Subscription Plans</h2>
                    <button style={{ background: 'var(--admin-accent)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Add Plan</button>
                </div>

                {loading ? (
                    <div>Loading plans...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Plan Name</th>
                                <th>Price</th>
                                <th>Limits</th>
                                <th>Active Subs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.id}>
                                    <td style={{ fontWeight: 600 }}>{plan.name}</td>
                                    <td>${plan.price}/mo</td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
                                        {plan.maxSnapshots} snaps • {plan.maxConnections} conns • {plan.storageLimitGb}GB
                                    </td>
                                    <td>{plan.activeSubscriptions}</td>
                                    <td>
                                        <button style={{ background: 'transparent', border: '1px solid var(--admin-border)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
