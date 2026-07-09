import Foundation
import PDFKit
import SafariServices
import SwiftUI

struct SecurePortalBrowserView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        let controller = SFSafariViewController(url: url)
        controller.preferredBarTintColor = UIColor(Color.tyfysSlate)
        controller.preferredControlTintColor = UIColor(Color.documentGold)
        controller.dismissButtonStyle = .done
        return controller
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

struct VARecordsPortalLink: Identifiable, Hashable {
    let id: String
    let title: String
    let detail: String
    let systemImage: String
    let url: String

    var resolvedURL: URL {
        URL(string: url)!
    }
}

enum VARecordsPortalLibrary {
    static let links: [VARecordsPortalLink] = [
        VARecordsPortalLink(
            id: "va-sign-in",
            title: "VA.gov Sign In",
            detail: "Open VA.gov with Login.gov or ID.me. VA Doc Finder cannot see your password or site session.",
            systemImage: "person.badge.key.fill",
            url: "https://www.va.gov/sign-in/"
        ),
        VARecordsPortalLink(
            id: "claim-status",
            title: "Claim and Appeal Status",
            detail: "Review claim status, prior decisions, and evidence upload prompts directly on VA.gov.",
            systemImage: "checklist.checked",
            url: "https://www.va.gov/claim-or-appeal-status/"
        ),
        VARecordsPortalLink(
            id: "benefit-letters",
            title: "VA Benefit Letters",
            detail: "Download award, benefit summary, and service verification letters for the dossier.",
            systemImage: "doc.richtext.fill",
            url: "https://www.va.gov/records/download-va-letters/"
        ),
        VARecordsPortalLink(
            id: "blue-button",
            title: "My HealtheVet Blue Button",
            detail: "Download VA health records as PDF or text, then import the saved file into the dossier.",
            systemImage: "cross.case.fill",
            url: "https://www.myhealth.va.gov/download-your-own-va-medical-records"
        ),
        VARecordsPortalLink(
            id: "medical-records",
            title: "VA Medical Records",
            detail: "Review VA health records online before saving files you choose to keep.",
            systemImage: "heart.text.square.fill",
            url: "https://www.va.gov/health-care/review-medical-records/"
        ),
        VARecordsPortalLink(
            id: "upload-evidence",
            title: "Upload Evidence",
            detail: "Open VA's official evidence upload page. This app does not submit documents to VA.",
            systemImage: "square.and.arrow.up.fill",
            url: "https://www.va.gov/disability/upload-supporting-evidence/"
        ),
        VARecordsPortalLink(
            id: "va-forms",
            title: "VA Forms Search",
            detail: "Search official VA forms and compare revisions before using a PDF.",
            systemImage: "doc.text.magnifyingglass",
            url: "https://www.va.gov/find-forms/"
        )
    ]
}

enum VAFormAutofillStatus: String, Codable {
    case verifiedMapped
    case catalogOnly

    var label: String {
        switch self {
        case .verifiedMapped: "Autofill ready"
        case .catalogOnly: "Official download"
        }
    }
}

struct VAFormCatalogItem: Identifiable, Codable, Hashable {
    let formNumber: String
    let name: String
    let category: String
    let revisionDate: String
    let sourceURL: String
    let pdfURL: String
    let onlineToolURL: String
    let autofillStatus: VAFormAutofillStatus
    let lastCheckedAt: String

    var id: String { formNumber }

    // Catalog items are decoded from a remote endpoint, so a malformed or
    // empty sourceURL must not be able to crash the forms UI.
    var sourceResolvedURL: URL {
        URL(string: sourceURL) ?? URL(string: "https://www.va.gov/find-forms/")!
    }

    var pdfResolvedURL: URL? {
        URL(string: pdfURL)
    }

    var onlineToolResolvedURL: URL? {
        onlineToolURL.isEmpty ? nil : URL(string: onlineToolURL)
    }
}

struct GeneratedVAForm: Identifiable {
    let id = UUID()
    let formNumber: String
    let revisionDate: String
    let sourceURL: URL
    let filledPDF: URL
    let reviewStatus: String
}

