import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type DbType = 'Postgres' | 'MongoDB' | 'MySQL';

export interface Connection {
    id: string;
    name: string;
    type: DbType;
    isStaticIp: boolean;
    createdAt: string;
}

export interface CreateConnectionParams {
    name: string;
    type: DbType;
    connectionString: string;
}

export function useConnections(projectId: string) {
    const queryClient = useQueryClient();
    const queryKey = ['connections', projectId];

    const { data: connections, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await api.get<Connection[]>(`/projects/${projectId}/connections`);
            return res.data;
        },
        enabled: !!projectId,
    });

    const createConnection = useMutation({
        mutationFn: async (data: CreateConnectionParams) => {
            const res = await api.post(`/projects/${projectId}/connections`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteConnection = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/projects/${projectId}/connections/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        connections,
        isLoading,
        error,
        createConnection,
        deleteConnection,
    };
}
