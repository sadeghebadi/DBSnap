
import { useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';

interface DeleteUserDangerZoneProps {
    userId: string;
    isLegalHold: boolean;
}

export function DeleteUserDangerZone({ userId, isLegalHold }: DeleteUserDangerZoneProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (isLegalHold) {
            alert('Cannot delete user: Legal Hold is active.');
            return;
        }

        if (!window.confirm('Are you ABSOLUTELY sure? This action cannot be undone and will permanently delete the user and all their data.')) {
            return;
        }

        const verification = prompt('Type "DELETE" to confirm:');
        if (verification !== 'DELETE') return;

        setLoading(true);
        try {
            await api.delete(`/compliance/${userId}/data`);
            alert('User deleted successfully');
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Failed to delete user', error);
            alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/10 mt-8">
            <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">Danger Zone</h3>
            <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                    Permanently delete this user and all associated data. This action is irreversible.
                </p>
                <button
                    onClick={handleDelete}
                    disabled={loading || isLegalHold}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isLegalHold ? "Cannot delete while Legal Hold is active" : "Delete User"}
                >
                    {loading ? 'Deleting...' : 'Delete User'}
                </button>
            </div>
            {isLegalHold && (
                <p className="text-xs text-red-500 mt-2 font-semibold">
                    Delete is disabled because Legal Hold is active.
                </p>
            )}
        </div>
    );
}
