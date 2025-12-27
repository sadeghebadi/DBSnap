"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../../config";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Store token and user info in localStorage
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);

                // Store user role for authorization checks
                if (data.user?.role) {
                    localStorage.setItem("user_role", data.user.role);
                }

                // Hard redirect to admin panel or dashboard based on role
                window.location.href = data.user?.role === "ADMIN" ? "/admin" : "/connections";
            } else {
                throw new Error("No access token received");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during login");
            setLoading(false);
        }
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

            {error && (
                <div style={{
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    color: "#ef4444"
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                        type="email"
                        className="input-field"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: "1rem" }}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign In"}
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
