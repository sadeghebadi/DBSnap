
import AdminGuard from "../../components/AdminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <div className="admin-logo">
                        <span>🚀</span> DBSnap Admin
                    </div>
                    <nav className="admin-nav">
                        <a href="/admin" className="admin-nav-item active">
                            <span>📊</span> Dashboard
                        </a>
                        <a href="/admin/users" className="admin-nav-item">
                            <span>👥</span> Users
                        </a>
                        <a href="/admin/orgs" className="admin-nav-item">
                            <span>🏢</span> Usage Stats
                        </a>
                        <a href="/admin/workers" className="admin-nav-item">
                            <span>⚙️</span> Worker Status
                        </a>
                        <a href="/admin/billing" className="admin-nav-item">
                            <span>💳</span> Billing & Plans
                        </a>
                        <a href="/admin/promo-codes" className="admin-nav-item">
                            <span>🎟️</span> Promo Codes
                        </a>
                        <a href="/admin/audit" className="admin-nav-item">
                            <span>📜</span> Audit Logs
                        </a>
                        <a href="/admin/settings" className="admin-nav-item">
                            <span>🛠️</span> System Settings
                        </a>
                    </nav>
                    <div style={{ marginTop: 'auto' }}>
                        <a href="/" className="admin-nav-item" style={{ border: '1px solid var(--admin-border)' }}>
                            <span>⬅️</span> Back to Client
                        </a>
                    </div>
                </aside>
                <main className="admin-main">
                    <header className="admin-header">
                        <h1 className="admin-header-title">Admin Dashboard</h1>
                        <div className="admin-user-info">
                            <span style={{ marginRight: '1rem', color: 'var(--admin-text-muted)' }}>admin@dbsnap.com</span>
                            <button style={{ background: 'transparent', border: '1px solid var(--admin-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>Logout</button>
                        </div>
                    </header>
                    <div className="admin-content">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
