"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";
import { toast } from "react-hot-toast";

interface FailedJob {
    id: string;
    name: string;
    data: any;
    failedReason: string;
    stacktrace: string[];
    timestamp: number;
}

export default function DLQPage() {
    const [jobs, setJobs] = useState<FailedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<FailedJob | null>(null);

    const fetchJobs = async () => {
        try {
            const data = await AdminService.getFailedJobs();
            setJobs(data || []);
        } catch (err) {
            console.error("Failed to fetch failed jobs", err);
            toast.error("Failed to load DLQ data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleRetry = async (id: string) => {
        try {
            await AdminService.retryJob(id);
            toast.success("Job moved to active queue");
            fetchJobs();
            if (selectedJob?.id === id) setSelectedJob(null);
        } catch (err) {
            toast.error("Failed to retry job");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to permanently delete all failed jobs?")) return;
        try {
            await AdminService.clearDLQ();
            toast.success("Dead Letter Queue cleared");
            fetchJobs();
            setSelectedJob(null);
        } catch (err) {
            toast.error("Failed to clear DLQ");
        }
    };

    if (loading) return <div className="animate-fade-in">Loading dead letter queue...</div>;

    return (
        <div className="animate-fade-in">
            <div className="admin-header-actions">
                <h2 className="section-title" style={{ margin: 0 }}>Dead Letter Queue (DLQ)</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="cta-button cta-danger" style={{ padding: '0.5rem 1rem' }} onClick={handleClearAll} disabled={jobs.length === 0}>
                        Clear All Failed
                    </button>
                    <button className="cta-button cta-secondary" style={{ padding: '0.5rem 1rem' }} onClick={fetchJobs}>
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1fr' : '1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Name</th>
                                <th>Reason</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No failed jobs found. System is healthy! ✨
                                    </td>
                                </tr>
                            )}
                            {jobs.map((job) => (
                                <tr
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    style={{ cursor: 'pointer', background: selectedJob?.id === job.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                                >
                                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{job.id}</td>
                                    <td><span className="badge badge-info">{job.name}</span></td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {job.failedReason}
                                    </td>
                                    <td>{new Date(job.timestamp).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="cta-button cta-primary"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                            onClick={(e) => { e.stopPropagation(); handleRetry(job.id); }}
                                        >
                                            Retry
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedJob && (
                    <div className="admin-card animate-slide-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Error Details</h3>
                            <button className="text-muted" onClick={() => setSelectedJob(null)}>✕</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="stat-label">FAILED REASON</label>
                            <div style={{ color: '#f87171', fontWeight: 500, marginTop: '0.5rem' }}>{selectedJob.failedReason}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="stat-label">JOB DATA</label>
                            <pre style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                marginTop: '0.5rem',
                                overflow: 'auto'
                            }}>
                                {JSON.stringify(selectedJob.data, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <label className="stat-label">STACK TRACE</label>
                            <pre style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                marginTop: '0.5rem',
                                color: 'var(--text-muted)',
                                overflow: 'auto',
                                maxHeight: '300px'
                            }}>
                                {selectedJob.stacktrace.join('\n')}
                            </pre>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="cta-button cta-primary"
                                style={{ flex: 1 }}
                                onClick={() => handleRetry(selectedJob.id)}
                            >
                                Retry Job
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
