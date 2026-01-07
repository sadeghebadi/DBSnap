import { OrgUsageTable } from "@/components/admin/org-usage-table"

export default function OrganizationsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Organization Usage</h1>
            </div>
            <OrgUsageTable />
        </div>
    )
}
