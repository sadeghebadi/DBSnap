import { StatsCards } from "@/components/admin/stats-cards"
import { QuickActions } from "@/components/admin/quick-actions"
import { MaintenanceToggle } from "@/components/admin/maintenance-toggle"

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-lg font-semibold md:text-2xl">Overview</h1>
            <StatsCards />

            <h2 className="text-lg font-semibold md:text-xl">Quick Actions</h2>
            <QuickActions />

            <h2 className="text-lg font-semibold md:text-xl font-bold mt-4">System Settings</h2>
            <MaintenanceToggle />
        </div>
    )
}
