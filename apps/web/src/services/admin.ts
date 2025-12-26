import { API_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const AdminService = {
    async getStats() {
        const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    async getOrgUsageStats() {
        const res = await fetch(`${API_URL}/admin/usage-stats`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch org usage stats');
        return res.json();
    },

    async getRecentEvents() {
        const res = await fetch(`${API_URL}/admin/events`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },

    async getFailedJobs() {
        const res = await fetch(`${API_URL}/admin/dlq`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch failed jobs');
        return res.json();
    },

    async retryJob(jobId: string) {
        const res = await fetch(`${API_URL}/admin/dlq/${jobId}/retry`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to retry job');
        return res.json();
    },

    async clearDLQ() {
        const res = await fetch(`${API_URL}/admin/dlq`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to clear DLQ');
        return res.json();
    },

    async getMaintenanceStatus() {
        const res = await fetch(`${API_URL}/admin/maintenance`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch maintenance status');
        return res.json();
    },

    async setMaintenanceMode(enabled: boolean, message?: string) {
        const res = await fetch(`${API_URL}/admin/maintenance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ enabled, message })
        });
        if (!res.ok) throw new Error('Failed to update maintenance mode');
        return res.json();
    },

    async restartWorker(workerId: string) {
        const res = await fetch(`${API_URL}/admin/workers/${workerId}/restart`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to restart worker');
        return res.json();
    },

    async listUsers(page: number = 1, limit: number = 10, search?: string) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (search) params.append('search', search);

        const res = await fetch(`${API_URL}/admin/users?${params}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    async createUser(data: { email: string; role: string; organizationId?: string }) {
        const res = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },

    async createOrganization(data: { name: string; planId?: string }) {
        const res = await fetch(`${API_URL}/admin/orgs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create organization');
        return res.json();
    },

    async impersonateUser(userId: string, adminId: string) {
        const res = await fetch(`${API_URL}/admin/users/${userId}/impersonate?adminId=${adminId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to impersonate user');
        return res.json();
    },

    async resetMFA(userId: string) {
        const res = await fetch(`${API_URL}/admin/users/${userId}/mfa-reset`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to reset MFA');
        return res.json();
    },

    async toggleUserSuspension(userId: string, isSuspended: boolean, reason?: string) {
        const endpoint = isSuspended ? 'reactivate' : 'suspend';
        const res = await fetch(`${API_URL}/admin/users/${userId}/${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ reason })
        });
        if (!res.ok) throw new Error(`Failed to ${endpoint} user`);
        return res.json();
    },

    async toggleOrgSuspension(orgId: string, isSuspended: boolean, reason?: string) {
        const endpoint = isSuspended ? 'reactivate' : 'suspend';
        const res = await fetch(`${API_URL}/admin/orgs/${orgId}/${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ reason })
        });
        if (!res.ok) throw new Error(`Failed to ${endpoint} org`);
        return res.json();
    },

    async listPromoCodes() {
        const res = await fetch(`${API_URL}/admin/promo-codes`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch promo codes');
        return res.json();
    },

    async createPromoCode(data: any) {
        const res = await fetch(`${API_URL}/admin/promo-codes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create promo code');
        return res.json();
    },

    async deactivatePromoCode(id: string) {
        const res = await fetch(`${API_URL}/admin/promo-codes/${id}/deactivate`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to deactivate promo code');
        return res.json();
    },

    async updateOrgQuotas(orgId: string, data: any) {
        const res = await fetch(`${API_URL}/admin/orgs/${orgId}/quotas`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update org quotas');
        return res.json();
    },

    async listPlans() {
        const res = await fetch(`${API_URL}/admin/plans`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch plans');
        return res.json();
    },

    // Phase 4
    async getAuditLogs() {
        const res = await fetch(`${API_URL}/admin/audit-logs`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        return res.json();
    },

    async triggerSupportAction(action: string, resourceId: string) {
        // Mock admin ID for now
        const adminId = 'admin-123';
        const res = await fetch(`${API_URL}/admin/support/action`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ action, resourceId, adminId })
        });
        if (!res.ok) throw new Error('Failed to trigger action');
        return res.json();
    },

    async searchResources(query: string) {
        const res = await fetch(`${API_URL}/admin/resources/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to search resources');
        return res.json();
    },

    async getOrgDetails(id: string) {
        const res = await fetch(`${API_URL}/admin/orgs/${id}/details`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch org details');
        return res.json();
    },

    async gdprExport(userId: string) {
        const res = await fetch(`${API_URL}/admin/users/${userId}/gdpr/export`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to export data');
        return res.blob();
    },

    async gdprDelete(userId: string) {
        const res = await fetch(`${API_URL}/admin/users/${userId}/gdpr/delete`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
    }
};
