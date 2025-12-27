"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", href: "/connections", icon: "🏠" },
        { label: "Connections", href: "/connections", icon: "🔌" },
        { label: "Snapshots", href: "/snapshots", icon: "📦" },
        { label: "Settings", href: "/settings", icon: "⚙️" },
    ];

    return (
        <AuthGuard>
            <div className="dashboard-wrapper">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <span className="brand-gradient">DBSnap</span>
                    </div>

                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div className={`nav-item ${pathname === item.href ? "active" : ""}`}>
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="user-profile">
                            <div className="user-avatar">JD</div>
                            <div className="user-info">
                                <div className="user-name">John Doe</div>
                                <div className="user-role">Free Plan</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="main-stage">
                    <header className="top-bar">
                        <div className="search-placeholder">
                            <input type="text" placeholder="Search connections..." />
                        </div>
                        <div className="top-bar-actions">
                            <button className="btn-icon">🔔</button>
                            <button className="btn-icon">💬</button>
                        </div>
                    </header>

                    <main className="content">
                        {children}
                    </main>
                </div>

                <style jsx>{`
                .dashboard-wrapper {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    min-height: 100vh;
                    background: hsl(var(--bg-deep));
                }

                .sidebar {
                    background: rgba(255, 255, 255, 0.02);
                    border-right: 1px solid var(--glass-border);
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 1.5rem;
                }

                .sidebar-brand {
                    font-size: 1.5rem;
                    margin-bottom: 3rem;
                    padding-left: 0.5rem;
                }

                .sidebar-nav {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    color: hsl(var(--text-muted));
                    transition: var(--trans-fast);
                    cursor: pointer;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .nav-item.active {
                    background: hsl(var(--primary) / 0.1);
                    color: hsl(var(--primary));
                    font-weight: 500;
                }

                .sidebar-footer {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--glass-border);
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: hsl(var(--primary));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .user-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .user-role {
                    font-size: 0.75rem;
                    color: hsl(var(--text-muted));
                }

                .main-stage {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow-y: auto;
                }

                .top-bar {
                    height: 80px;
                    padding: 0 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.01);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 20;
                }

                .search-placeholder input {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    color: white;
                    width: 300px;
                }

                .top-bar-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn-icon {
                    background: transparent;
                    border: 1px solid var(--glass-border);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: var(--trans-fast);
                }

                .btn-icon:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .content {
                    padding: 3rem;
                    flex: 1;
                }
            `}</style>
            </div>
        </AuthGuard>
    );
}
