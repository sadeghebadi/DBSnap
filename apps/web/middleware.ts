import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value || ""; // Adjust if storing in localStorage vs cookies meant for Server Components.
    // NOTE: Since the current Auth implementation stores token in localStorage on client side, 
    // middleware (server-side) cannot access it directly unless it's also set as a cookie or passed in headers.
    // FOR MVP: API routes are protected by Guards. 
    // Client-side routes: We can check localStorage in a Layout or via a client-side hook, 
    // BUT middleware is better for redirecting before render.

    // Requirement Adjustment: Since we are using localStorage for JWT (as per Auth Pages task), 
    // the middleware cannot see the token if it's not in a cookie.
    // However, for /admin routes, we should probably enforce a cookie-based session or 
    // use a client-side protection wrapper component.

    // STRATEGY CHANGE: 
    // 1. We will assume for this task that we want to implement Client-Side protection for /admin 
    //    because migrating to httpOnly cookies is a larger refactor of the Auth system.
    //    OR
    // 2. We can try to read standard authorization header if we were doing API calls, but for page loads it's cookies.

    // DECISION: To fulfill the "Middleware" requirement best effort with current architecture:
    // We will assume the user MIGHT have a cookie 'token' set (we can update login page to set it too for hybrid).
    // BUT, to be safe and robust given current "localStorage" approach:
    // I will implement a Client-Side Guard Component wrapper in `apps/web/components/admin/admin-guard.tsx` 
    // AND use it in `apps/web/app/admin/layout.tsx`.

    // Wait, the plan said "Implement middleware.ts". 
    // If I write a middleware that checks cookies, it will fail if explicit cookies aren't set.
    // I'll write the middleware to look for a cookie, but I should also update Login to set that cookie.

    // Let's stick to the plan but make it robust. 
    // If no cookie, we might not be able to protect via middleware. checking logic...

    // For the purpose of this task, I will implement the middleware logic assuming a cookie named 'token' exists.
    // If I cannot modify the Login page easily to set cookies without breaking things, I will ALSO add a client-side check.

    // Actually, I'll update the Login page to set a cookie as well. It's a small change.

    // 3. MAINTENANCE MODE CHECK
    const maintenanceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/maintenance/status`, {
        next: { revalidate: 0 } // Don't cache in middleware
    }).catch(() => null);

    if (maintenanceRes?.ok) {
        const maintenance = await maintenanceRes.json();
        if (maintenance.enabled && !request.nextUrl.pathname.startsWith('/maintenance')) {
            // Allow whitelisted IPs (if we can reliably get IP here)
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || "";
            if (!maintenance.whitelist.includes(ip)) {
                return NextResponse.redirect(new URL('/maintenance', request.url))
            }
        }
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            const decoded: any = jwtDecode(token);
            if (decoded.role !== 'ADMIN') { // Check Role
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
