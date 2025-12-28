
import React from 'react';

interface LandingLayoutProps {
    children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
    return (
        <div className="landing-page">
            <main>{children}</main>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>DBSnap</h3>
                        <ul className="footer-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="/pricing">Pricing</a></li>
                            <li><a href="/docs">Documentation</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Product</h3>
                        <ul className="footer-links">
                            <li><a href="/changelog">Changelog</a></li>
                            <li><a href="/roadmap">Roadmap</a></li>
                            <li><a href="/status">Status</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Company</h3>
                        <ul className="footer-links">
                            <li><a href="/about">About</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/careers">Careers</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Legal</h3>
                        <ul className="footer-links">
                            <li><a href="/privacy">Privacy</a></li>
                            <li><a href="/terms">Terms</a></li>
                            <li><a href="/security">Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 DBSnap. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
