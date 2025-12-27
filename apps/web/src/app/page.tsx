export default function Page() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="grid-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brand-gradient">DBSnap</span>
            <br />
            Database Snapshots,
            <br />
            Simplified
          </h1>
          <p className="hero-subtitle">
            Enterprise-grade database backup and snapshot management.
            Automated, secure, and lightning-fast restoration for PostgreSQL, MongoDB, and MySQL.
          </p>
          <div className="hero-cta">
            <a href="/auth/signup" className="cta-button cta-primary">
              Get Started Free
              <span>→</span>
            </a>
            <a href="#features" className="cta-button cta-secondary">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">
          <span className="text-gradient">Powerful Features</span>
        </h2>
        <p className="section-subtitle">
          Everything you need to manage your database snapshots with confidence
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Automated Snapshots</h3>
            <p className="feature-description">
              Schedule automatic backups with CRON expressions. Set retention policies and never worry about data loss.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Encrypted</h3>
            <p className="feature-description">
              End-to-end encryption for all database credentials and snapshots. Your data stays safe, always.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Restore your databases in seconds, not hours. Optimized for performance and reliability.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Multi-Database</h3>
            <p className="feature-description">
              Support for PostgreSQL, MongoDB, and MySQL. Manage all your databases from one platform.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3 className="feature-title">Version Control</h3>
            <p className="feature-description">
              Track changes with snapshot versioning. Roll back to any point in time with ease.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Team Collaboration</h3>
            <p className="feature-description">
              Organization-based access control. Share snapshots securely with your team.
            </p>
          </div>
        </div>
      </section>

      {/* Database Support Section */}
      <section className="db-section">
        <h2 className="section-title">
          <span className="text-gradient">Supported Databases</span>
        </h2>
        <p className="section-subtitle">
          First-class support for the most popular databases
        </p>
        <div className="db-grid">
          <div className="db-card">
            <div className="db-icon">🐘</div>
            <h3 className="db-name">PostgreSQL</h3>
          </div>
          <div className="db-card">
            <div className="db-icon">🍃</div>
            <h3 className="db-name">MongoDB</h3>
          </div>
          <div className="db-card">
            <div className="db-icon">🐬</div>
            <h3 className="db-name">MySQL</h3>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2 className="section-title">
          <span className="text-gradient">Trusted by Teams</span>
        </h2>
        <div className="stats-grid">
          <div className="stat-item" style={{ animationDelay: '0s' }}>
            <div className="stat-number">10K+</div>
            <div className="stat-label">Snapshots Created</div>
          </div>
          <div className="stat-item" style={{ animationDelay: '0.1s' }}>
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item" style={{ animationDelay: '0.2s' }}>
            <div className="stat-number">&lt;30s</div>
            <div className="stat-label">Avg Restore Time</div>
          </div>
          <div className="stat-item" style={{ animationDelay: '0.3s' }}>
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <h2 className="final-cta-title">
          <span className="text-gradient">Ready to Get Started?</span>
        </h2>
        <p className="final-cta-text">
          Join hundreds of developers who trust DBSnap for their database backup needs.
          Start your free trial today.
        </p>
        <div className="hero-cta">
          <a href="/auth/signup" className="cta-button cta-primary">
            Start Free Trial
            <span>→</span>
          </a>
        </div>
      </section>

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
