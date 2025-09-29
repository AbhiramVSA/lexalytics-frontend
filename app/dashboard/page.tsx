"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronRight, BarChart3, Upload, FileText, Settings, RefreshCw, LogOut, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { uploadDraft, getDraft, listDrafts, deleteDraft, generateDraftReport } from "@/lib/drafts"
import { createDraftComment, listDraftComments, uploadDraftCommentsCsv, type CreateDraftCommentRequest, type CreateDraftCommentResponse, type DraftComment, type ListDraftCommentsResponse } from "@/lib/comments"
import { getToken, clearToken as clearStoredToken } from "@/lib/token"

interface Draft {
  id: string;
  title?: string;
  status?: string;
  commentsCount: number | null;
  draft?: string;
  summary?: string;
  user_id?: string;
}

export default function MCADashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [settingsAlert, setSettingsAlert] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [bulkDraftId, setBulkDraftId] = useState<string>("")

  const [commentDraftId, setCommentDraftId] = useState<string>("")
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null)
  const [lastCommentResponse, setLastCommentResponse] = useState<CreateDraftCommentResponse | null>(null)

  const [bulkCommentFile, setBulkCommentFile] = useState<File | null>(null)
  const [bulkCommentError, setBulkCommentError] = useState<string | null>(null)
  const [bulkCommentSuccess, setBulkCommentSuccess] = useState<string | null>(null)
  const [bulkCommentLoading, setBulkCommentLoading] = useState(false)
  const [bulkCommentResult, setBulkCommentResult] = useState<ListDraftCommentsResponse | null>(null)

  const [commentsByDraft, setCommentsByDraft] = useState<Record<string, DraftComment[]>>({})
  const [commentsLoadingId, setCommentsLoadingId] = useState<string | null>(null)
  const [commentsErrorByDraft, setCommentsErrorByDraft] = useState<Record<string, string>>({})

  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [reportSuccess, setReportSuccess] = useState<string | null>(null)

  const bulkFileInputRef = useRef<HTMLInputElement | null>(null)

  const [newDraftFile, setNewDraftFile] = useState<File | null>(null)
  const [newDraftError, setNewDraftError] = useState<string | null>(null)
  const [loadingDraftDetails, setLoadingDraftDetails] = useState<boolean>(false)
  const [draftDetailsError, setDraftDetailsError] = useState<string | null>(null)
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newDraftLoading, setNewDraftLoading] = useState(false)
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsAuthed(false)
      window.location.replace('/login?next=/dashboard')
      return
    }
    setIsAuthed(true)
  }, [])

  const getSentimentBadgeClasses = (sentiment?: string | null) => {
    const normalized = (sentiment || "").toLowerCase()
    if (normalized.includes("negative")) {
      return "bg-red-500/20 text-red-200 border border-red-500/40"
    }
    if (normalized.includes("positive")) {
      return "bg-green-500/20 text-green-200 border border-green-500/40"
    }
    if (normalized.includes("neutral")) {
      return "bg-yellow-400/30 text-yellow-200 border border-yellow-400/40"
    }
    return "bg-neutral-800 text-neutral-200 border border-neutral-700"
  }

  const getSentimentScoreClasses = (score?: string | number | null) => {
    const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-sm font-semibold shadow-sm border"
    if (score === null || score === undefined || score === "") {
      return `${base} bg-neutral-900 text-neutral-300 border-neutral-700`
    }
    const numeric = typeof score === "number" ? score : Number(score)
    if (Number.isNaN(numeric)) {
      return `${base} bg-neutral-900 text-neutral-300 border-neutral-700`
    }
    if (numeric <= -0.2) {
      return `${base} bg-red-500/20 text-red-200 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]`
    }
    if (numeric >= 0.2) {
      return `${base} bg-green-500/20 text-green-200 border-green-500/60 shadow-[0_0_12px_rgba(34,197,94,0.25)]`
    }
    return `${base} bg-yellow-400/25 text-yellow-100 border-yellow-400/60 shadow-[0_0_12px_rgba(250,204,21,0.25)]`
  }

  useEffect(() => {
    if (isAuthed && activeSection === 'dashboard') {
      loadDraftsList()
    }
  }, [isAuthed, activeSection])

  const handleLogout = () => {
    clearStoredToken()
    setIsAuthed(false)
    window.location.href = '/login'
  }

  const fetchDraftDetails = async (draftId: string) => {
    setLoadingDraftDetails(true)
    setDraftDetailsError(null)

    try {
      const draftDetails = await getDraft(draftId)
      setDrafts(prevDrafts =>
        prevDrafts.map(draft =>
          draft.id === draftId
            ? { ...draft, ...draftDetails }
            : draft
        )
      )
    } catch (error) {
      setDraftDetailsError(error instanceof Error ? error.message : 'Failed to fetch draft details')
    } finally {
      setLoadingDraftDetails(false)
    }
  }

  const loadDraftsList = async () => {
    try {
      const draftsList = await listDrafts()
      const draftsWithDisplayInfo = draftsList.map(item => {
        const summaryLine = item.summary?.split('\n').find(line => line.trim().length > 0)
        const draftLine = item.draft?.split('\n').find(line => line.trim().length > 0)
        const derivedTitle = summaryLine || draftLine || 'Untitled Draft'

        return {
          id: item.id,
          user_id: item.user_id,
          title: derivedTitle.trim().slice(0, 80),
          status: 'Draft' as const,
          commentsCount: null,
          draft: item.draft,
          summary: item.summary,
        } satisfies Draft
      })

      setDrafts(draftsWithDisplayInfo)

      if (draftsWithDisplayInfo.length === 0) {
        return
      }

      const commentResults = await Promise.all(
        draftsWithDisplayInfo.map(async (draft) => {
          try {
            const comments = await listDraftComments(draft.id, 500)
            return { id: draft.id, comments, error: null as string | null }
          } catch (error) {
            console.error(`Failed to preload comments for draft ${draft.id}:`, error)
            const message = error instanceof Error ? error.message : 'Failed to load comments'
            return { id: draft.id, comments: null, error: message }
          }
        })
      )

      const commentsMap: Record<string, DraftComment[]> = {}
      const errorsMap: Record<string, string> = {}

      for (const result of commentResults) {
        if (result.comments !== null) {
          commentsMap[result.id] = result.comments
        } else if (result.error) {
          errorsMap[result.id] = result.error
        }
      }

      if (Object.keys(commentsMap).length > 0) {
        setCommentsByDraft((prev) => ({ ...prev, ...commentsMap }))
      }

      setCommentsErrorByDraft((prev) => {
        if (Object.keys(errorsMap).length === 0 && Object.keys(commentsMap).length === 0) {
          return prev
        }
        const next = { ...prev }
        for (const draftId of Object.keys(commentsMap)) {
          if (next[draftId]) {
            delete next[draftId]
          }
        }
        for (const [draftId, message] of Object.entries(errorsMap)) {
          next[draftId] = message
        }
        return next
      })

      setDrafts((prevDrafts) =>
        prevDrafts.map((draft) => {
          if (Object.prototype.hasOwnProperty.call(commentsMap, draft.id)) {
            return { ...draft, commentsCount: commentsMap[draft.id].length }
          }
          if (Object.prototype.hasOwnProperty.call(errorsMap, draft.id)) {
            return { ...draft, commentsCount: null }
          }
          return draft
        })
      )
    } catch (error) {
      console.error('Failed to load drafts list:', error)
    }
  }

  const loadDraftComments = useCallback(async (draftId: string) => {
    if (!draftId) {
      return
    }

    setCommentsLoadingId(draftId)
    setCommentsErrorByDraft(prev => {
      if (!prev[draftId]) {
        return prev
      }
      const next = { ...prev }
      delete next[draftId]
      return next
    })

    try {
      const comments = await listDraftComments(draftId, 20)
      setCommentsByDraft(prev => ({ ...prev, [draftId]: comments }))
      setDrafts(prevDrafts =>
        prevDrafts.map(draft =>
          draft.id === draftId
            ? { ...draft, commentsCount: comments.length }
            : draft
        )
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load comments'
      setCommentsErrorByDraft(prev => ({ ...prev, [draftId]: message }))
    } finally {
      setCommentsLoadingId(current => (current === draftId ? null : current))
    }
  }, [])

  useEffect(() => {
    if (selectedDraft && !commentsByDraft[selectedDraft] && commentsLoadingId !== selectedDraft) {
      loadDraftComments(selectedDraft)
    }
  }, [selectedDraft, commentsByDraft, commentsLoadingId, loadDraftComments])

  useEffect(() => {
    setReportError(null)
    setReportSuccess(null)
    setReportLoading(false)
  }, [selectedDraft])

  const handleGenerateReport = async (draftId: string) => {
    if (!draftId) {
      setReportError('No draft selected for report generation.')
      return
    }

    setReportError(null)
    setReportSuccess(null)
    setReportLoading(true)

    try {
      const { blob, filename } = await generateDraftReport(draftId)

      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)

      setReportSuccess(`Report download started: ${filename}`)
    } catch (error) {
      console.error('Failed to generate draft report:', error)
      setReportError(error instanceof Error ? error.message : 'Failed to generate draft report.')
    } finally {
      setReportLoading(false)
    }
  }

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCommentError(null)
    setCommentSuccess(null)
    setLastCommentResponse(null)

    if (!commentDraftId) {
      setCommentError('Please select a draft to comment on.')
      return
    }

    if (!commentText.trim()) {
      setCommentError('Please enter a comment before submitting.')
      return
    }

    const payload: CreateDraftCommentRequest = {
      comment: commentText.trim(),
      sentiment_analysis: 'string',
      sentiment_score: 'string',
      sentiment_keywords: 'string',
    }

    try {
      setCommentLoading(true)
      const response = await createDraftComment(commentDraftId, payload)
      setCommentSuccess('Comment submitted successfully.')
      setLastCommentResponse(response)
      setCommentText('')
      await loadDraftComments(commentDraftId)
    } catch (error) {
      console.error('Failed to submit comment:', error)
      setCommentError(error instanceof Error ? error.message : 'Failed to submit comment')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleBulkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBulkCommentError(null)
    setBulkCommentSuccess(null)
    setBulkCommentResult(null)

    const file = event.target.files?.[0] || null
    if (!file) {
      setBulkCommentFile(null)
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setBulkCommentError('Please upload a CSV file (.csv).')
      setBulkCommentFile(null)
      return
    }

    const maxBytes = 10 * 1024 * 1024
    if (file.size > maxBytes) {
      setBulkCommentError('File too large. Max size is 10MB.')
      setBulkCommentFile(null)
      return
    }

    setBulkCommentFile(file)
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = ''
    }
  }

  const handleBulkCsvSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBulkCommentError(null)
    setBulkCommentSuccess(null)
    setBulkCommentResult(null)

    if (!bulkDraftId) {
      setBulkCommentError('Please select a draft before uploading CSV comments.')
      return
    }

    if (!bulkCommentFile) {
      setBulkCommentError('Please choose a CSV file to upload.')
      return
    }

    try {
      setBulkCommentLoading(true)
      const uploaded = await uploadDraftCommentsCsv(bulkDraftId, bulkCommentFile)
      setBulkCommentResult(uploaded)
      const count = uploaded.length
      setBulkCommentSuccess(`Uploaded ${count} comment${count === 1 ? '' : 's'} successfully.`)
      setBulkCommentFile(null)
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = ''
      }

      setCommentsByDraft(prev => ({ ...prev, [bulkDraftId]: uploaded }))
      setDrafts(prevDrafts =>
        prevDrafts.map(draft =>
          draft.id === bulkDraftId
            ? { ...draft, commentsCount: uploaded.length }
            : draft
        )
      )

      if (selectedDraft === bulkDraftId) {
        setCommentsErrorByDraft(prev => {
          if (!prev[bulkDraftId]) return prev
          const next = { ...prev }
          delete next[bulkDraftId]
          return next
        })
      }

      await loadDraftComments(bulkDraftId)
    } catch (error) {
      console.error('Failed to upload CSV comments:', error)
      setBulkCommentError(error instanceof Error ? error.message : 'Failed to upload CSV')
    } finally {
      setBulkCommentLoading(false)
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    setDeletingDraftId(draftId)
    setDeleteError(null)

    try {
      await deleteDraft(draftId)
      setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId))

      if (selectedDraft === draftId) {
        setSelectedDraft(null)
      }

      setConfirmDeleteId(null)
    } catch (error) {
      console.error('Failed to delete draft:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete draft')
    } finally {
      setDeletingDraftId(null)
    }
  }

  const renderDashboardContent = () => {
    if (selectedDraft) {
      const draft = drafts.find((d) => d.id === selectedDraft)
      if (!draft) {
        setSelectedDraft(null)
        return null
      }
      const draftComments = commentsByDraft[draft.id] ?? []
      const commentsError = commentsErrorByDraft[draft.id]
      const isCommentsLoading = commentsLoadingId === draft.id
      return (
        <div className="p-6 space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <button onClick={() => setSelectedDraft(null)} className="hover:text-accentPrimary transition-colors">
              Dashboard
            </button>
            <span>/</span>
            <span className="text-accentPrimary">{draft.title || 'Draft Details'}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl lg:col-span-2 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-accentPrimary">Draft Content</CardTitle>
                <CardDescription>Full document text</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {loadingDraftDetails ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-accentPrimary mx-auto mb-2" />
                      <span className="text-neutral-500">Loading draft content...</span>
                    </div>
                  ) : draftDetailsError ? (
                    <div className="text-center py-8">
                      <span className="text-red-400 text-sm">{draftDetailsError}</span>
                      <button
                        onClick={() => fetchDraftDetails(draft.id)}
                        className="block mt-2 px-3 py-1 bg-accentPrimary text-accentPrimary-foreground text-xs rounded hover:bg-accentPrimary/90 transition-colors mx-auto"
                      >
                        Retry
                      </button>
                    </div>
                  ) : draft.draft ? (
                    <div className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {draft.draft}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-neutral-500">No content available</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up-delayed">
              <CardHeader>
                <CardTitle className="text-accentPrimary">Executive Summary</CardTitle>
                <CardDescription>AI-generated draft summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {loadingDraftDetails ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-accentPrimary mx-auto mb-2" />
                      <span className="text-neutral-500">Loading summary...</span>
                    </div>
                  ) : draftDetailsError ? (
                    <div className="text-center py-8">
                      <span className="text-red-400 text-sm">{draftDetailsError}</span>
                    </div>
                  ) : draft.summary ? (
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {draft.summary}
                    </p>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-neutral-500">No summary available</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-4">
            <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-accentPrimary">Analysis Actions</CardTitle>
                <CardDescription>Generate a sentiment insights report for this draft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleGenerateReport(draft.id)}
                    disabled={reportLoading}
                    className="border-neutral-700/60 bg-neutral-900/60 text-neutral-100 hover:border-accentPrimary/60 hover:bg-neutral-900/80"
                  >
                    {reportLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
                {reportError && (
                  <div className="rounded border border-red-600/50 bg-red-600/10 p-3 text-sm text-red-300">
                    {reportError}
                  </div>
                )}
                {reportSuccess && (
                  <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {reportSuccess}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up-delayed">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-accentPrimary">Stakeholder Comments</CardTitle>
                  <CardDescription>Latest 20 comments with sentiment insights</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                  onClick={() => loadDraftComments(draft.id)}
                  disabled={isCommentsLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isCommentsLoading ? 'animate-spin text-accentPrimary' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isCommentsLoading ? (
                  <div className="text-center py-10">
                    <RefreshCw className="h-6 w-6 animate-spin text-accentPrimary mx-auto mb-3" />
                    <p className="text-sm text-neutral-500">Loading comments...</p>
                  </div>
                ) : commentsError ? (
                  <div className="rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                    <p>{commentsError}</p>
                    <button
                      onClick={() => loadDraftComments(draft.id)}
                      className="mt-3 inline-flex items-center gap-2 rounded bg-red-500/20 px-3 py-1 text-xs text-red-200 hover:bg-red-500/30 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  </div>
                ) : draftComments.length === 0 ? (
                  <div className="text-center py-10 text-sm text-neutral-500">
                    No comments yet for this draft.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {draftComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 space-y-3 transition-all duration-300 ease-[var(--ease-out-expo)] hover:border-accentPrimary/60 hover:shadow-[0_18px_40px_-28px_rgba(16,185,129,0.45)] animate-fade-in-up"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Badge className={getSentimentBadgeClasses(comment.sentiment_analysis)}>
                            {comment.sentiment_analysis ? comment.sentiment_analysis : 'Sentiment unknown'}
                          </Badge>
                          {comment.sentiment_score && (
                            <span className={getSentimentScoreClasses(comment.sentiment_score)}>
                              Score: {comment.sentiment_score}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                          {comment.comment}
                        </p>
                        {comment.sentiment_keywords && (
                          <div className="text-xs text-neutral-400">
                            Keywords: <span className="font-mono text-neutral-300">{comment.sentiment_keywords}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
  <div className="p-6 animate-fade-in-up">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-accentPrimary mb-2">Available Drafts</h2>
          <p className="text-neutral-400">Select a draft to view its sentiment analysis dashboard</p>
        </div>

  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drafts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-neutral-500 text-lg mb-2">No drafts available</div>
              <div className="text-neutral-600 text-sm">Upload a draft to get started with sentiment analysis</div>
            </div>
          ) : (
            drafts.map((draft) => (
              <Card
                key={draft.id}
                className="glow-ring hover-lift cursor-pointer border-neutral-800/60 bg-neutral-900/80 transition-colors backdrop-blur-xl animate-fade-in-up"
                onClick={() => {
                  setSelectedDraft(draft.id)
                  if (!draft.draft && !draft.summary) {
                    fetchDraftDetails(draft.id)
                  }
                  if (!commentsByDraft[draft.id]) {
                    loadDraftComments(draft.id)
                  }
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-white text-lg">{draft.title || 'Untitled Draft'}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={draft.status === "Active" ? "default" : "secondary"}
                        className="bg-accentPrimary text-accentPrimary-foreground"
                      >
                        {draft.status || 'Draft'}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(draft.id)
                        }}
                        className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <CardDescription className="text-neutral-400">ID: {draft.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Comments:</span>
                    <span className="text-accentPrimary font-mono">
                      {typeof draft.commentsCount === 'number' ? draft.commentsCount.toLocaleString() : '…'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderUploadPage = () => (
    <div className="p-6 mx-auto max-w-4xl animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-accentPrimary mb-2">Upload Comments</h2>
        <p className="text-neutral-400">Submit individual comments or bulk upload via CSV</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-accentPrimary">Single Comment</CardTitle>
            <CardDescription>Submit an individual comment for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Draft Selection</label>
                <select
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                  value={commentDraftId}
                  onChange={(e) => setCommentDraftId(e.target.value)}
                  required
                >
                  <option value="">Select a draft...</option>
                  {drafts.map((draft) => (
                    <option key={draft.id} value={draft.id}>
                      {draft.title || "Untitled Draft"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Comment Text</label>
                <textarea
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white h-32 resize-none"
                  placeholder="Enter your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
              </div>
              {commentError && (
                <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {commentError}
                </div>
              )}
              {commentSuccess && (
                <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {commentSuccess}
                </div>
              )}
              {lastCommentResponse && (
                <div className="rounded border border-accentPrimary/40 bg-accentPrimary/10 px-3 py-2 text-sm text-accentPrimary space-y-1">
                  <div className="font-medium text-accentPrimary-foreground">Saved Comment Details</div>
                  <div className="text-neutral-200">ID: <span className="font-mono text-sm">{lastCommentResponse.id}</span></div>
                  <div className="text-neutral-200">
                    Sentiment: {lastCommentResponse.sentiment_analysis || 'N/A'}{' '}
                    <span className="text-neutral-400">
                      (score{' '}
                      <span className={getSentimentScoreClasses(lastCommentResponse.sentiment_score)}>
                        {lastCommentResponse.sentiment_score || 'N/A'}
                      </span>
                      )
                    </span>
                  </div>
                  {lastCommentResponse.sentiment_keywords && (
                    <div className="text-neutral-200">Keywords: {lastCommentResponse.sentiment_keywords}</div>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={commentLoading || drafts.length === 0}
                title={drafts.length === 0 ? "Upload a draft first" : undefined}
              >
                {commentLoading ? 'Submitting...' : 'Submit Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>

  <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up-delayed">
          <CardHeader>
            <CardTitle className="text-accentPrimary">Bulk Upload</CardTitle>
            <CardDescription>Upload multiple comments via CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkCsvSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Draft Selection</label>
                <select
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                  value={bulkDraftId}
                  onChange={(e) => setBulkDraftId(e.target.value)}
                  required
                >
                  <option value="">Select a draft...</option>
                  {drafts.map((draft) => (
                    <option key={draft.id} value={draft.id}>
                      {draft.title || "Untitled Draft"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">CSV File</label>
                <label
                  htmlFor="bulk-comment-file"
                  className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${bulkCommentFile ? 'border-accentPrimary/70 bg-accentPrimary/5' : 'border-neutral-700 hover:border-accentPrimary/70'}`}
                >
                  <Upload className="w-12 h-12 text-neutral-500" />
                  <div className="space-y-1">
                    <p className="text-neutral-300 text-sm font-medium">
                      {bulkCommentFile ? bulkCommentFile.name : 'Drop your CSV file here or click to browse'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Supported format: CSV with columns such as comment, sentiment_analysis, sentiment_score, sentiment_keywords
                    </p>
                  </div>
                  <input
                    id="bulk-comment-file"
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleBulkFileChange}
                    ref={bulkFileInputRef}
                  />
                </label>
                {bulkCommentFile && (
                  <div className="flex items-center justify-between rounded border border-neutral-700 bg-neutral-800/60 px-3 py-2 mt-3 text-xs text-neutral-300">
                    <span className="truncate">Selected: {bulkCommentFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkCommentFile(null)
                        setBulkCommentError(null)
                        setBulkCommentSuccess(null)
                        setBulkCommentResult(null)
                        if (bulkFileInputRef.current) {
                          bulkFileInputRef.current.value = ''
                        }
                      }}
                      className="text-accentPrimary hover:text-accentPrimary/80"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              {bulkCommentError && (
                <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {bulkCommentError}
                </div>
              )}
              {bulkCommentSuccess && (
                <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {bulkCommentSuccess}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={bulkCommentLoading || !bulkDraftId || !bulkCommentFile}
                title={!bulkDraftId ? 'Select a draft first' : undefined}
              >
                {bulkCommentLoading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </form>

            {bulkCommentResult && bulkCommentResult.length > 0 && (
              <div className="mt-6 space-y-3 text-sm text-neutral-200">
                <div className="text-neutral-400 text-xs uppercase tracking-wide">Preview ({Math.min(3, bulkCommentResult.length)} of {bulkCommentResult.length})</div>
                <div className="space-y-3">
                  {bulkCommentResult.slice(0, 3).map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded border border-neutral-700 bg-neutral-900/80 p-3 transition-all duration-300 ease-[var(--ease-out-expo)] hover:border-accentPrimary/60 hover:shadow-[0_14px_30px_-22px_rgba(16,185,129,0.35)] animate-fade-in-up"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge className={`${getSentimentBadgeClasses(comment.sentiment_analysis)} text-xs`}>
                          {comment.sentiment_analysis || 'N/A'}
                        </Badge>
                        {comment.sentiment_score && (
                          <span className={getSentimentScoreClasses(comment.sentiment_score)}>Score: {comment.sentiment_score}</span>
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-300">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAddDraftPage = () => {
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      setNewDraftError(null)
      if (!file) {
        setNewDraftFile(null)
        return
      }
      if (file.type !== 'application/pdf') {
        setNewDraftError('Please upload a PDF file (.pdf).')
        setNewDraftFile(null)
        return
      }
      const maxBytes = 20 * 1024 * 1024
      if (file.size > maxBytes) {
        setNewDraftError('File too large. Max size is 20MB.')
        setNewDraftFile(null)
        return
      }
      setNewDraftFile(file)
    }

    const onAdd = async (e: React.FormEvent) => {
      e.preventDefault()
      setNewDraftError(null)
      if (!newDraftFile) {
        setNewDraftError('Please select a PDF file to upload.')
        return
      }
      setNewDraftLoading(true)
      try {
        const resp = await uploadDraft(newDraftFile)
        const created: Draft = {
          id: resp.id,
          title: newDraftFile.name.replace(/\.pdf$/i, ''),
          status: 'Active' as const,
          commentsCount: 0,
          draft: resp.draft,
          summary: resp.summary,
          user_id: resp.user_id,
        }
        setDrafts((prev) => [created, ...prev])
        setActiveSection('dashboard')
        setSelectedDraft(created.id)
        setNewDraftFile(null)
      } catch (error: unknown) {
        const raw = error instanceof Error ? error.message : 'Failed to upload draft'
        const lower = raw.toLowerCase()
        if (lower.includes('unauthorized') || lower.includes('invalid authentication') || lower.includes('401') || lower.includes('not authenticated')) {
          setNewDraftError('Authentication required. Please log in before uploading.')
        } else {
          setNewDraftError(raw)
        }
      } finally {
        setNewDraftLoading(false)
      }
    }
    return (
  <div className="p-6 mx-auto max-w-3xl animate-fade-in-up">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-accentPrimary mb-2">Add Draft</h2>
          <p className="text-neutral-400">Create a new draft entry for analysis</p>
        </div>
  <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-accentPrimary">Upload Draft (PDF)</CardTitle>
            <CardDescription>Only a PDF file is required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">PDF File</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={onFileChange}
                  className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-accentPrimary file:text-accentPrimary-foreground hover:file:bg-accentPrimary/90"
                />
                <p className="text-xs text-neutral-500 mt-2">Only PDF files up to 20MB are supported.</p>
                {newDraftFile && (
                  <div className="text-xs text-neutral-400 mt-2">Selected: {newDraftFile.name} ({(newDraftFile.size / 1024 / 1024).toFixed(2)} MB)</div>
                )}
                {newDraftError && (
                  <div className="mt-2 text-sm p-3 rounded border bg-red-900/30 border-red-600 text-red-300">{newDraftError}</div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!newDraftFile || newDraftLoading || !isAuthed}
                className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newDraftLoading ? 'Uploading…' : 'Add Draft'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSettingsPage = () => {
    const handleSave = (e: React.FormEvent) => {
      e.preventDefault()
      if (newPassword && newPassword !== confirmPassword) {
        setSettingsAlert({ type: "error", text: "New password and confirmation do not match." })
        return
      }
      setSettingsAlert({ type: "success", text: "Settings updated (frontend only, not persisted)." })
      setNewPassword("")
      setConfirmPassword("")
    }


  if (isAuthed !== true) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-300">
        Redirecting to login…
      </div>
    )
  }
    return (
  <div className="p-6 mx-auto max-w-2xl animate-fade-in-up">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-accentPrimary mb-2">Settings</h2>
          <p className="text-neutral-400">Update your account details (frontend only)</p>
        </div>

  <Card className="glow-ring hover-lift bg-neutral-900/80 border-neutral-800/70 backdrop-blur-xl animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-accentPrimary">Account</CardTitle>
            <CardDescription>Change username and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                />
              </div>

              {settingsAlert && (
                <div
                  className={`text-sm p-3 rounded border ${settingsAlert.type === "success"
                    ? "bg-green-900/30 border-green-600 text-green-300"
                    : "bg-red-900/30 border-red-600 text-red-300"
                    }`}
                >
                  {settingsAlert.text}
                </div>
              )}
              <Button type="submit" className="w-full bg-accentPrimary hover:bg-accentPrimary/90 text-accentPrimary-foreground">
                Save Settings
              </Button>
              <p className="text-xs text-neutral-500 text-center mt-2">
                Note: This is a client-side demo only. Changes are not persisted.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} fixed z-50 h-full border-r border-neutral-700/60 bg-neutral-900/70 backdrop-blur-2xl transition-all duration-300 md:relative md:z-auto md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-accentPrimary font-bold text-lg tracking-wider">MCA eCONSULTATION</h1>
              <p className="text-neutral-500 text-xs">SENTIMENT ANALYSIS v1.0</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-accentPrimary"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
              { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
              { id: "upload", icon: Upload, label: "UPLOAD COMMENT" },
              { id: "add-draft", icon: FileText, label: "ADD DRAFT" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${activeSection === item.id
                  ? "bg-accentPrimary text-accentPrimary-foreground"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}

            {!sidebarCollapsed && (
              <div className="pt-4">
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2 px-3">My Profile</div>
                {[
                  { id: "settings", icon: Settings, label: "SETTINGS" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${activeSection === item.id
                      ? "bg-accentPrimary text-accentPrimary-foreground"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white">SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-neutral-500">
                <div>UPTIME: 99.7%</div>
                <div>DRAFTS: {drafts.length} ACTIVE</div>
                <div>COMMENTS: READY FOR ANALYSIS</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`flex flex-1 flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        <div className="flex h-16 items-center justify-between border-b border-neutral-700/60 bg-neutral-900/70 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              MCA eCONSULTATION /{" "}
              <span className="text-accentPrimary">{activeSection.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-accentPrimary">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-neutral-400 hover:text-accentPrimary">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeSection === "dashboard" && renderDashboardContent()}
          {activeSection === "upload" && renderUploadPage()}
          {activeSection === "add-draft" && renderAddDraftPage()}
          {activeSection === "settings" && renderSettingsPage()}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Draft</h3>
            <p className="text-neutral-300 mb-4">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded text-red-400 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setConfirmDeleteId(null)
                  setDeleteError(null)
                }}
                disabled={deletingDraftId === confirmDeleteId}
                className="px-4 py-2 text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(confirmDeleteId)}
                disabled={deletingDraftId === confirmDeleteId}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingDraftId === confirmDeleteId ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
