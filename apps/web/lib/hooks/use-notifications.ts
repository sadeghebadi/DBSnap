import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useNotifications(projectId: string) {
    const queryClient = useQueryClient();

    const channelsQuery = useQuery({
        queryKey: ['notifications', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/notifications`);
            return data;
        },
        enabled: !!projectId,
    });

    const createChannel = useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post(`/projects/${projectId}/notifications`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', projectId] });
        },
    });

    const updateChannel = useMutation({
        mutationFn: async ({ id, ...data }: any) => {
            const { data: response } = await api.patch(`/projects/${projectId}/notifications/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', projectId] });
        },
    });

    const removeChannel = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/projects/${projectId}/notifications/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', projectId] });
        },
    });

    return {
        channels: channelsQuery.data || [],
        isLoading: channelsQuery.isLoading,
        createChannel,
        updateChannel,
        removeChannel,
    };
}
