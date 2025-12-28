
import LandingLayout from '@/components/landing/LandingLayout';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';

export default function Page() {
  return (
    <LandingLayout>
      <HeroSection />

      <FeaturesGrid />

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
    </LandingLayout>
  );
}
