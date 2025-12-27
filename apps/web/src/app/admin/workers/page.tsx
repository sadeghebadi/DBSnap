"use client";

import { useEffect, useState } from "react";
import { AdminService } from "../../../services/admin";
import { toast } from "react-hot-toast";

interface WorkerTelemetry {
    workerId: string;
    hostname: string;
    uptime: number;
    memory: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
    };
    cpu: {
        usage: number;
    };
    activeJobs: number;
    lastSeen: string;
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<WorkerTelemetry[]>([]);
    const [loading, setLoading] = useState(true);
    const [concurrency, setConcurrency] = useState(5);

    const fetchWorkers = async () => {
        try {
            const stats = await AdminService.getStats();
            setWorkers(stats.workerStats || []);
        } catch (err) {
            console.error("Failed to fetch worker stats", err);
            toast.error("Failed to load worker statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
        const interval = setInterval(fetchWorkers, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRestart = async (workerId: string) => {
        if (!confirm(`Are you sure you want to restart worker ${workerId}?`)) return;
        try {
            await AdminService.restartWorker(workerId);
            toast.success(`Restart signal sent to ${workerId}`);
        } catch (err) {
            toast.error("Failed to send restart signal");
        }
    };

    const handleUpdateConcurrency = async () => {
        try {
            await AdminService.updateConcurrency(concurrency);
            toast.success("Concurrency limit updated globally");
        } catch (err) {
            toast.error("Failed to update concurrency");
        }
    };

    const formatMemory = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MB";

    if (loading) return <div className="animate-fade-in">Loading worker telemetry...</div>;

    return (
        <div className="animate-fade-in">
            <div className="admin-header-actions">
                <h2 className="section-title" style={{ margin: 0 }}>Worker Pool Control</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem' }}>Global Concurrency:</label>
                        <input
                            type="number"
                            className="admin-input"
                            style={{ width: '80px' }}
                            value={concurrency}
                            onChange={(e) => setConcurrency(parseInt(e.target.value))}
                        />
                    </div>
                    <button className="cta-button cta-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleUpdateConcurrency}>
                        Update
                    </button>
                    <button className="cta-button cta-secondary" style={{ padding: '0.5rem 1rem' }} onClick={fetchWorkers}>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="admin-grid" style={{ marginTop: '2rem' }}>
                {workers.length === 0 && (
                    <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💤</div>
                        <h3 className="text-muted">No active workers detected</h3>
                        <p style={{ fontSize: '0.875rem' }}>Workers report telemetry every 10 seconds.</p>
                    </div>
                )}
                {workers.map((worker) => (
                    <div key={worker.workerId} className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{worker.hostname}</h3>
                                <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{worker.workerId}</code>
                            </div>
                            <span className="badge badge-success">Online</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
                            <div className="stat-item">
                                <div className="stat-label">CPU Usage</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{worker.cpu.usage.toFixed(1)}%</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Active Jobs</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{worker.activeJobs}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Memory (Heap)</span>
                                <span>{formatMemory(worker.memory.heapUsed)} / {formatMemory(worker.memory.heapTotal)}</span>
                            </div>
                            <div className="progress-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(worker.memory.heapUsed / worker.memory.heapTotal) * 100}%`,
                                    background: 'var(--brand-primary)',
                                    borderRadius: '2px'
                                }}></div>
                            </div>
                        </div>

                        <button
                            className="cta-button cta-danger"
                            style={{ width: '100%', padding: '0.5rem' }}
                            onClick={() => handleRestart(worker.workerId)}
                        >
                            Restart Worker
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
