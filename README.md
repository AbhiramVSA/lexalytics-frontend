<p align="center">
  <img src="public/favicon.svg" alt="Lexalytics L mark" width="64">
</p>

<h1 align="center">Lexalytics Frontend</h1>

<p align="center">A Next.js interface for a public-consultation dashboard and its external API.</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#run-locally">Run locally</a> ·
  <a href="#frontend-api-contract">API contract</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#limits">Limits</a>
</p>

## Overview

This repository contains a Next.js 14.2.16 App Router frontend. The backend API is external and is not part of this repository.

- `/` redirects to `/login`.
- The dashboard checks for a token in the browser before it loads dashboard data.
- The `operations`, `systems`, `intelligence`, and `agent-network` pages contain sample records.
- The `my-comments` page is a placeholder.
- The dashboard client sends draft, comment, report, and sentiment requests to configured API services.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. The home page redirects to `/login`.

To create a production build, run:

```bash
pnpm build
pnpm start
```

## Frontend API contract

These are the request paths that the frontend helpers use. The backend routes are not defined in this repository.

| Method | Path | Use |
| --- | --- | --- |
| `POST` | `/api/v1/login/login` | Sign in |
| `POST` | `/api/v1/login/register` | Register an account |
| `POST` | `/api/v1/draft/` | Upload a draft PDF |
| `GET` | `/api/v1/draft/?limit=20` | List drafts |
| `GET` | `/api/v1/draft/drafts/{draftId}` | Read a draft |
| `DELETE` | `/api/v1/draft/{draftId}` | Delete a draft |
| `POST` | `/api/v1/draft/{draftId}/report` | Request a PDF report |
| `POST` | `/api/v1/comment/draft/{draftId}` | Add a comment |
| `GET` | `/api/v1/comment/draft/{draftId}?limit=20` | List comments |
| `POST` | `/api/v1/comment/draft/{draftId}/csv` | Upload comments from a CSV file |

The sentiment client uses `GET /api/sentiment/analysis` and `GET /api/sentiment/agent/{agentId}`. It uses a separate base URL.

## Configuration

Set these values in `.env.local` when the service URLs differ from the defaults:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api.lexalytics.me
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`NEXT_PUBLIC_API_BASE_URL` is the default base URL for login, drafts, and comments. `NEXT_PUBLIC_API_URL` is the default base URL for sentiment requests. Next.js includes `NEXT_PUBLIC_` values in browser code. Do not put secrets in these values.

## Limits

The middleware passes matched requests through. It does not enforce access to pages. The dashboard checks for a token in the browser, and the token helper stores the token in `localStorage`. This client-side check does not protect server routes.

The frontend sends the token in an `Authorization` header. The API must implement the routes above and allow requests from the frontend origin. This repository does not include or verify that API.

The root `LICENSE` file is absent. No license terms are provided in this checkout.

## Security

If you discover a security issue, please do not open a public issue. Instead, contact the maintainers directly to coordinate a fix.
