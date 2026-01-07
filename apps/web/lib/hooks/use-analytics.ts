import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AnalyticsOverview {
    totalUsers: number;
    totalProjects: number;
    totalDatabases: number;
    totalStorageBytes: string;
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
