import { apiUrl } from './config'
import { getAuthHeader } from './token'

export type UploadDraftResponse = {
    id: string
    draft: string
    summary?: string
    user_id?: string
}

export type GetDraftResponse = {
    id: string
    draft: string
    summary: string
    user_id: string
}

export type DraftListItem = {
    id: string
    user_id: string
    draft?: string
    summary?: string
}

export type ListDraftsResponse = DraftListItem[]

type JsonRecord = Record<string, unknown>

const extractDetail = (payload: unknown): string | undefined => {
    if (payload && typeof payload === 'object') {
        const record = payload as JsonRecord
        const keys: Array<'message' | 'detail' | 'error'> = ['message', 'detail', 'error']
        for (const key of keys) {
            const value = record[key]
            if (typeof value === 'string') {
                return value
            }
        }
    }
    return undefined
}

export async function uploadDraft(file: File): Promise<UploadDraftResponse> {
    const form = new FormData()
    // Match the curl format: -F 'file=@doc.pdf;type=application/pdf'
    form.append('file', file, file.name)

    const authHeader = getAuthHeader()
    console.log('Making request to:', apiUrl('/api/v1/draft/'))
    console.log('Auth header:', authHeader)
    console.log('Expected curl format:')
    console.log('  URL:', apiUrl('/api/v1/draft/'))
    console.log('  Headers: accept: application/json, Authorization: <token> (optional for public uploads)')
    console.log('  FormData: file field with PDF')
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    // Only Authorization + Accept (Content-Type is set automatically by browser for FormData)
    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    console.log('Sending request...')
    const res = await fetch(apiUrl('/api/v1/draft/'), {
        method: 'POST',
        body: form,
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    let data: unknown = null
    let responseText = ''
    
    try {
        responseText = await res.text()
        console.log('Raw response body:', responseText)
        
        if (responseText) {
            data = JSON.parse(responseText)
            console.log('Parsed JSON response:', data)
        }
    } catch (error) {
        console.log('Failed to parse response:', error)
        console.log('Response text was:', responseText)
    }

    if (!res.ok) {
        const detail = extractDetail(data) || `HTTP ${res.status}: ${res.statusText}`
        
        if (res.status === 401) {
            // Don't clear token automatically - let user decide
            throw new Error(`Authentication failed (401): ${detail}. Check if your backend accepts this token format.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${detail}. Your token may not have the required permissions.`)
        }
        throw new Error(`Upload failed: ${detail}`)
    }

    return data as UploadDraftResponse
}

export async function getDraft(draftId: string): Promise<GetDraftResponse> {
    const authHeader = getAuthHeader()
    console.log('Making request to fetch draft:', apiUrl(`/api/v1/draft/drafts/${draftId}`))
    console.log('Auth header:', authHeader)
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    console.log('Fetching draft details...')
    const res = await fetch(apiUrl(`/api/v1/draft/drafts/${draftId}`), {
        method: 'GET',
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    let data: unknown = null
    let responseText = ''
    
    try {
        responseText = await res.text()
        console.log('Raw response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
        
        if (responseText) {
            data = JSON.parse(responseText)
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                console.log('Parsed JSON response keys:', Object.keys(data as JsonRecord))
            } else {
                console.log('Parsed JSON response:', data)
            }
        }
    } catch (error) {
        console.log('Failed to parse response:', error)
        console.log('Response text was:', responseText.substring(0, 200))
    }

    if (!res.ok) {
        const detail = extractDetail(data) || `HTTP ${res.status}: ${res.statusText}`
        
        if (res.status === 401) {
            throw new Error(`Authentication failed (401): ${detail}. Check if your backend accepts this token format.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${detail}. Your token may not have the required permissions.`)
        }
        if (res.status === 404) {
            throw new Error(`Draft not found (404): The draft with ID ${draftId} was not found or you don't have access to it.`)
        }
        throw new Error(`Failed to fetch draft: ${detail}`)
    }

    return data as GetDraftResponse
}

export async function listDrafts(limit = 20): Promise<ListDraftsResponse> {
    const authHeader = getAuthHeader()
    console.log('Making request to list drafts:', apiUrl(`/api/v1/draft/?limit=${limit}`))
    console.log('Auth header:', authHeader)
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    console.log('Fetching drafts list...')
    const res = await fetch(apiUrl(`/api/v1/draft/?limit=${limit}`), {
        method: 'GET',
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    let data: unknown = null
    let responseText = ''
    
    try {
        responseText = await res.text()
        console.log('Raw response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
        
        if (responseText) {
            data = JSON.parse(responseText)
            console.log('Parsed JSON response - found', Array.isArray(data) ? data.length : 'non-array', 'items')
        }
    } catch (error) {
        console.log('Failed to parse response:', error)
        console.log('Response text was:', responseText.substring(0, 200))
    }

    if (!res.ok) {
        const detail = extractDetail(data) || `HTTP ${res.status}: ${res.statusText}`
        
        if (res.status === 401) {
            throw new Error(`Authentication failed (401): ${detail}. Check if your backend accepts this token format.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${detail}. Your token may not have the required permissions.`)
        }
        throw new Error(`Failed to fetch drafts list: ${detail}`)
    }

    // Ensure we return an array
    if (!Array.isArray(data)) {
        console.warn('Expected array response but got:', typeof data)
        return []
    }

    return data as ListDraftsResponse
}

export async function deleteDraft(draftId: string): Promise<void> {
    const authHeader = getAuthHeader()
    console.log('Making request to delete draft:', apiUrl(`/api/v1/draft/${draftId}`))
    console.log('Auth header:', authHeader)
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': '*/*',
        ...authHeader,
    }

    console.log('Deleting draft...')
    const res = await fetch(apiUrl(`/api/v1/draft/${draftId}`), {
        method: 'DELETE',
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    // For DELETE operations, we don't expect response body content for 204
    if (res.status === 204) {
        console.log('Draft deleted successfully')
        return
    }

    // If not 204, try to parse error response
    let data: unknown = null
    let responseText = ''
    
    try {
        responseText = await res.text()
        if (responseText) {
            console.log('Error response body:', responseText)
            data = JSON.parse(responseText)
        }
    } catch (error) {
        console.log('Failed to parse error response:', error)
    }

    if (!res.ok) {
        const detail = extractDetail(data) || `HTTP ${res.status}: ${res.statusText}`
        
        if (res.status === 401) {
            throw new Error(`Authentication failed (401): ${detail}. Check if your backend accepts this token format.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${detail}. Your token may not have the required permissions.`)
        }
        if (res.status === 404) {
            throw new Error(`Draft not found (404): The draft with ID ${draftId} was not found or has already been deleted.`)
        }
        throw new Error(`Failed to delete draft: ${detail}`)
    }
}

const extractFilename = (contentDisposition: string | null, fallback: string): string => {
    if (!contentDisposition) {
        return fallback
    }

    const filenameMatch = contentDisposition.match(/filename\*?=([^;]+)/i)
    if (!filenameMatch) {
        return fallback
    }

    const value = filenameMatch[1].trim()

    if (value.startsWith("UTF-8''")) {
        try {
            return decodeURIComponent(value.slice(7)) || fallback
        } catch (error) {
            console.warn('Failed to decode filename from content-disposition:', error)
            return fallback
        }
    }

    return value.replace(/^["']|["']$/g, '') || fallback
}

export async function generateDraftReport(draftId: string): Promise<{ blob: Blob; filename: string }> {
    if (!draftId) {
        throw new Error('Draft ID is required to generate a report.')
    }

    const authHeader = getAuthHeader()
    console.log('Generating report for draft:', draftId)
    console.log('Auth header present:', Boolean(authHeader.Authorization))

    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please log in before generating a report.')
    }

    const headers: Record<string, string> = {
        accept: 'application/pdf',
        ...authHeader,
    }

    const url = apiUrl(`/api/v1/draft/${draftId}/report`)
    console.log('Requesting draft report from:', url)

    const res = await fetch(url, {
        method: 'POST',
        headers,
    })

    console.log('Draft report response status:', res.status, res.statusText)

    if (!res.ok) {
        let detail: string | undefined
        try {
            const text = await res.text()
            if (text) {
                detail = extractDetail(JSON.parse(text))
            }
        } catch (error) {
            console.warn('Failed to parse draft report error response:', error)
        }

        const message = detail || `HTTP ${res.status}: ${res.statusText}`

        if (res.status === 401) {
            throw new Error(`Authentication failed (401): ${message}. Check if your token is still valid.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${message}.`)
        }
        if (res.status === 404) {
            throw new Error(`Report not found (404): Unable to generate report for draft ${draftId}.`)
        }

        throw new Error(`Failed to generate draft report: ${message}`)
    }

    const blob = await res.blob()
    const filename = extractFilename(res.headers.get('content-disposition'), `draft_${draftId}_report.pdf`)

    return { blob, filename }
}
