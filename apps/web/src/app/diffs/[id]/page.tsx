'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DiffViewer } from '../../../components/diff/DiffViewer';

export default function DiffPage() {
    const params = useParams();
    const id = params.id as string;
    const [lines, setLines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch for now as we don't have the full API client setup in web yet
        async function fetchDiff() {
            setLoading(true);
            try {
                // In real implementation: fetch(`/api/diffs/${id}/lines?page=1&limit=50`)
                // For MVP visual verification, we'll simulate some data
                await new Promise(r => setTimeout(r, 1000));
                setLines([
                    { type: 'modified', doc: { _id: '1', name: 'User A', email: 'old@test.com' }, newDoc: { _id: '1', name: 'User A', email: 'new@test.com' } },
                    { type: 'added', doc: { _id: '2', name: 'User B' } },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchDiff();
    }, [id]);

    if (loading) return <div>Loading diff...</div>;

    // For demonstration, let's take the first modified item
    const firstModified = lines.find(l => l.type === 'modified');
    const original = firstModified ? JSON.stringify(firstModified.doc, null, 2) : '{}';
    const modified = firstModified ? JSON.stringify(firstModified.newDoc, null, 2) : '{}';

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Diff Viewer: {id}</h1>
            <div className="mb-4">
                <p className="text-sm text-gray-500">Showing first modification detected.</p>
            </div>
            <DiffViewer original={original} modified={modified} language="json" />
        </div>
    );
}
