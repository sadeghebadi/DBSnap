"use client";

import Link from "next/link";
import { useState } from "react";

export default function AddConnectionPage() {
    const [dbType, setDbType] = useState('postgres');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        // Simulate API call
        setTimeout(() => {
            setTesting(false);
            setTestResult({ success: true, message: "Connection verified successfully!" });
        }, 1500);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '3rem' }}>
                <Link href="/connections">
                    <span className="btn-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back to Connections</span>
                </Link>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Add New Connection</h1>
                <p style={{ color: 'hsl(var(--text-muted))' }}>Configure your database source credentials</p>
            </div>

            <div className="glass-card">
                <form>
                    <div className="form-section">
                        <h3 className="section-title">General Information</h3>
                        <div className="input-group">
                            <label className="input-label">Connection Name</label>
                            <input type="text" className="input-field" placeholder="e.g. My Production DB" required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Database Type</label>
                            <select
                                className="input-field"
                                value={dbType}
                                onChange={(e) => setDbType(e.target.value)}
                                style={{ appearance: 'none' }}
                            >
                                <option value="postgres">PostgreSQL</option>
                                <option value="mysql">MySQL</option>
                                <option value="mongodb">MongoDB</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Credentials</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label className="input-label">Host</label>
                                <input type="text" className="input-field" placeholder="localhost" required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Port</label>
                                <input type="number" className="input-field" placeholder={dbType === 'postgres' ? '5432' : dbType === 'mysql' ? '3306' : '27017'} required />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label className="input-label">Username</label>
                                <input type="text" className="input-field" placeholder="postgres" required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <input type="password" className="input-field" placeholder="••••••••" required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Database Name</label>
                            <input type="text" className="input-field" placeholder="my_awesome_db" required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                        <button
                            type="button"
                            className={`btn ${testing ? 'btn-loading' : ''}`}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}
                            onClick={handleTest}
                            disabled={testing}
                        >
                            {testing ? "Testing..." : "Test Connection"}
                        </button>
                        <button type="submit" className="btn btn-primary">Save Connection</button>
                    </div>

                    {testResult && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            background: testResult.success ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--error) / 0.1)',
                            border: `1px solid ${testResult.success ? 'hsl(var(--success) / 0.3)' : 'hsl(var(--error) / 0.3)'}`,
                            color: testResult.success ? 'hsl(var(--success))' : 'hsl(var(--error))',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span>{testResult.success ? "✅" : "❌"}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{testResult.message}</span>
                        </div>
                    )}
                </form>
            </div>

            <style jsx>{`
                .form-section {
                    margin-bottom: 3rem;
                }

                .section-title {
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: hsl(var(--primary));
                    margin-bottom: 1.5rem;
                }

                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .btn-loading {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
