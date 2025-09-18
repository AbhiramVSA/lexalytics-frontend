"use client"

import { useEffect, useState } from "react"
import { ChevronRight, BarChart3, Upload, FileText, User, Settings, RefreshCw, LogOut, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { uploadDraft, getDraft, listDrafts, deleteDraft } from "@/lib/drafts"
import { getToken, setToken, clearToken as clearStoredToken } from "@/lib/token"

interface Draft {
  id: string;
  title?: string; // Optional for display purposes, derived from draft content
  uploadDate?: string; // Optional for display purposes
  status?: string; // Optional for display purposes
  commentsCount?: number; // Optional for display purposes
  draft?: string; // The actual draft content from backend
  summary?: string; // The draft summary from backend
  user_id?: string; // User ID from backend
}

export default function MCADashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  // NEW: frontend-only settings state
  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [settingsAlert, setSettingsAlert] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [bulkDraftId, setBulkDraftId] = useState<string>("")

  const [newDraftFile, setNewDraftFile] = useState<File | null>(null)
  const [newDraftError, setNewDraftError] = useState<string | null>(null)
  const [loadingDraftDetails, setLoadingDraftDetails] = useState<boolean>(false)
  const [draftDetailsError, setDraftDetailsError] = useState<string | null>(null)
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newDraftLoading, setNewDraftLoading] = useState(false)
  const [isAuthed, setIsAuthed] = useState<boolean>(false)
  const [tokenInput, setTokenInput] = useState("")
  useEffect(() => {
    setIsAuthed(!!getToken())
  }, [])

  // Load drafts list when authenticated and on dashboard
  useEffect(() => {
    if (isAuthed && activeSection === 'dashboard') {
      loadDraftsList()
    }
  }, [isAuthed, activeSection])

  const handleLogout = () => {
    clearStoredToken()
    window.location.href = '/login'
  }

  const handleTokenSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) {
      setSettingsAlert({ type: 'error', text: 'Please enter a bearer token.' })
      return
    }
    setToken(tokenInput.trim())
    setIsAuthed(true)
    setSettingsAlert({ type: 'success', text: 'Token saved successfully.' })
    setTokenInput("")
  }

  const handleTokenClear = () => {
    clearStoredToken()
    setIsAuthed(false)
    setSettingsAlert({ type: 'success', text: 'Token cleared.' })
  }

  const fetchDraftDetails = async (draftId: string) => {
    setLoadingDraftDetails(true)
    setDraftDetailsError(null)
    
    try {
      console.log('Fetching details for draft:', draftId)
      const draftDetails = await getDraft(draftId)
      console.log('Received draft details:', Object.keys(draftDetails))
      
      // Update the draft in the drafts array with the fetched details
      setDrafts(prevDrafts => 
        prevDrafts.map(draft => 
          draft.id === draftId 
            ? { ...draft, ...draftDetails }
            : draft
        )
      )
    } catch (error) {
      console.error('Failed to fetch draft details:', error)
      setDraftDetailsError(error instanceof Error ? error.message : 'Failed to fetch draft details')
    } finally {
      setLoadingDraftDetails(false)
    }
  }

  const loadDraftsList = async () => {
    try {
      console.log('Loading drafts list...')
      const draftsList = await listDrafts()
      console.log('Received drafts list:', draftsList.length, 'items')
      
      // Convert the basic list items to full Draft objects with display info
      const draftsWithDisplayInfo = draftsList.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: undefined, // Will be filled when draft details are loaded
        uploadDate: undefined,
        status: 'Draft' as const,
        commentsCount: undefined,
        draft: undefined,
        summary: undefined,
      }))
      
      setDrafts(draftsWithDisplayInfo)
    } catch (error) {
      console.error('Failed to load drafts list:', error)
      // Don't show error to user here - they can still upload new drafts
      // Just log it for debugging
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    setDeletingDraftId(draftId)
    setDeleteError(null)
    
    try {
      console.log('Deleting draft:', draftId)
      await deleteDraft(draftId)
      console.log('Draft deleted successfully')
      
      // Remove the draft from the local state
      setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId))
      
      // If the deleted draft was selected, clear the selection
      if (selectedDraft === draftId) {
        setSelectedDraft(null)
      }
      
      // Close confirmation dialog
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
        // If selected draft doesn't exist, reset selection
        setSelectedDraft(null)
        return null
      }
      return (
        <div className="p-6 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <button onClick={() => setSelectedDraft(null)} className="hover:text-orange-500 transition-colors">
              Dashboard
            </button>
            <span>/</span>
            <span className="text-orange-500">{draft.title || 'Draft Details'}</span>
          </div>

          {/* Draft Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Draft Summary */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Executive Summary</CardTitle>
                <CardDescription>AI-generated draft summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {loadingDraftDetails ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-orange-500 mx-auto mb-2" />
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

            {/* Draft Content */}
            <Card className="bg-neutral-900 border-neutral-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-orange-500">Draft Content</CardTitle>
                <CardDescription>Full document text</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {loadingDraftDetails ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-orange-500 mx-auto mb-2" />
                      <span className="text-neutral-500">Loading draft content...</span>
                    </div>
                  ) : draftDetailsError ? (
                    <div className="text-center py-8">
                      <span className="text-red-400 text-sm">{draftDetailsError}</span>
                      <button 
                        onClick={() => fetchDraftDetails(draft.id)}
                        className="block mt-2 px-3 py-1 bg-orange-500 text-black text-xs rounded hover:bg-orange-600 transition-colors mx-auto"
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
          </div>

          {/* Analysis Actions */}
          <div className="mt-6">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Analysis Actions</CardTitle>
                <CardDescription>Perform sentiment analysis on this draft</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <button className="px-4 py-2 bg-orange-500 text-black rounded hover:bg-orange-600 transition-colors">
                    Run Sentiment Analysis
                  </button>
                  <button className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition-colors">
                    Generate Report
                  </button>
                  <button className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition-colors">
                    Export Data
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    // Default dashboard view with draft list
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-2">Available Drafts</h2>
          <p className="text-neutral-400">Select a draft to view its sentiment analysis dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-neutral-500 text-lg mb-2">No drafts available</div>
              <div className="text-neutral-600 text-sm">Upload a draft to get started with sentiment analysis</div>
            </div>
          ) : (
            drafts.map((draft) => (
              <Card
                key={draft.id}
                className="bg-neutral-900 border-neutral-700 hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedDraft(draft.id)
                  // Fetch draft details if they haven't been loaded yet
                  if (!draft.draft && !draft.summary) {
                    fetchDraftDetails(draft.id)
                  }
                }}
              >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-white text-lg">{draft.title || 'Untitled Draft'}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={draft.status === "Active" ? "default" : "secondary"}
                      className="bg-orange-500 text-black"
                    >
                      {draft.status || 'Draft'}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click
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
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Upload Date:</span>
                    <span className="text-neutral-300 font-mono">{draft.uploadDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Comments:</span>
                    <span className="text-orange-500 font-mono">
                      {draft.commentsCount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-2">Upload Comments</h2>
        <p className="text-neutral-400">Submit individual comments or bulk upload via CSV</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Comment Upload */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-orange-500">Single Comment</CardTitle>
            <CardDescription>Submit an individual comment for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Draft Selection</label>
              <select className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white">
                <option>Select a draft...</option>
                {drafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.title || 'Untitled Draft'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Comment Text</label>
              <textarea
                className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white h-32 resize-none"
                placeholder="Enter your comment here..."
              />
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black">Submit Comment</Button>
          </CardContent>
        </Card>

        {/* CSV Upload */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-orange-500">Bulk Upload</CardTitle>
            <CardDescription>Upload multiple comments via CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Draft Selection</label>
              <select
                className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                value={bulkDraftId}
                onChange={(e) => setBulkDraftId(e.target.value)}
              >
                <option value="">Select a draft...</option>
                {drafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.title || 'Untitled Draft'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">CSV File</label>
              <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-400 mb-2">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-neutral-500">
                  Supported format: CSV with columns: draft_id, comment_text, stakeholder_id
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!bulkDraftId}
              title={!bulkDraftId ? "Select a draft first" : undefined}
            >
              Upload CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderProfilePage = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-2">My Comments</h2>
        <p className="text-neutral-400">Your submitted comments across all drafts</p>
      </div>

      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-orange-500">Recent Comments</CardTitle>
          <CardDescription>Latest activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-neutral-500 text-lg mb-2">No comments yet</div>
            <div className="text-neutral-600 text-sm">Your submitted comments will appear here</div>
          </div>
        </CardContent>
      </Card>
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
        const uploadDate = new Date().toISOString().slice(0, 10)
        const created = {
          id: resp.id,
          title: newDraftFile.name.replace(/\.pdf$/i, ''),
          uploadDate,
          status: 'Active' as const,
          commentsCount: 0,
          draft: resp.draft, // Include draft content from upload response
          summary: resp.summary, // Include summary from upload response
          user_id: resp.user_id,
        }
        setDrafts((prev: any[]) => [created, ...prev])
        setActiveSection('dashboard')
        setSelectedDraft(created.id)
        setNewDraftFile(null)
      } catch (err: any) {
        const raw = (err?.message || 'Failed to upload draft') as string
        const lower = raw.toLowerCase()
        if (lower.includes('unauthorized') || lower.includes('invalid authentication') || lower.includes('401') || lower.includes('not authenticated')) {
          setNewDraftError('Authentication required. Please set your bearer token in Settings → Authentication section before uploading.')
        } else {
          setNewDraftError(raw)
        }
      } finally {
        setNewDraftLoading(false)
      }
    }
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-2">Add Draft</h2>
          <p className="text-neutral-400">Create a new draft entry for analysis</p>
        </div>
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-orange-500">Upload Draft (PDF)</CardTitle>
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
                  className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-orange-500 file:text-black hover:file:bg-orange-600"
                />
                <p className="text-xs text-neutral-500 mt-2">Only PDF files up to 20MB are supported.</p>
                {newDraftFile && (
                  <div className="text-xs text-neutral-400 mt-2">Selected: {newDraftFile.name} ({(newDraftFile.size / 1024 / 1024).toFixed(2)} MB)</div>
                )}
                {newDraftError && (
                  <div className="mt-2 text-sm p-3 rounded border bg-red-900/30 border-red-600 text-red-300">{newDraftError}</div>
                )}
              </div>

              {/* Authentication Status */}
              <div className={`p-3 rounded border ${isAuthed ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAuthed ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={`text-sm font-medium ${isAuthed ? 'text-green-400' : 'text-red-400'}`}>
                      {isAuthed ? 'Authenticated' : 'Not Authenticated'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const token = getToken()
                        console.log('Current token:', token)
                        
                        if (token) {
                          try {
                            // Decode JWT to check expiration
                            const parts = token.split('.')
                            const payload = JSON.parse(atob(parts[1]))
                            const exp = payload.exp
                            const now = Math.floor(Date.now() / 1000)
                            const isExpired = exp < now
                            
                            alert(`Token: Present\nExpires: ${new Date(exp * 1000).toLocaleString()}\nExpired: ${isExpired ? 'Yes' : 'No'}`)
                          } catch (e) {
                            alert(`Token: Present but invalid format`)
                          }
                        } else {
                          alert('Token: Missing')
                        }
                      }}
                      className="text-xs border-neutral-600 text-neutral-400 hover:bg-neutral-800"
                    >
                      Test Token
                    </Button>
                    {!isAuthed && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveSection('settings')}
                        className="text-xs border-red-600 text-red-400 hover:bg-red-900/30"
                      >
                        Set Token
                      </Button>
                    )}
                  </div>
                </div>
                {!isAuthed && (
                  <p className="text-xs text-red-300 mt-1">
                    You need to set your bearer token in Settings before uploading files.
                  </p>
                )}
              </div>

              <Button type="submit" disabled={!newDraftFile || newDraftLoading || !isAuthed} className="w-full bg-orange-500 hover:bg-orange-600 text-black disabled:opacity-50 disabled:cursor-not-allowed">{newDraftLoading ? 'Uploading…' : 'Add Draft'}</Button>
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
      // Simulate clear of password fields after "save"
      setNewPassword("")
      setConfirmPassword("")
    }

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-2">Settings</h2>
          <p className="text-neutral-400">Update your account details (frontend only)</p>
        </div>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-orange-500">Account</CardTitle>
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

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-black">
                Save Settings
              </Button>
              <p className="text-xs text-neutral-500 text-center mt-2">
                Note: This is a client-side demo only. Changes are not persisted.
              </p>
            </form>

            <div className="mt-8 border-t border-neutral-800 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-orange-500 font-medium">Authentication</div>
                  <div className="text-xs text-neutral-500">Status: {isAuthed ? <span className="text-green-400">Authenticated</span> : <span className="text-red-400">Not authenticated</span>}</div>
                </div>
              </div>
              <form onSubmit={handleTokenSave} className="space-y-3">
                <label className="block text-sm font-medium text-neutral-300">Paste Bearer Token</label>
                <input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste your bearer token here..."
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded text-white"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">Save Token</Button>
                  <Button type="button" variant="secondary" onClick={handleTokenClear} className="bg-neutral-700 hover:bg-neutral-600">Clear Token</Button>
                </div>
                <p className="text-xs text-neutral-500">
                  Enter your bearer token to authenticate API requests.
                </p>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""
          }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">MCA eCONSULTATION</h1>
              <p className="text-neutral-500 text-xs">SENTIMENT ANALYSIS v1.0</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"
                  }`}
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
                  ? "bg-orange-500 text-white"
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
                  { id: "profile", icon: User, label: "MY COMMENTS" },
                  { id: "settings", icon: Settings, label: "SETTINGS" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${activeSection === item.id
                      ? "bg-orange-500 text-white"
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

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              MCA eCONSULTATION /{" "}
              <span className="text-orange-500">{activeSection.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">
              LAST UPDATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
            <div className={`text-[10px] px-2 py-1 rounded ${isAuthed ? 'bg-green-900/30 text-green-300 border border-green-600' : 'bg-red-900/30 text-red-300 border border-red-600'}`}>
              {isAuthed ? 'Authenticated' : 'Not Authenticated'}
            </div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-neutral-400 hover:text-orange-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === "dashboard" && renderDashboardContent()}
          {activeSection === "upload" && renderUploadPage()}
          {activeSection === "add-draft" && renderAddDraftPage()}
          {activeSection === "profile" && renderProfilePage()}
          {activeSection === "settings" && renderSettingsPage()}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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
