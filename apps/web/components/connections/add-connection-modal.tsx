"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import { useConnections, DbType } from "@/lib/hooks/use-connections"
import { cn } from "@/lib/utils"

const connectionSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["Postgres", "MongoDB", "MySQL"]),
    connectionString: z.string().min(10, "Connection string is too short"),
})

type FormData = z.infer<typeof connectionSchema>

interface AddConnectionModalProps {
    projectId: string
}

export function AddConnectionModal({ projectId }: AddConnectionModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { createConnection } = useConnections(projectId)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(connectionSchema),
        defaultValues: {
            type: "Postgres"
        }
    })

    const onSubmit = (data: FormData) => {
        createConnection.mutate(data, {
            onSuccess: () => {
                setIsOpen(false)
                reset()
            }
        })
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Database
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-background border rounded-lg shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">New Connection</h3>
                    <p className="text-sm text-muted-foreground">
                        Enter details to connect your database securely.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="name">Name</label>
                        <input
                            id="name"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="My Production DB"
                            {...register("name")}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="type">Type</label>
                        <select
                            id="type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("type")}
                        >
                            <option value="Postgres">PostgreSQL</option>
                            <option value="MongoDB">MongoDB</option>
                            <option value="MySQL">MySQL</option>
                        </select>
                        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="conn">Connection String</label>
                        <input
                            id="conn"
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="postgresql://user:pass@host:5432/db"
                            {...register("connectionString")}
                        />
                        {errors.connectionString && <p className="text-sm text-red-500">{errors.connectionString.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createConnection.isPending}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {createConnection.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Connect
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
