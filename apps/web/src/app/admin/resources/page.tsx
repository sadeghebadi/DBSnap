"use client";

import { useState } from "react";
import { AdminService } from "../../../services/admin";

export default function AdminResourcesPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ databases: any[], snapshots: any[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: searchResources returns { databases: [], snapshots: [] } (currently mock in backend)
            const data = await AdminService.searchResources(query);
            setResults(data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-card animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Global Resource Browser</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search by ID, Name, or IP..."
                    className="input-field"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Search</button>
            </form>

            {loading && <div className="text-muted">Searching...</div>}

            {results && (
                <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Databases</h3>
                    {results.databases.length === 0 ? <p className="text-muted" style={{ fontStyle: 'italic' }}>No databases found.</p> : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {results.databases.map((db: any) => (
                                <li key={db.id} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem', borderRadius: '0.25rem' }}>
                                    {db.name} <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>({db.id})</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 style={{ marginTop: '2rem', fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Snapshots</h3>
                    {results.snapshots.length === 0 ? <p className="text-muted" style={{ fontStyle: 'italic' }}>No snapshots found.</p> : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {results.snapshots.map((snap: any) => (
                                <li key={snap.id} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem', borderRadius: '0.25rem' }}>
                                    Snapshot <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{snap.id}</span> - {snap.status}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
