export type AuthResponse = {
    token?: string
    user?: any
    error?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true'
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@example.com'
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'demo1234'

async function request<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
    })
    let data: any = null
    try {
        data = await res.json()
    } catch (e) {
        // ignore json parse errors
    }
    if (!res.ok) {
        const message = data?.message || data?.error || `Request failed: ${res.status}`
        throw new Error(message)
    }
    return data as T
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    if (demoEnabled) {
        await new Promise((r) => setTimeout(r, 400))
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            return { token: 'demo-token', user: { email, name: 'Demo User' } }
        }
        throw new Error('Invalid credentials')
    }
    return request<AuthResponse>('/auth/login', { email, password })
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
    if (demoEnabled) {
        await new Promise((r) => setTimeout(r, 400))
        // In demo mode, simply accept any signup and return a token
        return { token: 'demo-token', user: { email, name: name || 'Demo User' } }
    }
    return request<AuthResponse>('/auth/signup', { name, email, password })
}
