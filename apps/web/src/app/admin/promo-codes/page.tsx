"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";
import { toast } from "react-hot-toast";

interface PromoCode {
    id: string;
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    expirationDate?: string;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
}

export default function PromoCodesPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: "",
        discountPercent: "",
        discountAmount: "",
        usageLimit: "",
        expirationDate: ""
    });

    const fetchPromos = async () => {
        try {
            const data = await AdminService.listPromoCodes();
            setPromos(data || []);
        } catch (err) {
            toast.error("Failed to load promo codes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AdminService.createPromoCode({
                ...newPromo,
                discountPercent: newPromo.discountPercent ? parseInt(newPromo.discountPercent) : undefined,
                discountAmount: newPromo.discountAmount ? parseFloat(newPromo.discountAmount) : undefined,
                usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit) : undefined,
                expirationDate: newPromo.expirationDate ? new Date(newPromo.expirationDate).toISOString() : undefined,
            });
            toast.success("Promo code created");
            setShowCreateModal(false);
            fetchPromos();
        } catch (err) {
            toast.error("Failed to create promo code");
        }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm("Deactivate this promo code? It cannot be reactivated.")) return;
        try {
            await AdminService.deactivatePromoCode(id);
            toast.success("Promo code deactivated");
            fetchPromos();
        } catch (err) {
            toast.error("Failed to deactivate");
        }
    };

    if (loading) return <div className="animate-fade-in">Loading coupons...</div>;

    return (
        <div className="animate-fade-in">
            <div className="admin-header-actions">
                <h2 className="section-title" style={{ margin: 0 }}>Promo Codes</h2>
                <button className="cta-button cta-primary" style={{ padding: '0.5rem 1.5rem' }} onClick={() => setShowCreateModal(true)}>
                    + Create New
                </button>
            </div>

            <div className="admin-card" style={{ padding: 0, marginTop: '2rem' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Usage</th>
                            <th>Limit</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No active campaigns.</td></tr>
                        )}
                        {promos.map((p) => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.code}</td>
                                <td>{p.discountPercent ? `${p.discountPercent}%` : `$${p.discountAmount}`}</td>
                                <td>{p.usageCount}</td>
                                <td>{p.usageLimit || '∞'}</td>
                                <td>{p.expirationDate ? new Date(p.expirationDate).toLocaleDateString() : 'Never'}</td>
                                <td>
                                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-warning'}`}>
                                        {p.isActive ? 'Active' : 'Expired'}
                                    </span>
                                </td>
                                <td>
                                    {p.isActive && (
                                        <button onClick={() => handleDeactivate(p.id)} className="text-muted" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            Deactivate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="admin-card" style={{ width: '500px', background: '#0f172a' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Generate Promo Code</h2>
                        <form onSubmit={handleCreate}>
                            <div className="input-group">
                                <label className="stat-label">CODE</label>
                                <input className="admin-input" style={{ width: '100%' }} value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} required placeholder="SAVE50" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="input-group">
                                    <label className="stat-label">DISCOUNT %</label>
                                    <input className="admin-input" type="number" style={{ width: '100%' }} value={newPromo.discountPercent} onChange={(e) => setNewPromo({ ...newPromo, discountPercent: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="stat-label">OR FLAT $</label>
                                    <input className="admin-input" type="number" style={{ width: '100%' }} value={newPromo.discountAmount} onChange={(e) => setNewPromo({ ...newPromo, discountAmount: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="input-group">
                                    <label className="stat-label">USAGE LIMIT</label>
                                    <input className="admin-input" type="number" style={{ width: '100%' }} value={newPromo.usageLimit} onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="stat-label">EXPIRY DATE</label>
                                    <input className="admin-input" type="date" style={{ width: '100%' }} value={newPromo.expirationDate} onChange={(e) => setNewPromo({ ...newPromo, expirationDate: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="cta-button cta-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="cta-button cta-primary">Create Promo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
