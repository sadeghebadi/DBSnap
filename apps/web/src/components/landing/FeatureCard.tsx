'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    delay?: number;
    className?: string; // For grid spanning (e.g., lg-col-span-2)
}

export default function FeatureCard({
    title,
    description,
    icon,
    delay = 0,
    className = '',
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay }}
            className={`feature-card ${className}`}
        >
            <div className="hover-glow" />

            <div className="feature-icon-wrapper">
                {icon}
            </div>

            <h3 className="feature-title">
                {title}
            </h3>

            <p className="feature-description">
                {description}
            </p>
        </motion.div>
    );
}
