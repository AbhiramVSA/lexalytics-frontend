"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/lib/auth-client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await login(email, password)
            if (!res.token) throw new Error('No token returned')
            document.cookie = `authToken=${res.token}; path=/; max-age=${60 * 60 * 24 * 7}`
            const next = searchParams?.get('next') || '/'
            router.replace(next)
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-orange-500 mb-2">Welcome back</h1>
                <p className="text-neutral-400 mb-6">Sign in to access your dashboard</p>
                {process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true' && (
                    <div className="text-xs text-neutral-400 mb-4">
                        Demo login enabled — use <span className="text-orange-400">{process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@example.com'}</span> / <span className="text-orange-400">{process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'demo1234'}</span>
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-4">
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
                    <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-black">
                        {loading ? 'Signing in…' : 'Sign In'}
                    </Button>
                </form>
                <p className="text-sm text-neutral-400 mt-4">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-orange-500 hover:underline">Create one</a>
                </p>
            </div>
        </div>
    )
}
