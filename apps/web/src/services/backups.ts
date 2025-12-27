import { API_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface BackupSchedule {
    id: string;
    name: string;
    cron: string;
    retentionCount?: number;
    retentionDays?: number;
    isActive: boolean;
    connectionId: string;
}

export const BackupsService = {
    async listSchedules(projectId?: string) {
        let url = `${API_URL}/backups/user/schedules`;
        if (projectId) url += `?projectId=${projectId}`;

        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch schedules');
        return res.json();
    },

    async createSchedule(data: { name: string; cron: string; connectionId: string; retentionCount?: number; retentionDays?: number }) {
        const res = await fetch(`${API_URL}/backups/user/schedules`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create schedule');
        return res.json();
    },

    async deleteSchedule(id: string) {
        const res = await fetch(`${API_URL}/backups/user/schedules/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete schedule');
        return res.json();
    }
};
