"use client"

import { useState } from "react"
import { ChevronRight, BarChart3, Upload, FileText, User, Settings, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for drafts
const mockDrafts = [
  {
    id: "DRAFT-2024-001",
    title: "Companies Act Amendment Bill 2024",
    uploadDate: "2024-03-15",
    status: "Active",
    commentsCount: 1247,
  },
  {
    id: "DRAFT-2024-002",
    title: "Corporate Social Responsibility Guidelines",
    uploadDate: "2024-03-10",
    status: "Active",
    commentsCount: 892,
  },
  {
    id: "DRAFT-2024-003",
    title: "Digital Governance Framework",
    uploadDate: "2024-03-05",
    status: "Closed",
    commentsCount: 2156,
  },
  {
    id: "DRAFT-2024-004",
    title: "Startup India Policy Revision",
    uploadDate: "2024-02-28",
    status: "Active",
    commentsCount: 634,
  },
]

export default function MCADashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null)

  const renderDashboardContent = () => {
    if (selectedDraft) {
      const draft = mockDrafts.find((d) => d.id === selectedDraft)
      return (
        <div className="p-6 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <button onClick={() => setSelectedDraft(null)} className="hover:text-orange-500 transition-colors">
              Dashboard
            </button>
            <span>/</span>
            <span className="text-orange-500">{draft?.title}</span>
          </div>

          {/* Draft Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Sentiment Summary */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Overall Sentiment</CardTitle>
                <CardDescription>Aggregated feedback analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400">Positive</span>
                    <span className="text-green-400 font-mono">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400">Neutral</span>
                    <span className="text-yellow-400 font-mono">21%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400">Negative</span>
                    <span className="text-red-400 font-mono">12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Heatmap Placeholder */}
            <Card className="bg-neutral-900 border-neutral-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-orange-500">Sentiment Heatmap</CardTitle>
                <CardDescription>Sentiment distribution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-neutral-800 rounded border border-neutral-600 flex items-center justify-center">
                  <span className="text-neutral-500 font-mono">[HEATMAP VISUALIZATION]</span>
                </div>
              </CardContent>
            </Card>

            {/* Word Cloud */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Key Terms</CardTitle>
                <CardDescription>Most frequent keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-neutral-800 rounded border border-neutral-600 flex items-center justify-center">
                  <span className="text-neutral-500 font-mono">[WORD CLOUD]</span>
                </div>
              </CardContent>
            </Card>

            {/* Impactful Comments */}
            <Card className="bg-neutral-900 border-neutral-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-orange-500">Most Impactful Comments</CardTitle>
                <CardDescription>Highlighted stakeholder feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-800 rounded border border-neutral-600">
                    <p className="text-sm text-neutral-300 mb-2">
                      "The proposed amendments will significantly impact small businesses..."
                    </p>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Impact Score: 8.7/10</span>
                      <span>Stakeholder ID: STK-2024-0847</span>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-800 rounded border border-neutral-600">
                    <p className="text-sm text-neutral-300 mb-2">
                      "Implementation timeline needs reconsideration for compliance..."
                    </p>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Impact Score: 8.3/10</span>
                      <span>Stakeholder ID: STK-2024-1203</span>
                    </div>
                  </div>
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
          {mockDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="bg-neutral-900 border-neutral-700 hover:border-orange-500 transition-colors cursor-pointer"
              onClick={() => setSelectedDraft(draft.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-white text-lg">{draft.title}</CardTitle>
                  <Badge
                    variant={draft.status === "Active" ? "default" : "secondary"}
                    className="bg-orange-500 text-black"
                  >
                    {draft.status}
                  </Badge>
                </div>
                <CardDescription className="text-neutral-400">ID: {draft.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Upload Date:</span>
                    <span className="text-neutral-300 font-mono">{draft.uploadDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Comments:</span>
                    <span className="text-orange-500 font-mono">{draft.commentsCount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                {mockDrafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.title}
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
              <label className="block text-sm font-medium text-neutral-300 mb-2">CSV File</label>
              <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-400 mb-2">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-neutral-500">
                  Supported format: CSV with columns: draft_id, comment_text, stakeholder_id
                </p>
              </div>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black">Upload CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderProfilePage = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-2">My Profile</h2>
        <p className="text-neutral-400">Manage your comments and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-orange-500">My Comments</CardTitle>
            <CardDescription>Your submitted comments across all drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-neutral-800 rounded border border-neutral-600">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-orange-500">Companies Act Amendment Bill 2024</span>
                  <span className="text-xs text-neutral-500">2024-03-14</span>
                </div>
                <p className="text-sm text-neutral-300">
                  The proposed changes to Section 12 require careful consideration...
                </p>
              </div>
              <div className="p-4 bg-neutral-800 rounded border border-neutral-600">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-orange-500">CSR Guidelines</span>
                  <span className="text-xs text-neutral-500">2024-03-12</span>
                </div>
                <p className="text-sm text-neutral-300">
                  Implementation timeline should be extended for better compliance...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-orange-500">Settings</CardTitle>
            <CardDescription>Account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email Notifications</label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-neutral-400">New draft alerts</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Language</label>
              <select className="w-full p-2 bg-neutral-800 border border-neutral-600 rounded text-white text-sm">
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
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
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
              { id: "dashboard", icon: BarChart3, label: "DASHBOARD" },
              { id: "analytics", icon: FileText, label: "ANALYTICS" },
              { id: "upload", icon: Upload, label: "UPLOAD COMMENT" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
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
                    className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                      activeSection === item.id
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
                <div>DRAFTS: {mockDrafts.length} ACTIVE</div>
                <div>COMMENTS: 4.9K ANALYZED</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              MCA eCONSULTATION / <span className="text-orange-500">{activeSection.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">
              LAST UPDATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {(activeSection === "dashboard" || activeSection === "analytics") && renderDashboardContent()}
          {activeSection === "upload" && renderUploadPage()}
          {(activeSection === "profile" || activeSection === "settings") && renderProfilePage()}
        </div>
      </div>
    </div>
  )
}
