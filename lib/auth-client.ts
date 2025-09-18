export type AuthResponse = {
    token?: string
    user?: any
    error?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://52.201.231.42"

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
        return { token: data.access_token }
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
        document.cookie = 'authToken=; path=/; max-age=0'
    } catch {
        // no-op
    }
}
