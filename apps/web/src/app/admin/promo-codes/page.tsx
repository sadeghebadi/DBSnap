"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";

interface PromoCode {
    id: string;
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    expirationDate?: string;
    planId?: string;
}

export default function AdminPromoCodesPage() {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state
    const [newCode, setNewCode] = useState("");
    const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
    const [discountValue, setDiscountValue] = useState(10);
    const [usageLimit, setUsageLimit] = useState<number | "">("");
    const [expirationDate, setExpirationDate] = useState("");

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const data = await AdminService.listPromoCodes();
            setCodes(data);
        } catch (err) {
            console.error("Failed to fetch promo codes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AdminService.createPromoCode({
                code: newCode,
                discountPercent: discountType === 'percent' ? discountValue : undefined,
                discountAmount: discountType === 'amount' ? discountValue : undefined,
                usageLimit: usageLimit || undefined,
                expirationDate: expirationDate || undefined
            });
            setShowCreateModal(false);
            setNewCode("");
            setDiscountValue(10);
            fetchCodes();
            alert("Promo Code Created!");
        } catch (err) {
            alert("Failed to create code");
        }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm("Deactivate this code? Users will no longer be able to use it.")) return;
        try {
            await AdminService.deactivatePromoCode(id);
            fetchCodes();
        } catch (err) {
            alert("Failed to deactivate");
        }
    };

    return (
        <div className="admin-card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Promo Codes</h2>
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => setShowCreateModal(true)}
                >
                    + New Code
                </button>
            </div>

            {loading ? <div className="text-muted">Loading...</div> : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Usage</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map(code => (
                            <tr key={code.id} style={{ opacity: code.isActive ? 1 : 0.5 }}>
                                <td style={{ fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>{code.code}</td>
                                <td>
                                    {code.discountPercent ? `${code.discountPercent}%` : `$${code.discountAmount}`}
                                </td>
                                <td>
                                    {code.usageCount} {code.usageLimit ? `/ ${code.usageLimit}` : '(Unlimited)'}
                                </td>
                                <td>
                                    {code.expirationDate ? new Date(code.expirationDate).toLocaleDateString() : 'Never'}
                                </td>
                                <td>
                                    <span className={`badge ${code.isActive ? 'badge-success' : 'badge-warning'}`}>
                                        {code.isActive ? 'Active' : 'Expired/Deactivated'}
                                    </span>
                                </td>
                                <td>
                                    {code.isActive && (
                                        <button
                                            onClick={() => handleDeactivate(code.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 500 }}
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {codes.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.5)" }}>
                                    No promo codes found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="admin-card" style={{ width: '450px', background: '#0f172a', border: '1px solid var(--glass-border)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create Promo Code</h2>
                        <form onSubmit={handleCreate}>
                            <div className="input-group">
                                <label className="input-label">Code (e.g. WELCOME20)</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    required
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                                    placeholder="SUMMER-SALE"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Type</label>
                                    <select
                                        className="input-field"
                                        value={discountType}
                                        onChange={e => setDiscountType(e.target.value as "percent" | "amount")}
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="amount">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Value</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        required
                                        min="1"
                                        value={discountValue}
                                        onChange={e => setDiscountValue(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Usage Limit (Optional)</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    min="1"
                                    placeholder="Leave empty for unlimited"
                                    value={usageLimit}
                                    onChange={e => setUsageLimit(e.target.value ? parseInt(e.target.value) : "")}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Expiration Date (Optional)</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={expirationDate}
                                    onChange={e => setExpirationDate(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" style={{ width: 'auto', background: 'transparent' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Create Code</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
