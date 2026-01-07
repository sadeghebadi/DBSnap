
import { useState, useEffect } from 'react';
import api from '../../lib/api';

interface ComplianceExport {
    id: string;
    status: string;
    createdAt: string;
    url?: string; // or s3Key
}

interface DataExportButtonProps {
    userId: string;
}

export function DataExportButton({ userId }: DataExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [exports, setExports] = useState<ComplianceExport[]>([]);

    useEffect(() => {
        loadExports();
    }, [userId]);

    const loadExports = async () => {
        try {
            const res = await api.get(`/compliance/${userId}/exports`);
            setExports(res.data);
        } catch (error) {
            console.error("Failed to load exports", error);
        }
    };

    const handleRequestExport = async () => {
        setLoading(true);
        try {
            await api.post(`/compliance/${userId}/export`);
            alert('Export requested successfully');
            loadExports(); // Refresh list
        } catch (error) {
            console.error('Failed to request export', error);
            alert('Failed to request export');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded bg-white dark:bg-gray-800 mt-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">Data Exports</h3>
                    <p className="text-sm text-gray-500">Request a full export of user data (GDPR Right to Access).</p>
                </div>
                <button
                    onClick={handleRequestExport}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Requesting...' : 'New Export'}
                </button>
            </div>

            {exports.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-medium mb-2">Recent Exports</h4>
                    <ul className="space-y-2">
                        {exports.map((exp) => (
                            <li key={exp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">
                                    {new Date(exp.createdAt).toLocaleString()} - <span className={`font-semibold ${exp.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>{exp.status}</span>
                                </span>
                                {exp.status === 'COMPLETED' && (
                                    <button className="text-blue-600 hover:underline text-sm" disabled>
                                        Download (Stub)
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
