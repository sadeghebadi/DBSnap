export function AdminHeader() {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-6">
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        {/* Search placeholder */}
                    </div>
                </form>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Admin User</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">AD</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
