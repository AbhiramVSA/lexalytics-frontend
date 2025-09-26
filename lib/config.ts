const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.lexalytics.me"

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "")

export const API_BASE_URL = normalizeBaseUrl(rawApiBaseUrl)

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
