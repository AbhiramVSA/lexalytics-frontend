import { getAuthHeader } from './token'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.201.231.42'

export type CreateDraftCommentRequest = {
    comment: string
    sentiment_analysis?: string
    sentiment_score?: string
    sentiment_keywords?: string
}

export type CreateDraftCommentResponse = {
    id: string
    comment: string
    sentiment_analysis?: string
    sentiment_score?: string
    sentiment_keywords?: string
    draft_id: string
}

export type DraftComment = CreateDraftCommentResponse

export type ListDraftCommentsResponse = DraftComment[]

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

export async function createDraftComment(
    draftId: string,
    payload: CreateDraftCommentRequest
): Promise<CreateDraftCommentResponse> {
    if (!draftId) {
        throw new Error('Draft ID is required to create a comment.')
    }

    if (!payload.comment || !payload.comment.trim()) {
        throw new Error('Comment text is required.')
    }

    const authHeader = getAuthHeader()
    console.log('Creating comment for draft:', draftId)
    console.log('Auth header present:', Boolean(authHeader.Authorization))

    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const requestBody: CreateDraftCommentRequest = {
        comment: payload.comment.trim(),
    }

    if (payload.sentiment_analysis && payload.sentiment_analysis.trim()) {
        requestBody.sentiment_analysis = payload.sentiment_analysis.trim()
    }
    if (payload.sentiment_score && payload.sentiment_score.trim()) {
        requestBody.sentiment_score = payload.sentiment_score.trim()
    }
    if (payload.sentiment_keywords && payload.sentiment_keywords.trim()) {
        requestBody.sentiment_keywords = payload.sentiment_keywords.trim()
    }

    const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        ...authHeader,
    }

    console.log('Sending comment payload:', requestBody)

    const res = await fetch(`${baseUrl}/api/v1/comment/draft/${draftId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
    })

    console.log('Comment create response status:', res.status, res.statusText)

    let data: unknown = null
    let responseText = ''

    try {
        responseText = await res.text()
        console.log('Raw comment response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))

        if (responseText) {
            data = JSON.parse(responseText)
        }
    } catch (error) {
        console.log('Failed to parse comment response:', error)
        console.log('Response text was:', responseText)
    }

    if (!res.ok) {
        const detail = extractDetail(data) || `HTTP ${res.status}: ${res.statusText}`

        if (res.status === 401) {
            throw new Error(`Authentication failed (401): ${detail}. Check if your backend accepts this token format.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${detail}. Your token may not have the required permissions.`)
        }
        throw new Error(`Failed to create comment: ${detail}`)
    }

    return data as CreateDraftCommentResponse
}

export async function listDraftComments(draftId: string, limit = 20): Promise<ListDraftCommentsResponse> {
    if (!draftId) {
        throw new Error('Draft ID is required to fetch comments.')
    }

    const authHeader = getAuthHeader()
    console.log('Fetching comments for draft:', draftId, 'with limit:', limit)
    console.log('Auth header present:', Boolean(authHeader.Authorization))

    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    const url = `${baseUrl}/api/v1/comment/draft/${draftId}?limit=${limit}`
    console.log('Requesting comment list from:', url)

    const res = await fetch(url, {
        method: 'GET',
        headers,
    })

    console.log('Comment list response status:', res.status, res.statusText)

    let data: unknown = null
    let responseText = ''

    try {
        responseText = await res.text()
        console.log('Raw comment list response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))

        if (responseText) {
            data = JSON.parse(responseText)
        }
    } catch (error) {
        console.log('Failed to parse comment list response:', error)
        console.log('Response text was:', responseText)
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
            throw new Error(`Comments not found (404): Unable to locate comments for draft ${draftId}.`)
        }
        throw new Error(`Failed to fetch comments: ${detail}`)
    }

    if (!Array.isArray(data)) {
        console.warn('Expected array of comments but received:', typeof data)
        return []
    }

    return data as ListDraftCommentsResponse
}

export async function uploadDraftCommentsCsv(
    draftId: string,
    file: File
): Promise<ListDraftCommentsResponse> {
    if (!draftId) {
        throw new Error('Draft ID is required to upload comments.')
    }

    if (!file) {
        throw new Error('CSV file is required.')
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a valid CSV file (.csv).')
    }

    const authHeader = getAuthHeader()
    console.log('Uploading CSV comments for draft:', draftId, 'file:', file.name, 'size:', file.size)
    console.log('Auth header present:', Boolean(authHeader.Authorization))

    if (!authHeader.Authorization) {
        throw new Error('Not authenticated: Bearer token is required. Please set your authentication token in Settings.')
    }

    const formData = new FormData()
    formData.append('file', file, file.name)

    const headers: Record<string, string> = {
        'accept': 'application/json',
        ...authHeader,
    }

    const url = `${baseUrl}/api/v1/comment/draft/${draftId}/csv`
    console.log('Uploading CSV to:', url)

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    })

    console.log('CSV upload response status:', res.status, res.statusText)

    let data: unknown = null
    let responseText = ''

    try {
        responseText = await res.text()
        console.log('Raw CSV upload response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))

        if (responseText) {
            data = JSON.parse(responseText)
        }
    } catch (error) {
        console.log('Failed to parse CSV upload response:', error)
        console.log('Response text was:', responseText)
    }

    if (!res.ok) {
        const detail = extractDetail(data) || `HTTP ${res.status}: ${res.statusText}`

        if (res.status === 401) {
            throw new Error(`Authentication failed (401): ${detail}. Check if your backend accepts this token format.`)
        }
        if (res.status === 403) {
            throw new Error(`Access forbidden (403): ${detail}. Your token may not have the required permissions.`)
        }
        throw new Error(`Failed to upload comments CSV: ${detail}`)
    }

    if (!Array.isArray(data)) {
        console.warn('Expected array response from CSV upload but received:', typeof data)
        return []
    }

    return data as ListDraftCommentsResponse
}
