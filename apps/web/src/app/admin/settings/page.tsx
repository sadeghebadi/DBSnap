"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";

export default function AdminSettingsPage() {
    const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        AdminService.getMaintenanceStatus()
            .then(status => {
                setMaintenance({
                    enabled: status.enabled,
                    message: status.message || 'System is under maintenance.'
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await AdminService.setMaintenanceMode(maintenance.enabled, maintenance.message);
            setMaintenance(prev => ({ ...prev, enabled: res.enabled }));
            alert('Settings saved!');
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-muted">Loading settings...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>System Settings</h1>

            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🚧</span> Maintenance Mode
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                        <input
                            type="checkbox"
                            checked={maintenance.enabled}
                            onChange={(e) => setMaintenance({ ...maintenance, enabled: e.target.checked })}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <span style={{ fontWeight: 500 }}>Enable Maintenance Mode</span>
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '2rem' }}>
                        When enabled, all non-admin users will be blocked from accessing the application.
                        API requests will return 503 Service Unavailable.
                    </p>
                </div>

                <div className="input-group">
                    <label className="input-label">Maintenance Message</label>
                    <textarea
                        className="input-field"
                        rows={3}
                        value={maintenance.message}
                        onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                        disabled={!maintenance.enabled}
                        style={{ opacity: maintenance.enabled ? 1 : 0.5 }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="admin-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Info</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div className="stat-label">Version</div>
                        <div style={{ fontWeight: 500, marginTop: '0.25rem' }}>v1.0.0-beta.2</div>
                    </div>
                    <div>
                        <div className="stat-label">Environment</div>
                        <div style={{ fontWeight: 500, marginTop: '0.25rem' }}>Development</div>
                    </div>
                    <div>
                        <div className="stat-label">API Endpoint</div>
                        <div style={{ fontWeight: 500, marginTop: '0.25rem' }}>http://localhost:3000/api</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
