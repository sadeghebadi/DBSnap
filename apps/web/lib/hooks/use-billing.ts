import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface BillingStatus {
    plan: 'FREE' | 'PRO' | 'TEAM';
    usage: {
        projects: number;
        databases: number;
    };
    limits: {
        projects: number;
        databases: number;
    };
    isOverLimit: boolean;
}

export function useBilling() {
    const queryClient = useQueryClient();

    const { data: status, isLoading, error } = useQuery({
        queryKey: ['billing', 'status'],
        queryFn: async () => {
            const res = await api.get<BillingStatus>('/billing/status');
            return res.data;
        },
    });

    const upgradeMutation = useMutation({
        mutationFn: async (plan: 'FREE' | 'PRO' | 'TEAM') => {
            const res = await api.post('/billing/upgrade', { plan });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
        },
    });

    return {
        status,
        isLoading,
        error,
        upgrade: upgradeMutation.mutate,
        isUpgrading: upgradeMutation.isPending,
    };
}
