# Lexalytics Frontend

A Next.js 14 frontend for a sentiment analysis and public consultation dashboard (MCA eConsultation). It provides authentication, a protected dashboard, comment uploads (single + bulk), draft management (including PDF uploads), and data visualizations.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Features

- Authentication: Login, Signup, and Logout with route protection via middleware
- Dashboard: Draft list with per‑draft analytics (placeholders for charts/heatmaps)
- Uploads:
  - Single comment entry
  - Bulk CSV upload with draft selection
  - Add Draft via PDF upload (client-side flow; wire to backend endpoint)
- Profile and Settings: Basic UI scaffolding
- Modern UI: Tailwind CSS, shadcn/ui components, Lucide icons

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript + React 18
- Styling: Tailwind CSS + shadcn/ui (Radix UI)
- Charts/UX: Recharts, vaul, cmdk, etc.

## Monorepo/Folder Structure

\`\`\`
app/
  login/             # Login page
  signup/            # Signup page
  ...                # Dashboard + sections (upload, settings, etc.)
components/          # UI primitives (shadcn/ui)
lib/                 # Client helpers (auth, API)
public/              # Static assets
styles/              # Global styles
types/               # Shared types
\`\`\`

## Getting Started

1. Requirements
   - Node.js 18+
   - pnpm (recommended) or npm/yarn

2. Install dependencies

\`\`\`bash
pnpm install
\`\`\`

3. Configure environment

Create `.env.local` at the project root:

\`\`\`bash
# Base URL for your backend API (auth, drafts, comments, etc.)
NEXT_PUBLIC_API_BASE_URL=https://api.lexalytics.me

# Optional: separate base for sentiment data if used by lib/sentiment-api.ts
# If unset, it defaults to http://localhost:8000 in that file
# NEXT_PUBLIC_API_URL=https://api.lexalytics.me

# (Optional) Demo auth flags for local-only testing without a backend
# NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
# NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
# NEXT_PUBLIC_DEMO_PASSWORD=demo1234
\`\`\`

4. Run the dev server

\`\`\`bash
pnpm dev
\`\`\`

Open http://localhost:3000. You’ll be redirected to `/login` until authenticated.

5. Production build

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## Authentication

- Pages: `/login`, `/signup`
- Middleware: `middleware.ts` enforces `authToken` cookie for protected routes
- Client helper: `lib/auth-client.ts`
  - `login(email, password)` → POST `${NEXT_PUBLIC_API_BASE_URL}/api/v1/login/login`
    - Expects `{ access_token, token_type }` and sets `authToken` client cookie
  - `signup(name, email, password)` → POST `${NEXT_PUBLIC_API_BASE_URL}/api/v1/login/register`
    - Expects `{ id, username, email }`
  - `logout()` clears the `authToken` cookie

Security recommendation: In production, prefer setting an HttpOnly `authToken` cookie from the backend after login to protect against XSS. The current client-set cookie is suitable for prototyping.

## Core Pages & Flows

- Dashboard (`/`):
  - Draft list: click to view analytics for a draft (placeholder cards)
  - Top toolbar includes last update time and logout button
- Upload (`UPLOAD COMMENT`):
  - Single comment form
  - Bulk upload card: choose a draft, select/upload CSV
- Add Draft (`ADD DRAFT`):
  - Upload a PDF and provide title/status; adds the draft to the list
- Profile/Settings: Non-persistent UI scaffolding for future expansion

## Backend API (assumed implemented)

Base URL: `${NEXT_PUBLIC_API_BASE_URL}` (default `https://api.lexalytics.me`)

- Auth
  - POST `/api/v1/login/register` — body `{ username, email, password }` → `{ id, username, email }`
  - POST `/api/v1/login/login` — body `{ email, password }` → `{ access_token, token_type }`
- Drafts
  - POST `/api/v1/drafts/upload` — `multipart/form-data` with fields:
    - `file`: PDF file
    - `title`: string
    - `status`: `Active` | `Closed`
    - Returns: `{ id, title, uploadDate, status }`
  - GET `/api/v1/drafts` — list drafts
  - GET `/api/v1/drafts/:id` — draft details
- Comments
  - POST `/api/v1/comments` — add single comment `{ draftId, commentText, stakeholderId? }`
  - POST `/api/v1/comments/bulk` — `multipart/form-data` CSV with headers `draft_id,comment_text,stakeholder_id`
- Sentiment (if applicable)
  - `lib/sentiment-api.ts` reads from `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`
  - Example: GET `${NEXT_PUBLIC_API_URL}/api/sentiment/analysis`

Note: Endpoint paths are provided for integration guidance and can be adapted to your backend.

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend base for auth/drafts/comments (default `https://api.lexalytics.me`)
- `NEXT_PUBLIC_API_URL` (optional): Base for sentiment API (`lib/sentiment-api.ts`)
- Demo (optional for local dev only):
  - `NEXT_PUBLIC_ENABLE_DEMO_AUTH`, `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD`

## Deployment

- Recommended: Vercel or any Node.js host
- Set the same env vars in your hosting provider
- Ensure your backend supports CORS for the frontend origin (if hosting separately)

## Development Notes

- Code style: TypeScript strict, Prettier/Tailwind recommended
- UI: shadcn/ui components live under `components/ui`
- Routing: App Router under `app/`
- Middleware: `middleware.ts` protects routes by cookie presence

## Roadmap

- Wire Add Draft (PDF) and Bulk Upload to real endpoints with `FormData`
- Replace placeholder analytics with actual charts and data
- Improve auth to use HttpOnly cookies + refresh tokens
- Centralize API config (`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_URL`)

## Contributing

Contributions are welcome! Please open an issue to discuss changes or submit a PR.

Suggested steps:
- Fork the repo and create a feature branch
- Add tests (if applicable) and ensure `pnpm build` passes
- Open a PR with a clear description and screenshots (if UI changes)

## Security

If you discover a security issue, please do not open a public issue. Instead, contact the maintainers directly to coordinate a fix.

## License

Choose an open-source license (e.g., MIT, Apache-2.0) and add a `LICENSE` file in the repo root. Update this section accordingly.
