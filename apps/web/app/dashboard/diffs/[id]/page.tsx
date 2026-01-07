"use client"

import { use } from "react"
import { DiffViewer } from "@/components/diffs/diff-viewer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DiffPageProps {
    params: Promise<{ id: string }>
}

export default function DiffPage({ params }: DiffPageProps) {
    const { id } = use(params);

    return (
        <div className="flex flex-col space-y-6 p-8 max-w-7xl mx-auto h-[calc(100vh-64px)]">
            <div className="flex items-center space-x-4">
                <Link href="#" onClick={() => history.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Diff Result</h2>
                    <p className="text-muted-foreground text-sm">
                        ID: {id}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <DiffViewer diffId={id} />
            </div>
        </div>
    )
}
