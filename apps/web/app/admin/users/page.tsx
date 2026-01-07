import { UserList } from "@/components/admin/user-list"

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">User Management</h1>
            </div>
            <UserList />
        </div>
    )
}
