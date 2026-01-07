import { StatsCards } from "@/components/admin/stats-cards"
import { QuickActions } from "@/components/admin/quick-actions"

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-lg font-semibold md:text-2xl">Overview</h1>
            <StatsCards />

            <h2 className="text-lg font-semibold md:text-xl">Quick Actions</h2>
            <QuickActions />
        </div>
    )
}