private struct VAFormCatalogResponse: Decodable {
    let ok: Bool
    let forms: [VAFormCatalogItem]
}

enum VAFormCatalogService {
    private static let endpointURLs = [
        URL(string: "https://tyfys.net/api/customer-crm.php?resource=forms_catalog"),
        URL(string: "https://customer.tyfys.net/api/customer-crm.php?resource=forms_catalog")
    ].compactMap { $0 }

    static let fallbackForms: [VAFormCatalogItem] = [
        item("21-526EZ", "Application for Disability Compensation and Related Compensation Benefits", "Disability", "January 2026", "https://www.va.gov/forms/21-526ez/", "https://www.vba.va.gov/pubs/forms/VBA-21-526EZ-ARE.pdf", "https://www.va.gov/disability/file-disability-claim-form-21-526ez/", .verifiedMapped),
        item("20-0995", "Decision Review Request: Supplemental Claim", "Decision reviews and appeals", "May 2024", "https://www.va.gov/forms/20-0995/", "https://www.vba.va.gov/pubs/forms/VBA-20-0995-ARE.pdf", "https://www.va.gov/decision-reviews/supplemental-claim/file-supplemental-claim-form-20-0995/", .verifiedMapped),
        item("20-0996", "Decision Review Request: Higher-Level Review", "Decision reviews and appeals", "March 2024", "https://www.va.gov/forms/20-0996/", "https://www.vba.va.gov/pubs/forms/VBA-20-0996-ARE.pdf", "", .verifiedMapped),
        item("21-0966", "Intent to File a Claim for Compensation and/or Pension", "Disability", "February 2023", "https://www.va.gov/forms/21-0966/", "https://www.vba.va.gov/pubs/forms/VBA-21-0966-ARE.pdf", "", .verifiedMapped),
        item("21-4138", "Statement in Support of Claim", "Disability", "July 2024", "https://www.va.gov/forms/21-4138/", "https://www.vba.va.gov/pubs/forms/VBA-21-4138-ARE.pdf", "", .verifiedMapped),
        item("21-10210", "Lay/Witness Statement", "VBA", "June 2021", "https://www.va.gov/forms/21-10210/", "https://www.vba.va.gov/pubs/forms/VBA-21-10210-ARE.pdf", "", .verifiedMapped),
        item("21-0781", "Statement in Support of Claimed Mental Health Disorder(s)", "Disability", "March 2024", "https://www.va.gov/forms/21-0781/", "https://www.vba.va.gov/pubs/forms/VBA-21-0781-ARE.pdf", "", .verifiedMapped),
        item("21-4142", "Authorization to Disclose Information to VA", "Disability, Health care", "August 2024", "https://www.va.gov/forms/21-4142/", "https://www.vba.va.gov/pubs/forms/VBA-21-4142-ARE.pdf", "", .verifiedMapped),
        item("21-4142a", "General Release for Medical Provider Information", "Disability, Health care", "August 2024", "https://www.va.gov/forms/21-4142a/", "https://www.vba.va.gov/pubs/forms/VBA-21-4142a-ARE.pdf", "", .verifiedMapped),
        item("20-10206", "FOIA or Privacy Act Request", "VBA", "August 2023", "https://www.va.gov/forms/20-10206/", "https://www.vba.va.gov/pubs/forms/VBA-20-10206-ARE.pdf", "", .verifiedMapped),
        item("21-686c", "Application Request to Add and/or Remove Dependents", "Disability, Family member benefits, Pension", "August 2025", "https://www.va.gov/forms/21-686c/", "https://www.vba.va.gov/pubs/forms/VBA-21-686c-ARE.pdf", "", .verifiedMapped)
    ]

    static func fetchCatalog() async -> [VAFormCatalogItem] {
        for endpoint in endpointURLs {
            do {
                var request = URLRequest(url: endpoint)
                request.setValue("application/json", forHTTPHeaderField: "Accept")
                request.timeoutInterval = 15
                let (data, response) = try await URLSession.shared.data(for: request)
                guard let httpResponse = response as? HTTPURLResponse,
                      (200..<300).contains(httpResponse.statusCode) else {
                    continue
                }
                let decoded = try JSONDecoder().decode(VAFormCatalogResponse.self, from: data)
                if decoded.ok, !decoded.forms.isEmpty {
                    return decoded.forms
                }
            } catch {
                continue
            }
        }
        return fallbackForms
    }

