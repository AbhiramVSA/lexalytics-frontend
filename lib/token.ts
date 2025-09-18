let memoryToken: string | null = null
let memoryTokenType: string | null = null

function maskToken(token: string | null | undefined): string {
    if (!token) return 'null'
    const len = token.length
    if (len <= 10) return `***(${len})`
    return `${token.slice(0, 8)}...${token.slice(-6)} (len=${len})`
}

export function setAuth(token: string, tokenType?: string | null) {
    memoryToken = token
    memoryTokenType = tokenType || 'Bearer' // default to Bearer if not provided
    console.log('[auth] setAuth: token=', maskToken(token), 'tokenType=', tokenType || 'n/a')
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem('authToken', token)
            window.localStorage.setItem('accessToken', token)
            window.localStorage.setItem('authTokenType', memoryTokenType)
        } catch {
            // Ignore potential storage errors
        }
    }
}

export function setToken(token: string, tokenType?: string) {
    setAuth(token, tokenType)
}

export function getToken(): string | null {
    if (typeof window !== 'undefined') {
        try {
            const t = window.localStorage.getItem('authToken') || window.localStorage.getItem('accessToken')
            if (t) {
                memoryToken = t
                return t
            }
        } catch {
            // Ignore potential storage errors
        }
    }
    console.log('[auth] getToken(memory):', maskToken(memoryToken))
    return memoryToken
}

export function getTokenType(): string {
    if (typeof window !== 'undefined') {
        try {
            const tt = window.localStorage.getItem('authTokenType')
            if (tt) {
                memoryTokenType = tt
                return tt
            }
        } catch {
            // Ignore potential storage errors
        }
    }
    if (memoryTokenType) console.log('[auth] getTokenType(memory):', memoryTokenType)
    return memoryTokenType || 'Bearer'
}

export function clearToken() {
    memoryToken = null
    memoryTokenType = null
    console.log('[auth] clearToken: token cleared')
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.removeItem('authToken')
            window.localStorage.removeItem('accessToken')
            window.localStorage.removeItem('authTokenType')
        } catch {
            // Ignore potential storage errors
        }
    }
}

export function getAuthHeader(): Record<string, string> {
    const token = getToken()
    const has = !!token
    console.log('[auth] getAuthHeader: hasToken=', has, has ? `auth=${maskToken(token!)}` : '')
    return token ? { Authorization: `bearer ${token}` } : {}
}
