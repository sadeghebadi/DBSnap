import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function usePromoCodes() {
    const queryClient = useQueryClient();

    const promoCodesQuery = useQuery({
        queryKey: ['promo-codes'],
        queryFn: async () => {
            const res = await api.get('/billing/promo-codes');
            return res.data;
        },
    });

    const createPromoCodeMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/billing/promo-codes', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
        },
    });

    const deactivatePromoCodeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/billing/promo-codes/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
        },
    });

    return {
        promoCodes: promoCodesQuery.data || [],
        isLoading: promoCodesQuery.isLoading,
        createPromoCode: createPromoCodeMutation.mutateAsync,
        isCreating: createPromoCodeMutation.isPending,
        deactivatePromoCode: deactivatePromoCodeMutation.mutateAsync,
    };
}
