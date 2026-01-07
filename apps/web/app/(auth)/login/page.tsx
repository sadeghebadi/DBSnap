"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import api from "@/lib/api"

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function onSubmit(data: any) {
        setIsLoading(true)

        try {
            const result = await api.post("/auth/login", data);

            // Assuming result.data contains { access_token }
            if (result.data.access_token) {
                localStorage.setItem("token", result.data.access_token)
                document.cookie = `token=${result.data.access_token}; path=/; max-age=3600; SameSite=Strict` // Set cookie for middleware;
                // Redirect to dashboard
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Login failed", error);
            // TODO: Toast error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    DBSnap
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This library has saved me countless hours of work and
                            helped me deliver stunning designs to my clients faster than
                            ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Login to your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to login
                        </p>
                    </div>
                    <AuthForm type="login" onSubmit={onSubmit} isLoading={isLoading} />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link
                            href="/register"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            Don&apos;t have an account? Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div >
    )
}
