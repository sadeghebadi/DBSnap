import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Database, FileDiff, Zap, Bell, Settings } from "lucide-react"

export function ProjectNav({ projectId }: { projectId: string }) {
    const pathname = usePathname()

    const navItems = [
        {
            title: "Snapshots",
            href: `/dashboard/projects/${projectId}/snapshots`,
            icon: Database,
        },
        {
            title: "Connections",
            href: `/dashboard/projects/${projectId}/connections`,
            icon: Zap,
        },
        {
            title: "Notifications",
            href: `/dashboard/projects/${projectId}/settings/notifications`,
            icon: Bell,
        },
    ]

    return (
        <nav className="flex items-center space-x-4 lg:space-x-6 border-b px-8 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                        pathname.startsWith(item.href)
                            ? "text-primary border-b-2 border-primary h-14"
                            : "text-muted-foreground"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}
