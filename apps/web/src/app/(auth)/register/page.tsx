"use client";

import Link from "next/link";

export default function RegisterPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Integration with Auth API will happen next
    };

    return (
        <div className="glass-card">
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <span className="brand-gradient" style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>
                    DBSnap
                </span>
                <h1 className="text-gradient" style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>
                    Get started
                </h1>
                <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.875rem" }}>
                    Create your account to start managing backups
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                        type="email"
                        className="input-field"
                        placeholder="name@company.com"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Password</label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                    Create Account
                </button>
            </form>

            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--glass-border)", textAlign: "center" }}>
                <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.875rem" }}>
                    Already have an account?{" "}
                    <Link href="/login">
                        <span className="btn-link" style={{ fontWeight: 600 }}>Sign in instead</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}
