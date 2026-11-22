# Matcha resume checker

## Run locally

1. Install dependencies with `npm.cmd install`.
2. Copy `server/.env.example` to `server/.env` and set `LABD_API_KEY` to your Labd API key. `LABD_API_URL` is optional and defaults to the Labd chat endpoint.
3. Run `npm.cmd run dev:all`.
4. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

The Vite development server proxies `/api` requests to the Express API on port 3001. Alternatively, run `npm.cmd run dev` and `npm.cmd run server` in separate terminals.

## Analysis and report storage

The browser extracts text from the selected PDF/DOCX on the user's device. Only after the user checks the consent box and requests an analysis, the extracted resume text and job description are sent to the Express server and then to Labd using the server-side `LABD_API_KEY`. The original file stays in the browser, and the key must never be placed in frontend code.

Successful analysis reports are saved as JSON in `server/reports/`. Reports are ignored by Git and are not pushed to the remote repository. Each report contains the AI response and metadata; the original resume and job description are not stored. Treat the report directory as sensitive local data and remove reports when they are no longer needed.

The browser also displays a local keyword-overlap estimate. This score is not a hiring prediction. Uploaded files are limited to 10 MB and job descriptions to 16,000 characters.

## Production

Build the frontend with `npm.cmd run build`, then set `$env:NODE_ENV = "production"` and run `npm.cmd run server` in PowerShell. Express serves the built `dist/` files and the `/api` endpoints from the same origin. Provide `LABD_API_KEY` through the server environment or `server/.env`; never commit an actual API key.

## Vercel deployment

The root `api/[...path].js` entry exposes the Express API as a Vercel Function, so `/api/analyze` and `/api/health` use the same routes as local development. Add `LABD_API_KEY` in the Vercel project's Environment Variables for each deployment environment, then redeploy. Do not rely on `server/.env` in a Vercel deployment.

Vercel function filesystems are temporary, so analysis reports are returned to the browser but are not saved to `server/reports/` in Vercel. Local runs continue to save reports there.
