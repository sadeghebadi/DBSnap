import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface QueueCount {
    waiting: number;
    active: number;
    failed: number;
    delayed: number;
    completed: number;
}

export interface HealthStats {
    queues: {
        backup: QueueCount;
        restore: QueueCount;
        diff: QueueCount;
    };
    timestamp: string;
    status: string;
}

export function useHealthStats() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['health', 'stats'],
        queryFn: async () => {
            const res = await api.get<HealthStats>('/health/stats');
            return res.data;
        },
        refetchInterval: 5000, // Poll every 5 seconds
    });

    return {
        stats: data,
        isLoading,
        error,
        refetch,
    };
}
