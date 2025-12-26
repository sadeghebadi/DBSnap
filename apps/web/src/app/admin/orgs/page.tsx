"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";
import { useRouter } from "next/navigation";

interface Organization {
    id: string;
    name: string;
    projectCount: number;
    connectionCount: number;
    snapshotCount: number;
    storageBytes: number;
    createdAt: string;
    isActive?: boolean;
}

export default function AdminOrgsPage() {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");

    // Quota Modal State
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [quotaOverrides, setQuotaOverrides] = useState({
        overrideMaxSnapshots: "",
        overrideMaxConnections: "",
        overrideStorageLimitGb: "",
        ignorePlanLimits: false
    });

    // Using simple fetch wrapper
    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getOrgUsageStats();
            setOrgs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AdminService.createOrganization({ name: newOrgName });
            setShowCreateModal(false);
            setNewOrgName("");
            fetchOrgs();
            alert("Organization created");
        } catch (err) {
            alert("Failed to create org");
        }
    };

    const handleToggleSuspend = async (org: Organization) => {
        if (!confirm(org.isActive === false ? "Reactivate this organization?" : "Suspend this organization?")) return;
        const reason = org.isActive !== false ? prompt("Reason for suspension:") : undefined;
        if (org.isActive !== false && !reason) return;

        try {
            await AdminService.toggleOrgSuspension(org.id, org.isActive === false, reason || undefined);
            fetchOrgs();
        } catch (err) {
            alert("Action failed");
        }
    };

    const handleUpdateQuotas = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) return;
        try {
            await AdminService.updateOrgQuotas(selectedOrg.id, {
                overrideMaxSnapshots: quotaOverrides.overrideMaxSnapshots ? parseInt(quotaOverrides.overrideMaxSnapshots) : null,
                overrideMaxConnections: quotaOverrides.overrideMaxConnections ? parseInt(quotaOverrides.overrideMaxConnections) : null,
                overrideStorageLimitGb: quotaOverrides.overrideStorageLimitGb ? parseInt(quotaOverrides.overrideStorageLimitGb) : null,
                ignorePlanLimits: quotaOverrides.ignorePlanLimits
            });
            setShowQuotaModal(false);
            fetchOrgs();
            alert("Quotas updated");
        } catch (err) {
            alert("Failed to update quotas");
        }
    };

    return (
        <div className="admin-card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Organizations</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={() => setShowCreateModal(true)}
                    >
                        + New Organization
                    </button>
                </div>
            </div>

            {loading ? <div className="text-muted">Loading organizations...</div> : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Projects</th>
                            <th>Connections</th>
                            <th>Snapshots</th>
                            <th>Storage</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orgs.map(org => (
                            <tr key={org.id} style={{ opacity: org.isActive === false ? 0.5 : 1 }}>
                                <td style={{ fontWeight: 500 }}>{org.name}</td>
                                <td>{org.projectCount}</td>
                                <td>{org.connectionCount}</td>
                                <td>{org.snapshotCount}</td>
                                <td>{(org.storageBytes / (1024 * 1024)).toFixed(2)} MB</td>
                                <td>
                                    <span className={`badge ${org.isActive === false ? 'badge-error' : 'badge-success'}`}>
                                        {org.isActive === false ? 'Suspended' : 'Active'}
                                    </span>
                                </td>
                                <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        title={org.isActive === false ? "Reactivate" : "Suspend"}
                                        onClick={() => handleToggleSuspend(org)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >
                                        {org.isActive === false ? '✅' : '🚫'}
                                    </button>
                                    <button
                                        title="Manage Quotas"
                                        onClick={() => {
                                            setSelectedOrg(org);
                                            // Initialize override values or defaults
                                            setQuotaOverrides({
                                                overrideMaxSnapshots: (org as any).overrideMaxSnapshots || "",
                                                overrideMaxConnections: (org as any).overrideMaxConnections || "",
                                                overrideStorageLimitGb: (org as any).overrideStorageLimitGb || "",
                                                ignorePlanLimits: (org as any).ignorePlanLimits || false
                                            });
                                            setShowQuotaModal(true);
                                        }}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '0.5rem' }}
                                    >
                                        ⚖️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="admin-card" style={{ width: '400px', background: '#0f172a', border: '1px solid var(--glass-border)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create Organization</h2>
                        <form onSubmit={handleCreateOrg}>
                            <div className="input-group">
                                <label className="input-label">Organization Name</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    required
                                    value={newOrgName}
                                    onChange={e => setNewOrgName(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" style={{ width: 'auto', background: 'transparent' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showQuotaModal && selectedOrg && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="admin-card" style={{ width: '500px', background: '#0f172a', border: '1px solid var(--glass-border)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Manage Quotas: {selectedOrg.name}</h2>
                        <form onSubmit={handleUpdateQuotas}>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={quotaOverrides.ignorePlanLimits}
                                        onChange={e => setQuotaOverrides({ ...quotaOverrides, ignorePlanLimits: e.target.checked })}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    Ignore Plan Limits (Unlimited)
                                </label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: quotaOverrides.ignorePlanLimits ? 0.5 : 1 }}>
                                <div className="input-group">
                                    <label className="input-label">Max Snapshots</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        disabled={quotaOverrides.ignorePlanLimits}
                                        placeholder="Default"
                                        value={quotaOverrides.overrideMaxSnapshots}
                                        onChange={e => setQuotaOverrides({ ...quotaOverrides, overrideMaxSnapshots: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Max Connections</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        disabled={quotaOverrides.ignorePlanLimits}
                                        placeholder="Default"
                                        value={quotaOverrides.overrideMaxConnections}
                                        onChange={e => setQuotaOverrides({ ...quotaOverrides, overrideMaxConnections: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Storage Limit (GB)</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        disabled={quotaOverrides.ignorePlanLimits}
                                        placeholder="Default"
                                        value={quotaOverrides.overrideStorageLimitGb}
                                        onChange={e => setQuotaOverrides({ ...quotaOverrides, overrideStorageLimitGb: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" style={{ width: 'auto', background: 'transparent' }} onClick={() => setShowQuotaModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
