"use client";

import CollapsibleSection from "./CollapsibleSection";
import DiffItem from "./DiffItem";

interface DiffViewerProps {
    diffData: any;
}

export default function DiffViewer({ diffData }: DiffViewerProps) {
    if (!diffData || !diffData.collections) {
        return <div className="text-muted">No diff data available.</div>;
    }

    return (
        <div className="diff-viewer">
            {Object.keys(diffData.collections).map((collectionName) => {
                const changes = diffData.collections[collectionName];
                const changeCount = changes.length;

                return (
                    <CollapsibleSection
                        key={collectionName}
                        title={`Collection: ${collectionName}`}
                        badge={`${changeCount} changes`}
                        badgeColor="warning"
                        defaultOpen={true}
                    >
                        {changes.map((change: any, idx: number) => (
                            <DiffItem
                                key={idx}
                                type={change.type}
                                keyName={change.docId} // Assuming docId is the key for now
                                oldValue={change.oldValue}
                                newValue={change.newValue}
                            />
                        ))}
                    </CollapsibleSection>
                );
            })}
        </div>
    );
}
