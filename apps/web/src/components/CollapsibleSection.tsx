"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string;
    badgeColor?: 'neutral' | 'success' | 'warning' | 'error';
}

export default function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
    badge,
    badgeColor = 'neutral'
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="collapsible-section glass-card">
            <button
                className={`section-header ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="toggle-icon">{isOpen ? '▼' : '▶'}</span>
                    <span className="section-title">{title}</span>
                </div>
                {badge && (
                    <span className={`section-badge ${badgeColor}`}>{badge}</span>
                )}
            </button>

            <div className={`section-content ${isOpen ? 'open' : ''}`}>
                <div className="content-inner">
                    {children}
                </div>
            </div>

            <style jsx>{`
                .collapsible-section {
                    padding: 0;
                    overflow: hidden;
                    margin-bottom: 1rem;
                    border: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.02);
                }

                .section-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    text-align: left;
                }

                .section-header:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .toggle-icon {
                    font-size: 0.75rem;
                    color: hsl(var(--text-muted));
                    transition: transform 0.2s ease;
                }

                .section-title {
                    font-weight: 500;
                    font-size: 1rem;
                }

                .section-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-weight: 600;
                }

                .section-badge.neutral { background: rgba(255, 255, 255, 0.1); color: hsl(var(--text-muted)); }
                .section-badge.success { background: hsl(var(--success) / 0.15); color: hsl(var(--success)); }
                .section-badge.warning { background: rgba(255, 165, 0, 0.15); color: orange; }
                .section-badge.error { background: hsl(var(--error) / 0.15); color: hsl(var(--error)); }

                .section-content {
                    max-height: 0;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                .section-content.open {
                    max-height: 2000px; /* Arbitrary large height */
                    opacity: 1;
                }

                .content-inner {
                    padding: 0 1.5rem 1.5rem 1.5rem;
                }
            `}</style>
        </div>
    );
}
