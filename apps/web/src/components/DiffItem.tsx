"use client";

interface DiffItemProps {
    type: 'added' | 'removed' | 'modified';
    keyName?: string;
    oldValue?: any;
    newValue?: any;
}

export default function DiffItem({ type, keyName, oldValue, newValue }: DiffItemProps) {
    const formatValue = (val: any) => {
        if (typeof val === 'object' && val !== null) return JSON.stringify(val, null, 2);
        return String(val);
    };

    return (
        <div className={`diff-item ${type}`}>
            <div className="diff-header">
                <span className={`diff-tag ${type}`}>{type}</span>
                {keyName && <span className="diff-key">{keyName}</span>}
            </div>

            <div className="diff-body">
                {type === 'modified' ? (
                    <div className="diff-comparison">
                        <div className="val old">
                            <span className="sc-label">Old:</span>
                            <pre>{formatValue(oldValue)}</pre>
                        </div>
                        <div className="arrow">→</div>
                        <div className="val new">
                            <span className="sc-label">New:</span>
                            <pre>{formatValue(newValue)}</pre>
                        </div>
                    </div>
                ) : (
                    <div className={`val single ${type}`}>
                        <pre>{formatValue(newValue !== undefined ? newValue : oldValue)}</pre>
                    </div>
                )}
            </div>

            <style jsx>{`
                .diff-item {
                    margin-bottom: 0.5rem;
                    border-radius: 0.5rem;
                    border: 1px solid transparent;
                    overflow: hidden;
                    font-size: 0.875rem;
                }

                .diff-item.added { background: rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.2); }
                .diff-item.removed { background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); }
                .diff-item.modified { background: rgba(234, 179, 8, 0.05); border-color: rgba(234, 179, 8, 0.2); }

                .diff-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(0, 0, 0, 0.1);
                }

                .diff-tag {
                    font-size: 0.625rem;
                    text-transform: uppercase;
                    font-weight: 700;
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                }

                .diff-tag.added { color: #4ade80; background: rgba(34, 197, 94, 0.1); }
                .diff-tag.removed { color: #f87171; background: rgba(239, 68, 68, 0.1); }
                .diff-tag.modified { color: #facc15; background: rgba(234, 179, 8, 0.1); }

                .diff-key {
                    color: hsl(var(--text-muted));
                    font-family: monospace;
                }

                .diff-body {
                    padding: 0.75rem 1rem;
                }

                .diff-comparison {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .val {
                    font-family: monospace;
                    word-break: break-all;
                    white-space: pre-wrap;
                }

                .val.single.added { color: #4ade80; }
                .val.single.removed { color: #f87171; }
                
                .val.old { color: #f87171; opacity: 0.8; flex: 1; }
                .val.new { color: #4ade80; flex: 1; }
                
                .arrow { color: hsl(var(--text-muted)); padding-top: 1.25rem; }

                .sc-label {
                    display: block;
                    font-size: 0.625rem;
                    color: hsl(var(--text-muted));
                    margin-bottom: 0.25rem;
                    text-transform: uppercase;
                }
            `}</style>
        </div>
    );
}
