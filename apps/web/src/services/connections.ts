import { API_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface Connection {
    id: string;
    name: string;
    type: string;
    host: string;
    projectId?: string;
    sshEnabled?: boolean;
    createdAt?: string;
    // Add other fields as needed based on API response
}

export const ConnectionsService = {
    async list(projectId?: string) {
        const url = projectId
            ? `${API_URL}/connections?projectId=${projectId}`
            : `${API_URL}/connections`;

        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch connections');
        return res.json();
    },

    async get(id: string) {
        const res = await fetch(`${API_URL}/connections/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch connection');
        return res.json();
    },

    async create(data: any) {
        const res = await fetch(`${API_URL}/connections`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create connection');
        return res.json();
    },

    async update(id: string, data: any) {
        const res = await fetch(`${API_URL}/connections/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update connection');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_URL}/connections/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete connection');
        return res.json();
    },

    async test(data: any) {
        const res = await fetch(`${API_URL}/connections/test`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Connection test failed');
        return res.json();
    },

    async testExisting(id: string) {
        const res = await fetch(`${API_URL}/connections/${id}/test`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Connection test failed');
        return res.json();
    }
};
