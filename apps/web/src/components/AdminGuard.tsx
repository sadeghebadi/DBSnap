"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Mocking auth for now. In a real scenario, this would check a cookie or local storage.
const getUserRole = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_role") || "MEMBER";
};

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const role = getUserRole();
        if (role !== "ADMIN") {
            router.push("/");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
                Loading Admin Panel...
            </div>
        );
    }

    return <>{children}</>;
}
