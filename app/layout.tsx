import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sentinel Ops Dashboard",
  description: "Operational intelligence console for sentiment and consultation analytics",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground antialiased min-h-screen overflow-x-hidden`}
      >
        <div className="pointer-events-none fixed inset-0 -z-30 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5" />
        <div className="pointer-events-none fixed inset-0 -z-20 opacity-40 blur-3xl" style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.25), transparent 55%)',
        }} />
        <main className="relative z-10 flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
