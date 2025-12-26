"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";

interface FailedJob {
    id: string;
    name: string;
    data: any;
    failedReason: string;
    timestamp: number;
}

interface WorkerNode {
    id: string;
    hostname: string;
    pid: number;
    uptime: number;
    memoryUsage: { rss: number; heapTotal: number; heapUsed: number };
    lastHeartbeat: number;
}

interface QueueMetrics {
    wait: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
}

export default function WorkerStatusPage() {
    const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
    const [workers, setWorkers] = useState<WorkerNode[]>([]);
    const [queueMetrics, setQueueMetrics] = useState<QueueMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [jobs, stats] = await Promise.all([
                AdminService.getFailedJobs(),
                AdminService.getStats() // Contains workerStats and queueDepth
            ]);
            setFailedJobs(jobs);
            setWorkers(stats.workerStats || []);
            setQueueMetrics(stats.queueDepth || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s for live status
        return () => clearInterval(interval);
    }, []);

    const handleRetry = async (jobId: string) => {
        setActionInProgress(jobId);
        try {
            await AdminService.retryJob(jobId);
            await fetchData();
        } catch (err) {
            alert('Failed to retry job');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleClearDLQ = async () => {
        if (!confirm('Are you sure you want to delete ALL failed jobs? This cannot be undone.')) return;
        try {
            await AdminService.clearDLQ();
            await fetchData();
        } catch (err) {
            alert('Failed to clear DLQ');
        }
    };

    const handleRestartWorker = async (workerId: string) => {
        if (!confirm('Restart this worker node?')) return;
        setActionInProgress(`restart-${workerId}`);
        try {
            await AdminService.restartWorker(workerId);
            alert('Restart signal sent to worker.');
        } catch (err) {
            alert('Failed to restart worker');
        } finally {
            setActionInProgress(null);
        }
    };

    if (loading) return <div className="text-muted">Loading worker status...</div>;

    const formatMemory = (bytes: number) => (bytes / 1024 / 1024).toFixed(0) + ' MB';

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Worker Status & Queues</h1>

            <div className="admin-grid">
                <div className="admin-card">
                    <div className="stat-label">Active Workers</div>
                    <div className="stat-value">{workers.length}</div>
                    <div className={`badge ${workers.length > 0 ? 'badge-success' : 'badge-error'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                        {workers.length > 0 ? 'Operational' : 'No Workers Found'}
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Queue Depth (Waiting)</div>
                    <div className="stat-value">{queueMetrics?.wait || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Active: {queueMetrics?.active || 0}
                    </div>
                </div>
                <div className="admin-card">
                    <div className="stat-label">Failed Jobs (DLQ)</div>
                    <div className="stat-value" style={{ color: failedJobs.length > 0 ? 'hsl(var(--error))' : 'inherit' }}>
                        {failedJobs.length}
                    </div>
                    {failedJobs.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className="badge badge-error">Attention Needed</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Active Workers List */}
                <div className="admin-card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Worker Nodes</h2>
                    {workers.length === 0 ? (
                        <div className="text-muted">No active workers connected to Redis.</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Hostname</th>
                                    <th>PID</th>
                                    <th>Memory (RSS)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map(w => (
                                    <tr key={w.id}>
                                        <td style={{ fontFamily: 'monospace' }}>{w.id.substring(0, 8)}...</td>
                                        <td>{w.hostname}</td>
                                        <td>{w.pid}</td>
                                        <td>{formatMemory(w.memoryUsage.rss)}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={() => handleRestartWorker(w.id)}
                                                disabled={!!actionInProgress}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    width: 'auto',
                                                    background: 'rgba(234, 179, 8, 0.1)',
                                                    color: '#facc15',
                                                    border: '1px solid rgba(234, 179, 8, 0.2)'
                                                }}
                                            >
                                                {actionInProgress === `restart-${w.id}` ? 'Stopping...' : 'Restart'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* DLQ List */}
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Dead Letter Queue (Failed Jobs)</h2>
                        {failedJobs.length > 0 && (
                            <button
                                className="btn"
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'hsl(var(--error))', border: '1px solid rgba(239, 68, 68, 0.2)', width: 'auto' }}
                                onClick={handleClearDLQ}
                            >
                                Clear All Failed Jobs
                            </button>
                        )}
                    </div>

                    {failedJobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                            No failed jobs found. Everything is running smoothly.
                        </div>
                    ) : (
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
                                {failedJobs.map(job => (
                                    <tr key={job.id}>
                                        <td style={{ fontFamily: 'monospace' }}>{job.id}</td>
                                        <td>{job.name}</td>
                                        <td style={{ color: 'hsl(var(--error))', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.failedReason}>
                                            {job.failedReason}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{new Date(job.timestamp).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={() => handleRetry(job.id)}
                                                disabled={!!actionInProgress}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    width: 'auto',
                                                    minWidth: '60px',
                                                    background: 'rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                {actionInProgress === job.id ? '...' : 'Retry'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
