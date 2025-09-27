"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/lib/auth-client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getToken, setToken } from '@/lib/token'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        const existingToken = getToken()
        if (existingToken) {
            const rawNext = searchParams?.get('next')
            const next = rawNext && rawNext !== '/login' ? rawNext : '/dashboard'
            router.replace(next)
        }
    }, [router, searchParams])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await login(email, password)
            if (!res.token) throw new Error('No token returned')
            setToken(res.token)
            const rawNext = searchParams?.get('next')
            const next = rawNext && rawNext !== '/login' ? rawNext : '/dashboard'
            router.replace(next)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-black p-6 text-white">
            <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)] opacity-80 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,_rgba(236,72,153,0.12),_transparent_55%)] opacity-60 blur-3xl" />
            <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-neutral-700/70 bg-neutral-900/80 p-8 backdrop-blur-2xl glow-ring">
                <h1 className="mb-2 text-3xl font-semibold text-accentPrimary">Welcome back</h1>
                <p className="mb-6 text-neutral-400">Sign in to access your dashboard</p>
                {process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true' && (
                    <div className="mb-4 space-y-1 rounded-lg border border-neutral-700/60 bg-neutral-900/80 p-3 text-xs text-neutral-400">
                        <p className="text-neutral-300">Demo login enabled</p>
                        <p>
                            Use <span className="font-mono text-accentPrimary">{process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@example.com'}</span>
                            <br />
                            Password <span className="font-mono text-accentPrimary">{process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'demo1234'}</span>
                        </p>
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-wide text-neutral-400">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="border-neutral-700/70 bg-neutral-900/60 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm uppercase tracking-wide text-neutral-400">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="border-neutral-700/70 bg-neutral-900/60 text-white"
                        />
                    </div>
                    {error && (
                        <div className="rounded border border-red-600/60 bg-red-600/10 p-3 text-sm text-red-300 animate-fade-in-up">{error}</div>
                    )}
                    <Button type="submit" disabled={loading} className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground">
                        {loading ? 'Signing in…' : 'Sign In'}
                    </Button>
                </form>
                <p className="mt-6 text-sm text-neutral-400">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-accentPrimary underline-offset-4 hover:underline">Create one</a>
                </p>
            </div>
        </div>
    )
}
