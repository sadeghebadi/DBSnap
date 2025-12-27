"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

    // Org Details / Explorer State
    const [showExplorer, setShowExplorer] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [orgDetails, setOrgDetails] = useState<any>(null);
    const [explorerLoading, setExplorerLoading] = useState(false);
    const [showQuotaModal, setShowQuotaModal] = useState(false);

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

    const handleOpenExplorer = async (org: Organization) => {
        setSelectedOrg(org);
        setShowExplorer(true);
        setExplorerLoading(true);
        try {
            const details = await AdminService.getOrgDetails(org.id);
            setOrgDetails(details);
        } catch (err) {
            toast.error("Failed to load organization details");
        } finally {
            setExplorerLoading(false);
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
            toast.success("Quotas updated");
        } catch (err) {
            toast.error("Failed to update quotas");
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
                                        title="Explore Resources"
                                        onClick={() => handleOpenExplorer(org)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '0.5rem' }}
                                    >
                                        🔍
                                    </button>
                                    <button
                                        title="Manage Quotas"
                                        onClick={() => {
                                            setSelectedOrg(org);
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

            {showExplorer && selectedOrg && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
                    <div className="admin-card animate-slide-in" style={{ width: '900px', maxHeight: '90vh', overflow: 'auto', background: '#0f172a', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Organization Explorer: {selectedOrg.name}</h2>
                            <button className="btn" style={{ width: 'auto', background: 'transparent' }} onClick={() => setShowExplorer(false)}>✕ Close</button>
                        </div>

                        {explorerLoading ? <div style={{ textAlign: 'center', padding: '3rem' }}>Fetching organization resources...</div> : orgDetails && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--brand-primary)', marginBottom: '1rem' }}>PROJECTS & CONNECTIONS</h3>
                                    {orgDetails.projects.map((project: any) => (
                                        <div key={project.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📁 {project.name} <span className="badge" style={{ fontSize: '0.7rem' }}>{project.environment}</span></div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem' }}>
                                                {project.connections.map((conn: any) => (
                                                    <div key={conn.id} style={{ fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>🔌 {conn.name} ({conn.type})</span>
                                                        <span className="text-muted">{conn.status}</span>
                                                    </div>
                                                ))}
                                                {project.connections.length === 0 && <span className="text-muted" style={{ fontSize: '0.875rem' }}>No connections</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {orgDetails.projects.length === 0 && <div className="text-muted">No projects found.</div>}
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1rem', color: '#60a5fa', marginBottom: '1rem' }}>USAGES & SUBSCRIPTION</h3>
                                    <div className="stat-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
                                        <div className="admin-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Subscription Plan</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>{orgDetails.subscription?.plan?.name || 'FREE'}</div>
                                        </div>
                                        <div className="admin-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Users</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>{orgDetails.users.length}</div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                                {orgDetails.users.map((u: any) => (
                                                    <div key={u.id}>• {u.email}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
