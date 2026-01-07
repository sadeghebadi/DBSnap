import { AuditLogTable } from "@/components/admin/audit-log-table"

export default function AuditLogsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Global Audit Logs</h1>
            </div>
            <AuditLogTable />
        </div>
    )
}
