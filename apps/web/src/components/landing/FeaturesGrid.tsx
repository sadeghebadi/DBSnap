'use client';

import { Calendar, FileDiff, ShieldCheck, Database } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function FeaturesGrid() {
    return (
        <section className="relative z-10 py-24 sm:py-32" id="features">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-16 max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Everything needed
                        </span>{' '}
                        for complete peace of mind.
                    </h2>
                    <p className="text-lg text-gray-400">
                        Powerful tools to manage, secure, and track your database snapshots with enterprise-grade reliability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                    {/* Feature 1: Automated Backups - Standard */}
                    <FeatureCard
                        title="Automated Backups"
                        description="Set it and forget it. Schedule hourly, daily, or weekly backups with custom retention policies to ensure your data is always safe."
                        icon={<Calendar className="h-6 w-6" />}
                        delay={0.1}
                        className="md:col-span-2 lg:col-span-2"
                    />

                    {/* Feature 2: Visual Diff - Highlight */}
                    <FeatureCard
                        title="Visual Schema Diff"
                        description="Track schema changes over time. Compare any two snapshots to see exactly what changed in your database structure."
                        icon={<FileDiff className="h-6 w-6" />}
                        delay={0.2}
                        className="md:col-span-1 lg:row-span-2"
                    />

                    {/* Feature 3: Encryption - Standard */}
                    <FeatureCard
                        title="End-to-End Encryption"
                        description="Your credentials and data are encrypted at rest and in transit using industry-standard AES-256 encryption."
                        icon={<ShieldCheck className="h-6 w-6" />}
                        delay={0.3}
                        className="md:col-span-1"
                    />

                    {/* Feature 4: S3 Compatible - Wide */}
                    <FeatureCard
                        title="S3 Compatible Storage"
                        description="Bring your own storage. detailed support for AWS S3, Cloudflare R2, MinIO, and other S3-compatible providers."
                        icon={<Database className="h-6 w-6" />}
                        delay={0.4}
                        className="md:col-span-1 lg:col-span-2"
                    />
                </div>
            </div>
        </section>
    );
}
