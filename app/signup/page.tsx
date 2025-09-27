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
        <div className="relative flex min-h-screen items-center justify-center bg-black p-6 text-white">
            <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,_rgba(16,185,129,0.2),_transparent_55%)] opacity-80 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.18),_transparent_55%)] opacity-60 blur-2xl" />
            <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-neutral-700/70 bg-neutral-900/80 p-8 backdrop-blur-2xl glow-ring">
                <h1 className="mb-2 text-3xl font-semibold text-accentPrimary">Create your account</h1>
                <p className="mb-6 text-neutral-400">Sign up to get started</p>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-wide text-neutral-400">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" className="border-neutral-700/70 bg-neutral-900/60 text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-wide text-neutral-400">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="border-neutral-700/70 bg-neutral-900/60 text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-wide text-neutral-400">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="border-neutral-700/70 bg-neutral-900/60 text-white" />
                    </div>
                    {error && (
                        <div className="rounded border border-red-600/60 bg-red-600/10 p-3 text-sm text-red-300 animate-fade-in-up">{error}</div>
                    )}
                    <Button type="submit" disabled={loading} className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground">
                        {loading ? 'Creating account…' : 'Sign Up'}
                    </Button>
                </form>
                <p className="mt-6 text-sm text-neutral-400">
                    Already have an account?{' '}
                    <a href="/login" className="text-accentPrimary underline-offset-4 hover:underline">Sign in</a>
                </p>
            </div>
        </div>
    )
}