    private static func item(
        _ number: String,
        _ name: String,
        _ category: String,
        _ revision: String,
        _ source: String,
        _ pdf: String,
        _ online: String,
        _ status: VAFormAutofillStatus
    ) -> VAFormCatalogItem {
        VAFormCatalogItem(
            formNumber: number,
            name: name,
            category: category,
            revisionDate: revision,
            sourceURL: source,
            pdfURL: pdf,
            onlineToolURL: online,
            autofillStatus: status,
            lastCheckedAt: "2026-05-21"
        )
    }
}

enum VAFormFiller {
    static func generate(
        form: VAFormCatalogItem,
        profile: VeteranProfile,
        conversation: SupportConversation,
        statement: String
    ) async throws -> GeneratedVAForm {
        guard let pdfURL = form.pdfResolvedURL else {
            throw CustomerSyncError.invalidURL
        }

        let (downloadedURL, downloadResponse) = try await URLSession.shared.download(from: pdfURL)
        // URLSession does not throw on HTTP errors, and a 404/503 HTML body
        // must not be treated as a downloaded form.
        if let httpResponse = downloadResponse as? HTTPURLResponse,
           !(200..<300).contains(httpResponse.statusCode) {
            throw CustomerSyncError.invalidResponse
        }
        let fileManager = FileManager.default
        let folder = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Digital Sync", isDirectory: true)
            .appendingPathComponent("VA Document Finder", isDirectory: true)
            .appendingPathComponent("Generated VA Forms", isDirectory: true)
        try fileManager.createDirectory(at: folder, withIntermediateDirectories: true)
        let target = folder.appendingPathComponent("\(form.formNumber)-prefilled-\(Int(Date().timeIntervalSince1970)).pdf")

        guard let document = PDFDocument(url: downloadedURL), document.pageCount > 0 else {
            throw CustomerSyncError.invalidResponse
        }

        let fillData = VAFormFillData(
            contactName: conversation.contactName,
            email: conversation.contactEmail,
            phone: conversation.contactPhone,
            conditions: profile.selectedConditions,
            statement: Self.summaryStatement(profile: profile, statement: statement)
        )
        for pageIndex in 0..<document.pageCount {
            guard let page = document.page(at: pageIndex) else { continue }
            for annotation in page.annotations {
                guard annotation.widgetFieldType == .text,
                      let fieldName = annotation.fieldName,
                      let value = VAFormFieldMap.value(for: fieldName, formNumber: form.formNumber, data: fillData),
                      !value.isEmpty else {
                    continue
                }
                annotation.widgetStringValue = value
            }
        }

        guard document.write(to: target) else {
            throw CustomerSyncError.invalidResponse
        }

        // Only after the new draft exists on disk, drop older drafts of the
        // same form so a failed regeneration can never destroy the last good
        // copy a ShareLink might still reference.
        if let existing = try? fileManager.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil) {
            for staleDraft in existing
            where staleDraft.lastPathComponent.hasPrefix("\(form.formNumber)-prefilled-")
                && staleDraft.lastPathComponent != target.lastPathComponent {
                try? fileManager.removeItem(at: staleDraft)
            }
        }

        return GeneratedVAForm(
            formNumber: form.formNumber,
            revisionDate: form.revisionDate,
            sourceURL: form.sourceResolvedURL,
            filledPDF: target,
            reviewStatus: "Draft generated. Review every field before filing or sharing."
        )
    }

    private static func summaryStatement(profile: VeteranProfile, statement: String) -> String {
        let conditions = profile.selectedConditions.isEmpty ? "No conditions selected yet." : profile.selectedConditions.joined(separator: ", ")
        let documents = profile.selectedDocuments.isEmpty ? "No documents marked yet." : profile.selectedDocuments.joined(separator: ", ")
        let details = profile.selectedConditionDetails.values.flatMap { $0 }.joined(separator: ", ")
        let custom = statement.trimmingCharacters(in: .whitespacesAndNewlines)
        return """
        VA Doc Finder draft summary for review.

        Conditions/issues: \(conditions)
        Details selected: \(details.isEmpty ? "None selected yet." : details)
        Service: \(profile.branch.isEmpty ? "Not entered" : profile.branch) - \(profile.era.isEmpty ? "Not entered" : profile.era)
        Current rating entered: \(profile.currentRating)%
        Evidence/documents marked: \(documents)

        \(custom)
        """
    }
}

