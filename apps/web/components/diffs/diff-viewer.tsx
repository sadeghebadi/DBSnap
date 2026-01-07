"use client"

import { Editor } from "@monaco-editor/react"
import { Loader2 } from "lucide-react"
import { useDiff } from "@/lib/hooks/use-diff"

interface DiffViewerProps {
    diffId: string
}

export function DiffViewer({ diffId }: DiffViewerProps) {
    const { diff, diffLines, isLoading, isLoadingLines } = useDiff(diffId)

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    if (!diff) {
        return <div>Diff not found</div>
    }

    if (diff.status === 'Pending' || diff.status === 'InProgress') {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Calculating Diff...</h3>
                <p className="text-muted-foreground">This may take a few moments directly depending on dataset size.</p>
            </div>
        )
    }

    if (diff.status === 'Failed') {
        return <div className="text-red-500">Diff calculation failed.</div>
    }

    // Prepare content for editor
    // In a real generic JSON diff, we might want to show two editors side-by-side
    // or a unified diff view.
    // For this MVP, let's just dump the JSON lines for now.

    // Simplification: We construct a string representation of the diff lines.
    const content = diffLines?.lines ? JSON.stringify(diffLines.lines, null, 2) : "// No diff lines found or empty diff.";

    return (
        <div className="h-[600px] border rounded-md overflow-hidden shadow-sm bg-card">
            <div className="border-b p-2 bg-muted/50 flex justify-between items-center px-4">
                <span className="text-sm font-medium">Diff Results ({diffLines?.total || 0} changes)</span>
                {/* View toggles could go here */}
            </div>
            <Editor
                height="100%"
                defaultLanguage="json"
                value={content}
                theme="vs-dark" // "light" is default
                options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                }}
            />
        </div>
    )
}
