export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-wrapper flex-center">
            {/* Background Decorative Elements */}
            <div className="mesh-gradient"></div>
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <main className="auth-container animate-fade-in">
                {children}
            </main>

            <style jsx>{`
                .auth-wrapper {
                    min-height: 100vh;
                    width: 100%;
                    position: relative;
                    padding: 2rem;
                    background: hsl(240 20% 5%);
                    overflow: hidden;
                }

                .auth-container {
                    width: 100%;
                    max-width: 440px;
                    position: relative;
                    z-index: 10;
                }

                .mesh-gradient {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(at 0% 0%, hsla(255, 80%, 60%, 0.15) 0, transparent 50%),
                        radial-gradient(at 100% 100%, hsla(180, 100%, 50%, 0.1) 0, transparent 50%);
                    pointer-events: none;
                }

                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.15;
                    pointer-events: none;
                }

                .blob-1 {
                    width: 400px;
                    height: 400px;
                    background: hsl(255, 80%, 60%);
                    top: -100px;
                    right: -100px;
                }

                .blob-2 {
                    width: 300px;
                    height: 300px;
                    background: hsl(180, 100%, 50%);
                    bottom: -50px;
                    left: -50px;
                }
            `}</style>
        </div>
    );
}