struct VAFormsLibraryView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @EnvironmentObject private var vaultStore: VaultStore
    @State private var forms = VAFormCatalogService.fallbackForms
    @State private var selectedPortalLink: VARecordsPortalLink?
    @State private var searchText = ""

    private var filteredForms: [VAFormCatalogItem] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !query.isEmpty else { return forms }
        return forms.filter {
            $0.formNumber.lowercased().contains(query)
                || $0.name.lowercased().contains(query)
                || $0.category.lowercased().contains(query)
        }
    }

    var body: some View {
        List {
            Section {
                HeaderBand(
                    title: "VA Forms & PDF Filler",
                    subtitle: "Search official VA forms, open VA.gov sources, and create review-ready prefilled drafts from intake data.",
                    systemImage: "doc.fill.badge.plus"
                )
                .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
            }

            Section {
                TextField("Search forms", text: $searchText)
                    .textInputAutocapitalization(.characters)
                ForEach(filteredForms) { form in
                    NavigationLink {
                        VAFormDetailView(form: form)
                    } label: {
                        VAFormRow(form: form)
                    }
                }
            } header: {
                Text("Official form catalog")
            } footer: {
                Text("Catalog data is based on official VA.gov form pages. Autofill is enabled only where the PDF field map has been verified.")
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("VA Forms")
        .task {
            forms = await VAFormCatalogService.fetchCatalog()
        }
    }
}

struct VAFormRow: View {
    let form: VAFormCatalogItem

    private var canAutofill: Bool {
        VAFormFieldMap.hasLocalMap(for: form.formNumber) || form.autofillStatus == .verifiedMapped
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: canAutofill ? "wand.and.stars" : "doc.text")
                .font(.headline)
                .foregroundStyle(Color.tyfysBlue)
                .frame(width: 38, height: 38)
                .background(Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
            VStack(alignment: .leading, spacing: 5) {
                Text("VA Form \(form.formNumber)")
                    .font(.headline)
                Text(form.name)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                Text("\(form.revisionDate) - \(canAutofill ? VAFormAutofillStatus.verifiedMapped.label : form.autofillStatus.label)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct VAFormDetailView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @EnvironmentObject private var vaultStore: VaultStore
    @EnvironmentObject private var signatureStore: SignatureStore
    @State private var statement = ""
    @State private var generatedForm: GeneratedVAForm?
    @State private var generationError: String?
    @State private var isGenerating = false
    @State private var showSignaturePad = false
    @State private var signedFormURL: URL?
    @State private var signingError: String?
    @State private var signedSyncStatus: String?
    @State private var isSigning = false

    let form: VAFormCatalogItem

    // A locally verified field map always wins over the server catalog flag:
    // it was validated against the official PDF shipped with this app version.
    private var canAutofill: Bool {
        VAFormFieldMap.hasLocalMap(for: form.formNumber) || form.autofillStatus == .verifiedMapped
    }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 10) {
                    Text("VA Form \(form.formNumber)")
                        .font(.title2.bold())
                    Text(form.name)
                        .font(.headline)
                    Text("Revision: \(form.revisionDate)")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.documentGold)
                    Text("Source checked: \(form.lastCheckedAt)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            Section {
                Link(destination: form.sourceResolvedURL) {
                    Label("Open VA.gov form page", systemImage: "safari.fill")
                }
                if let pdfURL = form.pdfResolvedURL {
                    Link(destination: pdfURL) {
                        Label("Download official PDF", systemImage: "doc.fill")
                    }
                }
                if let onlineTool = form.onlineToolResolvedURL {
                    Link(destination: onlineTool) {
                        Label("Open VA online tool", systemImage: "building.columns.fill")
                    }
                }
            } header: {
                Text("Official sources")
            }

            Section {
                Text("The draft uses your intake, selected medical issues, records checklist, and support contact. Review every field before sending or filing.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                TextField("Optional statement or notes to add to mapped narrative fields", text: $statement, axis: .vertical)
                    .lineLimit(3...8)

                Button {
                    generate()
                } label: {
                    if isGenerating {
                        Label("Generating Draft", systemImage: "hourglass")
                    } else {
                        Label("Generate Prefilled PDF Draft", systemImage: "wand.and.stars")
                    }
                }
                // Mutual exclusion with signing: regenerating mid-sign could
                // leave a signed copy of a superseded draft on disk.
                .disabled(isGenerating || !canAutofill || isSigning)

                if !canAutofill {
                    Label("This form is official-catalog only until its PDF field map is verified.", systemImage: "exclamationmark.triangle.fill")
                        .font(.caption)
                        .foregroundStyle(Color.documentGold)
                }

                if let generatedForm {
                    VStack(alignment: .leading, spacing: 10) {
                        Label(generatedForm.reviewStatus, systemImage: "checkmark.seal.fill")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.tyfysBlue)
                        ShareLink(item: generatedForm.filledPDF) {
                            Label("Share or Preview Draft PDF", systemImage: "square.and.arrow.up")
                        }
                        Button {
                            vaultStore.importFiles(from: [generatedForm.filledPDF], category: .forms)
                        } label: {
                            Label("Save Draft to Dossier", systemImage: "folder.badge.plus")
                        }
                    }
                }

                if let generationError {
                    Label(generationError, systemImage: "exclamationmark.triangle.fill")
                        .font(.caption)
                        .foregroundStyle(Color.documentGold)
                }
            } header: {
                Text("Draft autofill")
            }

            if generatedForm != nil, VAFormSigner.canSign(formNumber: form.formNumber) {
                Section {
                    Text("Signing stamps your drawn signature on the \(form.formNumber) signature line, fills today's date in the Date Signed boxes, and locks the signed copy so it can no longer be edited.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    Button {
                        if signatureStore.hasSignature {
                            signDraft()
                        } else {
                            showSignaturePad = true
                        }
                    } label: {
                        if isSigning {
                            Label("Signing…", systemImage: "hourglass")
                                .font(.headline)
                        } else {
                            Label(signedFormURL == nil ? "Sign & Date This Draft" : "Re-Sign Draft", systemImage: "signature")
                                .font(.headline)
                        }
                    }
                    .tint(.documentGold)
                    .disabled(isSigning || isGenerating)
                    .accessibilityIdentifier("sign-and-date")

                    if signatureStore.hasSignature {
                        Button {
                            showSignaturePad = true
                        } label: {
                            Label("Redraw Saved Signature", systemImage: "pencil.tip.crop.circle")
                                .font(.subheadline)
                        }
                    }

                    if let signedFormURL {
                        VStack(alignment: .leading, spacing: 10) {
                            Label("Signed and dated. The signed copy is locked — regenerating the draft voids it.", systemImage: "checkmark.seal.fill")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Color.tyfysBlue)
                            ShareLink(item: signedFormURL) {
                                Label("Share Signed PDF", systemImage: "square.and.arrow.up")
                            }
                            .accessibilityIdentifier("share-signed-pdf")
                            Button {
                                vaultStore.importFiles(from: [signedFormURL], category: .forms)
                            } label: {
                                Label("Save Signed Copy to Dossier", systemImage: "folder.badge.plus")
                            }
                        }
                    }

                    if let signedSyncStatus {
                        Label(signedSyncStatus, systemImage: signedSyncStatus.contains("could not") ? "exclamationmark.triangle.fill" : "icloud.and.arrow.up.fill")
                            .font(.caption)
                            .foregroundStyle(signedSyncStatus.contains("could not") ? Color.documentGold : Color.tyfysBlue)
                    }

                    if let signingError {
                        Label(signingError, systemImage: "exclamationmark.triangle.fill")
                            .font(.caption)
                            .foregroundStyle(Color.documentGold)
                    }
                } header: {
                    Text("Sign & date")
                } footer: {
                    if appState.profile.customerSyncConsent {
                        Text("Signed forms are also synced to your Digital Sync customer portal.")
                    } else {
                        Text("Turn on portal sharing in the Dossier tab to sync signed forms to Digital Sync automatically.")
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle(form.formNumber)
        .sheet(isPresented: $showSignaturePad) {
            SignaturePadSheet(signatureStore: signatureStore) {
                signDraft()
            }
        }
    }

    private func signDraft() {
        guard let currentForm = generatedForm, let signatureCG = signatureStore.signatureImage?.cgImage else { return }
        signingError = nil
        signedSyncStatus = nil
        isSigning = true
        let draftURL = currentForm.filledPDF
        let formNumber = form.formNumber
        // Flattening the 15-page 526EZ takes multiple seconds; run it off the
        // main thread so the UI never freezes.
        Task.detached(priority: .userInitiated) {
            do {
                let signedURL = try VAFormSigner.sign(
                    draftURL: draftURL,
                    formNumber: formNumber,
                    signatureImage: signatureCG
                )
                await MainActor.run {
                    isSigning = false
                    // If the draft was regenerated while this signing ran, the
                    // signed copy certifies stale answers — discard it.
                    guard generatedForm?.filledPDF == draftURL else {
                        try? FileManager.default.removeItem(at: signedURL)
                        return
                    }
                    signedFormURL = signedURL
                    syncSignedForm(at: signedURL)
                }
            } catch {
                await MainActor.run {
                    isSigning = false
                    signingError = "The draft could not be signed. \(error.localizedDescription)"
                }
            }
        }
    }

    private func syncSignedForm(at signedURL: URL) {
        guard appState.profile.customerSyncConsent,
              !appState.profile.customerClientId.isEmpty,
              !appState.profile.customerClientToken.isEmpty else {
            return
        }
        let uploadItem = VaultItem(
            id: UUID(),
            title: "VA Form \(form.formNumber) — signed",
            originalFilename: signedURL.lastPathComponent,
            storedFilename: signedURL.lastPathComponent,
            importedAt: Date(),
            category: .forms
        )
        Task {
            do {
                _ = try await CustomerSyncService.uploadDocument(
                    clientId: appState.profile.customerClientId,
                    clientToken: appState.profile.customerClientToken,
                    item: uploadItem,
                    fileURL: signedURL
                )
                try? await CustomerSyncService.recordGeneratedForm(
                    clientId: appState.profile.customerClientId,
                    clientToken: appState.profile.customerClientToken,
                    formNumber: form.formNumber,
                    revisionDate: form.revisionDate,
                    sourceURL: form.sourceURL,
                    status: "signed"
                )
                await MainActor.run {
                    signedSyncStatus = "Signed form synced to your customer portal."
                }
            } catch {
                await MainActor.run {
                    signedSyncStatus = "Signed form could not be synced to the portal. \(error.localizedDescription)"
                }
            }
        }
    }

    private func generate() {
        isGenerating = true
        generationError = nil
        Task {
            do {
                let generated = try await VAFormFiller.generate(
                    form: form,
                    profile: appState.profile,
                    conversation: appState.supportConversation,
                    statement: statement
                )
                await MainActor.run {
                    // Integrity rule: a new draft voids ALL earlier signed
                    // copies of this form — the signature only certifies the
                    // draft it was stamped onto. Purge on disk (not just the
                    // in-view URL) so the rule survives app relaunches.
                    VAFormSigner.purgeSignedCopies(formNumber: form.formNumber)
                    signedFormURL = nil
                    signedSyncStatus = nil
                    signingError = nil
                    generatedForm = generated
                    isGenerating = false
                }
            } catch {
                await MainActor.run {
                    generationError = "Draft could not be generated. \(error.localizedDescription)"
                    isGenerating = false
                }
            }
        }
    }
}
