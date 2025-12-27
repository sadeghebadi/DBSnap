import { API_URL } from '../config';

export interface Snapshot {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PURGED';
    connectionName: string; // Mapped from response
    connectionType: string; // Mapped from response
    name: string; // Maybe dynamic or just "Manual Snapshot"
    size: string; // Maybe from sizeBytes
    createdAt: string;
}

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const SnapshotsService = {
    async list() {
        const res = await fetch(`${API_URL}/backups/snapshots`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch snapshots');
        return res.json();
    },

    async create(connectionId: string) {
        const res = await fetch(`${API_URL}/backups/snapshots`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ connectionId })
        });
        if (!res.ok) throw new Error('Failed to create snapshot');
        return res.json();
    }
};
