# TYFYS App Starter

A deliver-ready starter for the TYFYS veteran self-serve app, including a React/Vite frontend, Express backend, tracker state machine, copy deck, Zoho-safe CRM layout map, and OpenAPI spec scaffold.

## Quickstart

### Backend (mock Zoho mode)
```bash
cd apps/backend
cp .env.example .env
npm install
npm run dev
```
The backend runs on http://localhost:4000 by default. It exposes tracker APIs, mock Zoho Sign/Forms flows, and webhook listeners that update an in-memory tracker state.

### Frontend
```bash
cd apps/frontend
cp .env.example .env
npm install
npm run dev
```
The frontend runs on http://localhost:5173 and connects to the backend API. Use the **Create Demo Case** button to spin up a sample tracker session, then advance through steps using the mock action buttons that mirror Zoho Sign/Forms and provider completion events.

### OpenAPI spec
`config/openapi.yaml` documents the backend endpoints. Extend it as you connect to real Zoho credentials.

### Tracker state machine
`config/tracker-stages.json` defines the 14-stage process with gating requirements so veterans cannot skip ahead. The backend enforces these gates, and the frontend renders them in the Domino's-style tracker.

### CRM isolation
`crm/field-map.yaml` outlines dedicated layouts, pipelines, and custom modules (e.g., TYFYS App Case, TYFYS App Activity) to keep self-serve traffic isolated from rep-led pipelines.

## Production readiness
- Replace mock Zoho flags in `apps/backend/.env` and supply real credentials.
- Configure Zoho Sign and Zoho Forms webhooks to hit `/api/webhooks/zoho-sign` and `/api/webhooks/zoho-forms`.
- Adjust copy and evidence checklists in `content/copy` and `content/checklists` to match live materials.

## Not the VA / VSO
All public-facing copy clarifies TYFYS is not the VA or a VSO and avoids naming outside companies in the UI.

## Landing splash + intake portal
- The `index.html` splash experience stays intact as the entry point; the embedded intake assistant posts data into the client portal/claim tracker without replacing the overlay.
- Intake submissions are stored locally and hydrated back into the client info panel so the portal always reflects what a veteran entered on the splash page.
