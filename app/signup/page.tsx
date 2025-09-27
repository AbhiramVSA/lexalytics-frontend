"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup, login } from '@/lib/auth-client'
import { getToken, setToken } from '@/lib/token'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        if (getToken()) {
            router.replace('/dashboard')
        }
    }, [router])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await signup(name, email, password)
            // Optional: auto-login after signup
            try {
                const res = await login(email, password)
                if (res.token) {
                    setToken(res.token)
                    router.replace('/dashboard')
                    return
                }
            } catch { }
            router.replace('/login')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-accentPrimary mb-2">Create your account</h1>
                <p className="text-neutral-400 mb-6">Sign up to get started</p>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" className="bg-neutral-800 border-neutral-600 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-2">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-neutral-800 border-neutral-600 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-2">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-neutral-800 border-neutral-600 text-white" />
                    </div>
                    {error && (
                        <div className="text-sm p-3 rounded border bg-red-900/30 border-red-600 text-red-300">{error}</div>
                    )}
                    <Button type="submit" disabled={loading} className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground">
                        {loading ? 'Creating account…' : 'Sign Up'}
                    </Button>
                </form>
                <p className="text-sm text-neutral-400 mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-accentPrimary hover:underline">Sign in</a>
                </p>
            </div>
        </div>
    )
}
