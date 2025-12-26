"use client";

import { useEffect, useState } from "react";

interface PromoCode {
    id: string;
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    expirationDate?: string;
}

export default function PromoCodeManagementPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        // Mocking API call
        setTimeout(() => {
            setPromos([
                { id: '1', code: 'WELCOME50', discountPercent: 50, usageCount: 12, usageLimit: 100, isActive: true, expirationAt: '2025-12-31' },
                { id: '2', code: 'BLACKFRIDAY', discountAmount: 20, usageCount: 45, usageLimit: 50, isActive: true, expirationAt: '2025-11-30' },
                { id: '3', code: 'EXPIRED_CODE', discountPercent: 10, usageCount: 5, isActive: false, expirationAt: '2024-01-01' },
            ] as any);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Promo Code Management</h2>
                <button
                    onClick={() => setShowCreate(true)}
                    style={{ background: 'var(--admin-accent)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                >
                    + Create Promo Code
                </button>
            </div>

            {loading ? (
                <div>Loading promo codes...</div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Expiration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.map(promo => (
                            <tr key={promo.id}>
                                <td style={{ fontWeight: 'bold', color: 'var(--admin-accent)' }}>{promo.code}</td>
                                <td>{promo.discountPercent ? `${promo.discountPercent}%` : `$${promo.discountAmount}`}</td>
                                <td>{promo.usageCount} / {promo.usageLimit || '∞'}</td>
                                <td>
                                    <span className={`badge ${promo.isActive ? 'badge-success' : 'badge-error'}`}>
                                        {promo.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{promo.expirationDate ? new Date(promo.expirationDate).toLocaleDateString() : 'Never'}</td>
                                <td>
                                    <button style={{ background: 'transparent', border: '1px solid var(--admin-border)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                        {promo.isActive ? 'Deactivate' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
