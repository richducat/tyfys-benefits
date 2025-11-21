# TYFYS Claim Assistant (VA Form 21-526EZ demo)

This folder contains a self-contained Node/Express prototype for filling the VA Form 21-526EZ (NOV 2022) PDF using pdf-lib. It is now also wired into the shared backend so the form filler can be served at `/claim-assistant` alongside the main demo site.

## Quick start
1. Add the fillable PDF to `templates/vba-21-526ez-are.pdf` (NOV 2022 edition).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the standalone server (defaults to port `4100` to avoid clashing with the existing backend):
   ```bash
   npm start
   ```
4. Open the browser to http://localhost:4100 to walk through the React wizard and generate a filled PDF via `POST /generate-pdf`.

### Using the shared backend

If you are running `apps/backend/src/index.js` (the mock API used by the main frontend), the same claim assistant will be available at `http://localhost:4000/claim-assistant` and will call `POST /claim-assistant/generate-pdf` on that server. Add the PDF template to `apps/claim-assistant/templates/` so both the standalone and shared backend can find it.

> If you prefer a different port for the standalone server, set `PORT=xxxx npm start`.
