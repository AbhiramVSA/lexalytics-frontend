# Authentication notes

The current frontend sends login and registration requests to the external API. See [README.md](README.md#frontend-api-contract) for the request paths and base URL settings.

The login helper stores the returned token in browser `localStorage`. The dashboard checks for that token in the browser. `middleware.ts` passes requests through and does not enforce page access.

The backend is not included in this repository. The frontend does not set an `HttpOnly` cookie or provide server-side route protection.
