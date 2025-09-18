import { getAuthHeader, clearToken } from './token'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.201.231.42'

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
    // Note: List endpoint may not include full draft content and summary
    // Only basic metadata for listing purposes
}

export type ListDraftsResponse = DraftListItem[]

export async function uploadDraft(file: File): Promise<UploadDraftResponse> {
    const form = new FormData()
    // Match the curl format: -F 'file=@doc.pdf;type=application/pdf'
    form.append('file', file, file.name)

    const authHeader = getAuthHeader()
    console.log('Making request to:', `${baseUrl}/api/v1/draft/drafts/`)
    console.log('Auth header:', authHeader)
    console.log('Expected curl format:')
    console.log('  URL: http://52.201.231.42/api/v1/draft/drafts/')
    console.log('  Headers: accept: application/json, Authorization: <token>')
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
    const res = await fetch(`${baseUrl}/api/v1/draft/drafts/`, {
        method: 'POST',
        body: form,
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    let data: any = null
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
        const detail = data?.message || data?.detail || `HTTP ${res.status}: ${res.statusText}`
        
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
    console.log('Making request to fetch draft:', `${baseUrl}/api/v1/draft/drafts/${draftId}`)
    console.log('Auth header:', authHeader)
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    console.log('Fetching draft details...')
    const res = await fetch(`${baseUrl}/api/v1/draft/drafts/${draftId}`, {
        method: 'GET',
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    let data: any = null
    let responseText = ''
    
    try {
        responseText = await res.text()
        console.log('Raw response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
        
        if (responseText) {
            data = JSON.parse(responseText)
            console.log('Parsed JSON response keys:', Object.keys(data))
        }
    } catch (error) {
        console.log('Failed to parse response:', error)
        console.log('Response text was:', responseText.substring(0, 200))
    }

    if (!res.ok) {
        const detail = data?.message || data?.detail || `HTTP ${res.status}: ${res.statusText}`
        
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

export async function listDrafts(): Promise<ListDraftsResponse> {
    const authHeader = getAuthHeader()
    console.log('Making request to list drafts:', `${baseUrl}/api/v1/draft/drafts/`)
    console.log('Auth header:', authHeader)
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    console.log('Fetching drafts list...')
    const res = await fetch(`${baseUrl}/api/v1/draft/drafts/`, {
        method: 'GET',
        headers,
    })

    console.log('Response status:', res.status, res.statusText)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))

    let data: any = null
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
        const detail = data?.message || data?.detail || `HTTP ${res.status}: ${res.statusText}`
        
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
    console.log('Making request to delete draft:', `${baseUrl}/api/v1/draft/drafts/${draftId}`)
    console.log('Auth header:', authHeader)
    
    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': '*/*',
        ...authHeader,
    }

    console.log('Deleting draft...')
    const res = await fetch(`${baseUrl}/api/v1/draft/drafts/${draftId}`, {
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
    let data: any = null
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
        const detail = data?.message || data?.detail || `HTTP ${res.status}: ${res.statusText}`
        
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
