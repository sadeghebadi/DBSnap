import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type DiffStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed';

export interface Diff {
    id: string;
    snapshotAId: string;
    snapshotBId: string;
    status: DiffStatus;
    createdAt: string;
    completedAt?: string;
    summary?: any; // JSON summary
}

export function useDiff(diffId: string) {
    const queryKey = ['diff', diffId];

    const { data: diff, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await api.get<Diff>(`/diffs/${diffId}`);
            return res.data;
        },
        enabled: !!diffId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && (data.status === 'Pending' || data.status === 'InProgress')) {
                return 2000; // Poll every 2s while pending/in-progress
            }
            return false;
        }
    });

    const { data: diffLines, isLoading: isLoadingLines } = useQuery({
        queryKey: ['diff', diffId, 'lines'],
        queryFn: async () => {
            // For simplicity in this MVP, we fetch the first page or all lines if possible.
            // Real implementation would handle pagination or stream.
            const res = await api.get<{ lines: any[], total: number }>(`/diffs/${diffId}/lines?limit=1000`);
            return res.data;
        },
        enabled: !!diffId && diff?.status === 'Completed',
    });

    return {
        diff,
        diffLines,
        isLoading,
        isLoadingLines,
        error,
    };
}
