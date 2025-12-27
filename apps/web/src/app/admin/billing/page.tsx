"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";
import { toast } from "react-hot-toast";

interface BillingStats {
    totalRevenue: number;
    mrr: number;
    activeSubscriptions: number;
    planDistribution: Array<{
        name: string;
        count: number;
        revenue: number;
    }>;
    churnRate: number;
}

export default function BillingDashboard() {
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getBillingStats();
                setStats(data);
            } catch (err) {
                toast.error("Failed to load billing metrics");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="animate-fade-in">Crunching numbers...</div>;
    if (!stats) return <div className="text-muted">No billing data available.</div>;

    return (
        <div className="animate-fade-in">
            <h2 className="section-title">Revenue Oversight</h2>

            <div className="admin-grid" style={{ marginBottom: '2rem' }}>
                <div className="admin-card">
                    <div className="stat-label">Total Revenue (Est.)</div>
                    <div className="stat-value" style={{ fontSize: '2rem', color: '#4ade80' }}>
                        ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Monthly Recurring Revenue (MRR)</div>
                    <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--brand-primary)' }}>
                        ${stats.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Active Subscriptions</div>
                    <div className="stat-value" style={{ fontSize: '2rem' }}>
                        {stats.activeSubscriptions}
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Churn Rate</div>
                    <div className="stat-value" style={{ fontSize: '2rem' }}>
                        {stats.churnRate.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="admin-card" style={{ padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--admin-border)' }}>
                        <h3 style={{ margin: 0 }}>Plan Performance</h3>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Plan Name</th>
                                <th>Active Subs</th>
                                <th>Current Revenue</th>
                                <th>Contribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.planDistribution.map((plan) => (
                                <tr key={plan.name}>
                                    <td style={{ fontWeight: 600 }}>{plan.name}</td>
                                    <td>{plan.count}</td>
                                    <td>${plan.revenue.toLocaleString()} / mo</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${(plan.revenue / stats.mrr) * 100}%`,
                                                    background: 'var(--brand-primary)',
                                                    borderRadius: '4px'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', width: '40px' }}>{((plan.revenue / stats.mrr) * 100).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Monetization Insights</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="info-block" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '0.5rem' }}>💡 Tip: Bundle Discounts</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {stats.churnRate > 5
                                    ? "Churn is higher than average. Consider offering annual plan discounts to improve retention."
                                    : "Churn is healthy. Focus on upselling active users to higher storage tiers."}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span className="text-muted">Average Revenue Per Lead (ARPU)</span>
                                <span>${(stats.mrr / stats.activeSubscriptions).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span className="text-muted">Projected Annual Run Rate</span>
                                <span>${(stats.mrr * 12).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
