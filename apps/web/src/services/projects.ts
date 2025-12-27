import { API_URL } from '../config';

export interface Project {
    id: string;
    name: string;
    organizationId: string;
    createdAt: string;
}

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const ProjectsService = {
    async list() {
        const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
    },

    async create(name: string) {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
    }
};
