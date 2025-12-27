"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for authentication token
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
            router.push("/login"); // Redirect to login if no token found
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Show a loading screen while checking authentication to prevent flashing protected content
    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'hsl(var(--bg-deep))', // Use theme background
                color: 'white'
            }}>
                <div className="animate-fade-in">
                    Loading...
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
