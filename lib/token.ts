let memoryToken: string | null = null

export function setToken(token: string) {
  memoryToken = token
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("authToken", token)
    } catch {
      // Ignore storage errors
    }
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("authToken")
      if (token) {
        memoryToken = token
        return token
      }
    } catch {
      // Ignore storage errors
    }
  }
  return memoryToken
}

export function clearToken() {
  memoryToken = null
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("authToken")
    } catch {
      // Ignore storage errors
    }
  }
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: token } : {}
}
