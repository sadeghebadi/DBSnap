import { StatsCards } from "@/components/admin/stats-cards"

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-lg font-semibold md:text-2xl">Overview</h1>
            <StatsCards />
        </div>
    )
}
