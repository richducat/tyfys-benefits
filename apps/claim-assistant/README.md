# TYFYS Claim Assistant (VA Form 21-526EZ demo)

This folder contains a self-contained Node/Express prototype for filling the VA Form 21-526EZ (NOV 2022) PDF using pdf-lib.

## Quick start
1. Add the fillable PDF to `templates/vba-21-526ez-are.pdf` (NOV 2022 edition).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server (defaults to port `4100` to avoid clashing with the existing backend):
   ```bash
   npm start
   ```
4. Open the browser to http://localhost:4100 to walk through the React wizard and generate a filled PDF via `POST /generate-pdf`.

> If you prefer a different port, set `PORT=xxxx npm start`.
