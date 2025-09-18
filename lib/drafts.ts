import { getAuthHeader, clearToken } from './token'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.201.231.42'

export type UploadDraftResponse = {
    id: string
    draft: string
    summary?: string
    user_id?: string
}

export async function uploadDraft(file: File): Promise<UploadDraftResponse> {
    const form = new FormData()
    form.append('file', file, file.name)

    const authHeader = getAuthHeader()
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: no bearer token found. Please log in.')
    }

    // Only Authorization + Accept
    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...authHeader,
    }

    console.log('[drafts] uploadDraft: POST', `${baseUrl}/api/v1/draft/drafts/`, 'headers:', { Authorization: headers.Authorization })
    const res = await fetch(`${baseUrl}/api/v1/draft/drafts/`, {
        method: 'POST',
        body: form,
        headers, // no Content-Type for FormData
    })

    let data: any = null
    try {
        data = await res.json()
    } catch {
        // Ignore JSON parsing errors
    }

    if (!res.ok) {
        console.log('[drafts] uploadDraft: response status=', res.status)
        const detail = data?.message || data?.detail || 'Failed to upload draft'
        if (res.status === 401 || res.status === 403) {
            clearToken()
            throw new Error(`Unauthorized: ${detail}`)
        }
        throw new Error(`${detail} (HTTP ${res.status})`)
    }

    return data as UploadDraftResponse
}
