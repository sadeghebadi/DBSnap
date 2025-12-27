"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ConnectionsService } from "../../../../../services/connections";
import { ProjectsService } from "../../../../../services/projects";
import { toast } from "react-hot-toast";
import BackupScheduler from "../../../../../components/BackupScheduler";

export default function EditConnectionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [dbType, setDbType] = useState('postgres');

    // Form state
    const [projects, setProjects] = useState<any[]>([]);
    const [projectId, setProjectId] = useState('');

    const [name, setName] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');
    const [username, setUsername] = useState('');
    // Password is optional on edit (leave blank to keep unchanged)
    const [password, setPassword] = useState('');
    const [databaseName, setDatabaseName] = useState('');

    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                // Load params first
                const [projectsData, connData] = await Promise.all([
                    ProjectsService.list(),
                    ConnectionsService.get(id)
                ]);

                setProjects(projectsData);

                // Fill form
                setName(connData.name);
                setDbType(connData.type.toLowerCase());
                setHost(connData.host);
                setPort(connData.port.toString());
                setUsername(connData.username || '');
                setDatabaseName(connData.databaseName);
                setProjectId(connData.projectId);

                // Password is not sent back for security, so we leave it blank
            } catch (err) {
                console.error(err);
                toast.error("Failed to load connection details");
                router.push('/connections');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            init();
        }
    }, [id, router]);

    const getFormData = () => ({
        name,
        type: dbType.toUpperCase(),
        host,
        port: parseInt(port) || 5432,
        username,
        // Only send password if user entered a new one
        ...(password ? { password } : {}),
        databaseName,
        projectId: projectId
    });

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            // For testing invalid connection while editing, we might need to send the old password if field is empty
            // But usually 'test' endpoint on create expects full creds. 
            // Better to use 'testExisting' if possible, or send what we have.
            // If we use the generic test endpoint, we must provide a password if it's required for auth.
            // If the user didn't type a password, we can't test properly with the stateless endpoint unless we fetch it (which we can't).
            // Solution: Use the component-specific 'testExisting' if we are just verifying connectivity of the *saved* state, 
            // OR warn the user they need to re-enter password to test changes.

            // Let's try to test the *current form values*. 
            // If password is empty, we might fail authentication if the DB requires it.
            // But we can try 'testExisting' if the user hasn't changed credentials? 
            // Actually, the best UX is: "Test Connection" tests what is currently in the form.

            if (!password) {
                // Try asking backend to test using stored password + new form values? 
                // We don't have that endpoint. 
                // We have `POST :id/test`. That tests the *saved* connection. 
                // So if user changes Host but not Password, calling :id/test tests the OLD Host.
                // So we must use `POST test`. But we lack the password.
                // For now, let's just warn or try anyway (some DBs don't need pw).
            }

            const result = await ConnectionsService.test(getFormData());
            setTestResult({ success: result.success, message: result.message || "Connection verified successfully!" });
            if (result.success) toast.success("Connection verified!");
            else toast.error("Connection failed");
        } catch (err: any) {
            setTestResult({ success: false, message: err.message || "Connection failed" });
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ConnectionsService.update(id, getFormData());
            toast.success("Connection updated successfully");
            router.push('/connections');
        } catch (err: any) {
            toast.error(err.message || "Failed to update connection");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '50vh' }}>
                <div className="animate-fade-in">Loading connection details...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '3rem' }}>
                <Link href="/connections">
                    <span className="btn-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back to Connections</span>
                </Link>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Edit Connection</h1>
                <p style={{ color: 'hsl(var(--text-muted))' }}>Update your database source configuration</p>
            </div>

            <div className="glass-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3 className="section-title">General Information</h3>
                        <div className="input-group">
                            <label className="input-label">Connection Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. My Production DB"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Project</label>
                            <select
                                className="input-field"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Database Type</label>
                            <select
                                className="input-field"
                                value={dbType}
                                onChange={(e) => setDbType(e.target.value)}
                                style={{ appearance: 'none' }}
                                disabled // Changing type might break other things, usually better to create new
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
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="localhost"
                                    value={host}
                                    onChange={e => setHost(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Port</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder={dbType === 'postgres' ? '5432' : dbType === 'mysql' ? '3306' : '27017'}
                                    value={port}
                                    onChange={e => setPort(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label className="input-label">Username <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.7em' }}>(Optional)</span></label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="postgres"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Password <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.7em' }}>(Unchanged)</span></label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Enter new password to update"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Database Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="my_awesome_db"
                                value={databaseName}
                                onChange={e => setDatabaseName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                        <button
                            type="button"
                            className={`btn ${testing ? 'btn-loading' : ''}`}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}
                            onClick={handleTest}
                            disabled={testing || saving}
                        >
                            {testing ? "Testing..." : "Test Connection"}
                        </button>
                        <button
                            type="submit"
                            className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                            disabled={saving || testing}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
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
                            {!testResult.success && !password && (
                                <span style={{ fontSize: '0.8rem', marginLeft: 'auto', opacity: 0.8 }}>
                                    (Did you assume the old password would be used? Re-enter it to test.)
                                </span>
                            )}
                        </div>
                    )}
                </form>
            </div>

            {id && projectId && (
                <BackupScheduler connectionId={id} projectId={projectId} />
            )}

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
