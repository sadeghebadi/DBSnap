import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface OrgUsage {
    userId: string;
    email: string;
    databaseCount: number;
    snapshotCount: number;
    storageBytes: string;
}

export function useOrgAnalytics() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics', 'usage'],
        queryFn: async () => {
            const res = await api.get<OrgUsage[]>('/analytics/usage');
            return res.data;
        },
    });

    return {
        usage: data || [],
        isLoading,
        error,
    };
}
