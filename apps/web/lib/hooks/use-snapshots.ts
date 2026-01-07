import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type BackupStatus = 'Pending' | 'Completed' | 'Failed';

export interface Backup {
    id: string;
    databaseId: string;
    status: BackupStatus;
    sizeBytes: string; // BigInt serialized as string usually
    startedAt: string;
    completedAt?: string;
    s3Key?: string;
    database: {
        name: string;
        type: string;
    };
}

export function useSnapshots(projectId: string) {
    const queryClient = useQueryClient();
    const queryKey = ['backups', projectId];

    const { data: snapshots, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await api.get<Backup[]>(`/backups/project/${projectId}`);
            return res.data;
        },
        enabled: !!projectId,
    });

    const triggerBackup = useMutation({
        mutationFn: async (databaseId: string) => {
            const res = await api.post('/backups/trigger', { databaseId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const restoreBackup = useMutation({
        mutationFn: async (backupId: string) => {
            const res = await api.post(`/backups/${backupId}/restore`);
            return res.data;
        },
    });

    return {
        snapshots,
        isLoading,
        error,
        triggerBackup,
        restoreBackup,
    };
}
