export type AuthResponse = {
    token?: string
    tokenType?: string
    user?: any
    error?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://52.201.231.42"
import { setToken, clearToken } from './token'

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
    // Backend: POST /api/v1/login/login -> { access_token, token_type }
    const data = await request<any>('/api/v1/login/login', { email, password })
    if (data?.access_token) {
        const token = String(data.access_token)
        const type = (String(data?.token_type || 'bearer')).toLowerCase() === 'bearer' ? 'bearer' : String(data?.token_type)
        setToken(token, type)
        try { localStorage.setItem('accessToken', token) } catch { }
        const masked = token.length > 14 ? `${token.slice(0, 8)}...${token.slice(-6)}` : `***(${token.length})`
        console.log('[auth] login: token saved', masked, 'type:', type)
        return { token, tokenType: type }
    }
    throw new Error('Invalid response from login endpoint')
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
    // Backend: POST /api/v1/login/register -> { id, username, email }
    const user = await request<any>('/api/v1/login/register', { username: name, email, password })
    return { user }
}

export function logout(): void {
    try {
        clearToken()
    } catch {
        // no-op
    }
}

