"use client";

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    pulse?: boolean;
}

export default function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
    const displayLabel = label || status;

    return (
        <span className={`status-badge ${status} ${pulse ? 'pulse' : ''}`}>
            {pulse && <span className="pulse-dot"></span>}
            {displayLabel}

            <style jsx>{`
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .status-badge.success { background: hsl(var(--success) / 0.15); color: hsl(var(--success)); border: 1px solid hsl(var(--success) / 0.2); }
                .status-badge.warning { background: rgba(255, 165, 0, 0.15); color: orange; border: 1px solid rgba(255, 165, 0, 0.2); }
                .status-badge.error { background: hsl(var(--error) / 0.15); color: hsl(var(--error)); border: 1px solid hsl(var(--error) / 0.2); }
                .status-badge.info { background: hsl(var(--primary) / 0.15); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.2); }
                .status-badge.neutral { background: rgba(255, 255, 255, 0.1); color: hsl(var(--text-muted)); border: 1px solid rgba(255, 255, 255, 0.1); }

                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </span>
    );
}
