"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Settings,
    Database,
    Activity,
    CreditCard,
    Shield,
    Tag
} from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Organizations",
        href: "/admin/organizations",
        icon: Shield,
    },
    {
        title: "Queues & Workers",
        href: "/admin/queues",
        icon: Activity,
    },
    {
        title: "Resource Browser",
        href: "/admin/browser",
        icon: Database,
    },
    {
        title: "Billing",
        href: "/admin/billing",
        icon: CreditCard,
    },
    {
        title: "Promo Codes",
        href: "/admin/promo-codes",
        icon: Tag,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden h-screen w-64 flex-col overflow-y-auto border-r bg-muted/40 px-4 py-8 md:flex">
            <div className="mb-8 flex items-center px-2">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Database className="h-6 w-6" />
                    <span>DBSnap Admin</span>
                </Link>
            </div>
            <nav className="grid gap-2 text-sm font-medium">
                {sidebarItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                isActive ? "bg-muted text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
