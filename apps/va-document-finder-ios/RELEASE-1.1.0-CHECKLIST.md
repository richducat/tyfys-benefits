# VA Doc Finder 1.1.0 — Release Checklist (target: July 11)

Version bumped to **1.1.0 (build 1)** in `project.yml`. New features port the
unique HIP app capabilities: PencilKit signature signing, official-form Date
Signed autofill, the Records Pull center, and CRM sync of signed forms.

## Verified before release
- `xcodebuild build` — **SUCCEEDS**.
- XCUITests (`GenerateDraftUITests`) — **PASS** in both light and dark mode:
  generate + draw signature + sign 21-4138; Records Pull center → C-file request form.
- Signing engine — all 10 signable forms produce flattened, correctly-placed,
  date-filled signed PDFs (visually verified per form).
- Dark-mode signature — luminance test confirms 100% dark ink in the saved PNG
  and an 18.6:1 contrast drawing surface (was invisible before the fix).
- Two adversarial review passes; all confirmed findings fixed (invisible dark
  signature, fileImporter no-op, sign/generate race, PHP token-at-rest,
  file-store ownership check, token moved to `X-Client-Token` header).

## Steps only the account holder can do

1. **Accept the Apple Developer Program License Agreement**
   at appstoreconnect.apple.com (blocks all new submissions until accepted).

2. **Archive + upload 1.1.0**:
   ```
   cd apps/va-document-finder-ios
   node scripts/release-ios-va-document-finder.mjs --upload
   ```
   (Version/build now read from `project.yml`; no stale env pin needed.)

3. **Deploy the CRM backend** — REQUIRED for the app's portal-pull feature:
   ```
   cd ../..            # tyfys-benefits root
   scripts/deploy-namecheap-static.sh --dry-run   # review first
   scripts/deploy-namecheap-static.sh
   ```
   `namecheap-api/customer-crm.php` adds: `documents_list` resource,
   client-token `document_download` (via `X-Client-Token` header), the
   `crm_client_documents` list, token-at-rest stripping, and the all-forms
   `catalogOnly` flip that disables the broken 1.0.3 filler.
   ⚠️ The deploy script uploads the whole staged site — review the diff first.

4. **App Store metadata** — add a "What's New" note covering signing, records
   pull, and portal sync. Screenshots of the signature pad + signed form
   recommended (App Review likes seeing new headline features).

5. **Commit the app + PHP to git** — the entire `apps/va-document-finder-ios/`
   tree and `namecheap-api/customer-crm.php` change are currently untracked.

## App Review notes to include
- Signatures are drawn on-device and stored only locally; a signed form is
  uploaded to the customer portal only when the veteran has turned on portal
  sharing (explicit consent toggle).
- The app fills official VA PDF forms and stamps the veteran's own signature;
  it does not submit anything to the VA — the veteran files the forms.
