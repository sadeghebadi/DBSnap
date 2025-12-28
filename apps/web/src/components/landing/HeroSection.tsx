
'use client';

import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import LightRays from '../LightRays';
import BlurText from '../BlurText';

export default function HeroSection() {
    return (
        <section className="landing-hero">
            <LightRays />
            <div className="grid-background"></div>

            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="hero-title">
                        <BlurText text="DBSnap" delay={0} className="brand-gradient" />
                        <br />
                        <BlurText text="Database Snapshots," delay={200} />
                        <br />
                        <BlurText text="Simplified" delay={400} />
                    </h1>
                </motion.div>

                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Enterprise-grade database backup and snapshot management.
                    Automated, secure, and lightning-fast restoration for PostgreSQL, MongoDB, and MySQL.
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <Link href="/register" className="cta-button cta-primary">
                        Get Started
                        <ArrowRight size={18} />
                    </Link>

                    <a
                        href="https://github.com/dbsnap/dbsnap"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button cta-secondary"
                    >
                        <Github size={18} />
                        GitHub
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
