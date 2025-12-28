'use client';

import { Calendar, FileDiff, ShieldCheck, Database } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function FeaturesGrid() {
    return (
        <section className="features-section" id="features">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="mb-16 md:mb-24">
                    <h2 className="section-title">
                        <span className="brand-gradient">Everything needed</span>
                        <br />
                        <span className="text-white">for complete peace of mind.</span>
                    </h2>
                    <p className="section-subtitle">
                        Powerful tools to manage, secure, and track your database snapshots with enterprise-grade reliability.
                    </p>
                </div>

                <div className="features-grid-bento">
                    {/* Feature 1: Automated Backups - Large spanning */}
                    <FeatureCard
                        title="Automated Backups"
                        description="Set it and forget it. Schedule hourly, daily, or weekly backups with custom retention policies to ensure your data is always safe."
                        icon={<Calendar size={24} />}
                        delay={0.1}
                        className="md-col-span-2 lg-col-span-2"
                    />

                    {/* Feature 2: Visual Diff - Height spanning */}
                    <FeatureCard
                        title="Visual Schema Diff"
                        description="Track schema changes over time. Compare any two snapshots to see exactly what changed in your database structure. Identify table additions, column type changes, and index modifications instantly."
                        icon={<FileDiff size={24} />}
                        delay={0.2}
                        className="lg-row-span-2"
                    />

                    {/* Feature 3: Encryption - Standard size */}
                    <FeatureCard
                        title="End-to-End Encryption"
                        description="Your credentials and data are encrypted at rest and in transit using industry-standard AES-256 encryption. We never see your raw data."
                        icon={<ShieldCheck size={24} />}
                        delay={0.3}
                    />

                    {/* Feature 4: S3 Compatible - Wide spanning */}
                    <FeatureCard
                        title="S3 Compatible Storage"
                        description="Bring your own storage. detailed support for AWS S3, Cloudflare R2, MinIO, and other S3-compatible providers."
                        icon={<Database size={24} />}
                        delay={0.4}
                        className="md-col-span-2 lg-col-span-2"
                    />
                </div>
            </div>
        </section>
    );
}
