"use client";

import Link from "next/link";

export default function LoginPage() {
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
                    Welcome back
                </h1>
                <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.875rem" }}>
                    Enter your credentials to access your account
                </p>
            </div>

            <form onSubmit={handleSubmit}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                        <Link href="/forgot-password">
                            <span className="btn-link">Forgot?</span>
                        </Link>
                    </div>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                    Sign In
                </button>
            </form>

            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--glass-border)", textAlign: "center" }}>
                <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.875rem" }}>
                    Don't have an account?{" "}
                    <Link href="/register">
                        <span className="btn-link" style={{ fontWeight: 600 }}>Create an account</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}
