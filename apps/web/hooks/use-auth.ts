
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
    const [token, setToken] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const t = localStorage.getItem('token')
        if (t) {
            setToken(t)
        } else {
            // Optional: redirect logic if strict protection is needed, though middleware usually handles it
        }
    }, [])

    function logout() {
        localStorage.removeItem('token')
        document.cookie = 'token=; Max-Age=0; path=/;'
        router.push('/login')
    }

    return { token, logout }
}
