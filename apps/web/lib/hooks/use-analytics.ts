import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AnalyticsOverview {
    totalUsers: number;
    totalProjects: number;
    totalDatabases: number;
    totalStorageBytes: string;
}

export interface TelemetryData {
    backupsLast24h: number;
    totalStorageBytes: number;
    backupSuccessRate: number;
    statusBreakdown: Array<{ status: string; count: number }>;
}

export function useAnalytics() {
    const { data: overview, isLoading, error } = useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: async () => {
            const res = await api.get<AnalyticsOverview>('/analytics/overview');
            return res.data;
        },
    });

    return {
        overview,
        isLoading,
        error,
    };
}

export function useTelemetry() {
    const { data: telemetry, isLoading, error } = useQuery({
        queryKey: ['analytics', 'telemetry'],
        queryFn: async () => {
            const res = await api.get<TelemetryData>('/analytics/telemetry');
            return res.data;
        },
    });

    return {
        telemetry,
        isLoading,
        error,
    };
}

export function useGlobalDatabases(q?: string, type?: string) {
    const { data: databases, isLoading, error } = useQuery({
        queryKey: ['admin', 'databases', q, type],
        queryFn: async () => {
            const res = await api.get<any[]>('/analytics/admin/databases', {
                params: { q, type }
            });
            return res.data;
        },
    });

    return { databases, isLoading, error };
}

export function useGlobalSnapshots(q?: string, status?: string) {
    const { data: snapshots, isLoading, error } = useQuery({
        queryKey: ['admin', 'snapshots', q, status],
        queryFn: async () => {
            const res = await api.get<any[]>('/analytics/admin/snapshots', {
                params: { q, status }
            });
            return res.data;
        },
    });

    return { snapshots, isLoading, error };
}
