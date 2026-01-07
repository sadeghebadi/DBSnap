import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AuditLog {
    id: string;
    userId: string | null;
    user: { email: string } | null;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    metadata: any;
    createdAt: string;
}

export interface AuditLogsResponse {
    data: AuditLog[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export function useAuditLogs(page: number = 1, limit: number = 20, filters?: { userId?: string; action?: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['audit-logs', page, limit, filters],
        queryFn: async () => {
            let url = `/audit-logs?page=${page}&limit=${limit}`;
            if (filters?.userId) url += `&userId=${filters.userId}`;
            if (filters?.action) url += `&action=${filters.action}`;

            const res = await api.get<AuditLogsResponse>(url);
            return res.data;
        },
    });

    return {
        logs: data?.data || [],
        meta: data?.meta,
        isLoading,
        error,
    };
}
