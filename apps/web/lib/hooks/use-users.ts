import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    role: { id: string; name: string } | null;
    isVerified: boolean;
    createdAt: string;
}

export interface UsersResponse {
    data: User[];
    meta: {
        total: number;
        skip: number;
        take: number;
    };
}

export function useUsers(page: number = 1, limit: number = 10) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['users', page, limit],
        queryFn: async () => {
            const res = await api.get<UsersResponse>(`/users?page=${page}&limit=${limit}`);
            return res.data;
        },
    });

    return {
        users: data?.data || [],
        meta: data?.meta,
        isLoading,
        error,
    };
}
