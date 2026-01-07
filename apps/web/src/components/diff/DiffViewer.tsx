'use client';

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
    original: string;
    modified: string;
    language?: 'json' | 'sql';
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified, language = 'json' }) => {
    return (
        <div className="h-[600px] w-full border border-gray-200 rounded-md overflow-hidden">
            <DiffEditor
                height="100%"
                language={language}
                original={original}
                modified={modified}
                options={{
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                }}
            />
        </div>
    );
};
