'use client';

import { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
    text: string;
    delay?: number;
    className?: string;
}

export default function BlurText({ text, delay = 0, className = '' }: BlurTextProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div ref={ref} className={`blur-text-wrapper ${className}`}>
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className="blur-text-char"
                    style={{
                        animationDelay: `${delay + index * 0.03}s`,
                        opacity: isVisible ? 1 : 0,
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    );
}
