
import { useState } from 'react';
import api from '../../lib/api';

interface LegalHoldToggleProps {
    userId: string;
    initialStatus: boolean;
}

export function LegalHoldToggle({ userId, initialStatus }: LegalHoldToggleProps) {
    const [isLegalHold, setIsLegalHold] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const newState = !isLegalHold;
            await api.patch(`/compliance/legal-hold/${userId}`, { isLegalHold: newState });
            setIsLegalHold(newState);
        } catch (error) {
            console.error('Failed to toggle legal hold', error);
            alert('Failed to update legal hold status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-2 p-4 border rounded bg-white dark:bg-gray-800">
            <div className="flex-1">
                <h3 className="font-semibold text-lg">Legal Hold</h3>
                <p className="text-sm text-gray-500">
                    Prevent data deletion for this user. Required for compliance in some cases.
                </p>
            </div>
            <div>
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${isLegalHold
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {loading ? 'Updating...' : isLegalHold ? 'Active' : 'Inactive'}
                </button>
            </div>
        </div>
    );
}
