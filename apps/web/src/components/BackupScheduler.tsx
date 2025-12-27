"use client";

import { useState, useEffect } from "react";
import { BackupsService, BackupSchedule } from "../services/backups";
import { toast } from "react-hot-toast";

interface BackupSchedulerProps {
    connectionId: string;
    projectId: string;
}

export default function BackupScheduler({ connectionId, projectId }: BackupSchedulerProps) {
    const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    // New Schedule Form
    const [name, setName] = useState('');
    const [cronType, setCronType] = useState('daily');
    const [customCron, setCustomCron] = useState('0 0 * * *');
    const [retentionType, setRetentionType] = useState('count');
    const [retentionValue, setRetentionValue] = useState('5');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (connectionId && projectId) {
            loadSchedules();
        }
    }, [connectionId, projectId]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const allSchedules = await BackupsService.listSchedules(projectId);
            // Filter locally for this connection
            const mySchedules = allSchedules.filter((s: BackupSchedule) => s.connectionId === connectionId);
            setSchedules(mySchedules);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const cron = cronType === 'custom' ? customCron :
                cronType === 'daily' ? '0 0 * * *' :
                    cronType === 'hourly' ? '0 * * * *' :
                        '0 0 * * 0'; // weekly

            const payload: any = {
                name,
                cron,
                connectionId
            };

            if (retentionType === 'count') {
                payload.retentionCount = parseInt(retentionValue);
            } else {
                payload.retentionDays = parseInt(retentionValue);
            }

            await BackupsService.createSchedule(payload);
            toast.success("Schedule created!");
            setShowAdd(false);
            setName('');
            loadSchedules();
        } catch (err: any) {
            toast.error("Failed to create schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await BackupsService.deleteSchedule(id);
            toast.success("Schedule deleted");
            loadSchedules();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="scheduler-container">
            <div className="header">
                <h3>Backup Schedules</h3>
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowAdd(!showAdd)}
                    disabled={loading}
                >
                    {showAdd ? 'Cancel' : '+ Add Schedule'}
                </button>
            </div>

            {showAdd && (
                <div className="add-form glass-card">
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label>Schedule Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Daily Production Backup"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>Frequency</label>
                                <select
                                    className="input-field"
                                    value={cronType}
                                    onChange={e => setCronType(e.target.value)}
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily (Midnight)</option>
                                    <option value="weekly">Weekly (Sunday)</option>
                                    <option value="custom">Custom Cron</option>
                                </select>
                            </div>
                            {cronType === 'custom' && (
                                <div className="form-group">
                                    <label>Cron Expression</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={customCron}
                                        onChange={e => setCustomCron(e.target.value)}
                                        placeholder="* * * * *"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>Retention Type</label>
                                <select
                                    className="input-field"
                                    value={retentionType}
                                    onChange={e => setRetentionType(e.target.value)}
                                >
                                    <option value="count">Max Snapshots (Count)</option>
                                    <option value="days">Max Age (Days)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Value</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={retentionValue}
                                    onChange={e => setRetentionValue(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ marginTop: '1rem' }}
                        >
                            {isSubmitting ? 'Saving...' : 'Create Policy'}
                        </button>
                    </form>
                </div>
            )}

            <div className="schedule-list">
                {loading ? <p>Loading schedules...</p> : schedules.length === 0 ? (
                    <p className="empty-msg">No backup schedules defined.</p>
                ) : (
                    schedules.map(schedule => (
                        <div key={schedule.id} className="schedule-item glass-card">
                            <div className="schedule-info">
                                <h4>{schedule.name}</h4>
                                <div className="meta">
                                    <span className="badge">{schedule.cron}</span>
                                    <span className="badge">
                                        Retain: {schedule.retentionCount ? `${schedule.retentionCount} items` : `${schedule.retentionDays} days`}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="btn-icon delete-btn"
                                onClick={() => handleDelete(schedule.id)}
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .scheduler-container {
                    margin-top: 3rem;
                    padding-top: 3rem;
                    border-top: 1px solid var(--glass-border);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .header h3 {
                    font-size: 1.25rem;
                    color: white;
                }
                .add-form {
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    background: rgba(255,255,255,0.03);
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .input-field {
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--glass-border);
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    color: white;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .schedule-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    margin-bottom: 1rem;
                    background: rgba(255,255,255,0.02);
                }
                .schedule-info h4 {
                    margin-bottom: 0.5rem;
                }
                .meta {
                    display: flex;
                    gap: 0.5rem;
                }
                .badge {
                    font-size: 0.75rem;
                    background: rgba(255,255,255,0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    color: hsl(var(--text-muted));
                }
                .empty-msg {
                    color: hsl(var(--text-muted));
                    font-style: italic;
                }
                .delete-btn {
                    color: hsl(var(--error));
                    opacity: 0.7;
                }
                .delete-btn:hover {
                    opacity: 1;
                    background: rgba(255,0,0,0.1);
                }
                .btn-secondary {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: none;
                }
            `}</style>
        </div>
    );
}
