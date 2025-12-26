"use client";

import { useEffect, useState } from "react";

export default function UserBillingPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Billing & Subscription</h1>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Plan</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>Starter (Free)</div>
                        <div style={{ color: '#94a3b8' }}>$0 per month</div>
                    </div>
                    <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Upgrade Plan</button>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Plan Usage</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Snapshots</span>
                                <span>2 / 5</span>
                            </div>
                            <div style={{ height: '8px', background: '#334155', borderRadius: '4px' }}>
                                <div style={{ width: '40%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Connections</span>
                                <span>1 / 2</span>
                            </div>
                            <div style={{ height: '8px', background: '#334155', borderRadius: '4px' }}>
                                <div style={{ width: '50%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '1rem' }}>Payment Method</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>No payment method on file. Upgrade to a paid plan to add one.</p>
                <div style={{ borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Billing History</h3>
                    <p style={{ color: '#94a3b8' }}>You have no past invoices.</p>
                </div>
            </div>
        </div>
    );
}
