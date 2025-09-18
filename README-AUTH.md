# Authentication Setup

This project includes basic auth pages and middleware.

- Login page: `/login`
- Signup page: `/signup`
- Protected routes: all pages except `/login`, `/signup`, assets, and API routes.
- Cookie used: `authToken`

## Backend Endpoints

Set the base URL via `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3001`). Expected JSON APIs (POST):

- `/auth/login` → request `{ email, password }` → response `{ token, user? }`
- `/auth/signup` → request `{ name, email, password }` → response `{ token? , user? }` or `{ message }`

## Client Helpers

See `lib/auth-client.ts` for `login` and `signup` helpers.

## Local Development

1. Copy `.env.local.example` to `.env.local` and update values
2. Install deps and run:

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

3. Visit `http://localhost:3000/login`

## Demo Credentials (No Backend)

You can bypass the backend entirely by enabling demo auth:

\`\`\`
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
NEXT_PUBLIC_DEMO_PASSWORD=demo1234
\`\`\`

Use those credentials on the login page. A fake token `demo-token` will be set, and middleware will allow access.
