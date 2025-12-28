'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    delay?: number;
    className?: string; // Allow additional classes for grid spanning
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
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay }}
            className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-white/20 transition-colors duration-300 ${className}`}
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
