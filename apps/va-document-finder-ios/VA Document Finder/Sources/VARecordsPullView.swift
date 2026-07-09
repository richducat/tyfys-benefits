import SwiftUI
import UniformTypeIdentifiers

/// Per-record pull status, mirroring HIP's per-source research ledger:
/// every record type always shows exactly where it stands, and a failed or
/// skipped pull is a visible state — never a silent dead end.
enum RecordPullStatus: String, CaseIterable {
    case notStarted
    case opened
    case imported
    case requested
    case skipped

    var label: String {
        switch self {
        case .notStarted: "Not pulled"
        case .opened: "Portal opened"
        case .imported: "Imported"
        case .requested: "Request started"
        case .skipped: "Skipped"
        }
    }

    var color: Color {
        switch self {
        case .notStarted: .red
        case .opened: Color.documentGold
        case .imported: .green
        case .requested: Color.tyfysBlue
        case .skipped: .secondary
        }
    }
}

struct RecordPullSource: Identifiable {
    let id: String
    let title: String
    let detail: String
    let systemImage: String
    let category: DocumentCategory
    /// Portal link id in VARecordsPortalLibrary for direct in-app pulls.
    let portalLinkId: String?
    /// Form number for request-by-form pulls (generated + signed in-app).
    let requestFormNumber: String?
}

enum RecordPullLibrary {
    static let sources: [RecordPullSource] = [
        RecordPullSource(
            id: "benefit_letters",
            title: "VA Benefit & Award Letters",
            detail: "Download award, benefit summary, and service verification letters straight from VA.gov, then import them here.",
            systemImage: "doc.richtext.fill",
            category: .vaRecords,
            portalLinkId: "benefit-letters",
            requestFormNumber: nil
        ),
        RecordPullSource(
            id: "blue_button",
            title: "VA Medical Records (Blue Button)",
            detail: "Export VA health records from My HealtheVet as PDF, then import the download into the dossier.",
            systemImage: "cross.case.fill",
            category: .vaRecords,
            portalLinkId: "blue-button",
            requestFormNumber: nil
        ),
        RecordPullSource(
            id: "decision_letters",
            title: "Claim Decisions & Rating Letters",
            detail: "Open your claim and appeal status on VA.gov to save prior decision letters and rating narratives.",
            systemImage: "checklist.checked",
            category: .vaRecords,
            portalLinkId: "claim-status",
            requestFormNumber: nil
        ),
        RecordPullSource(
            id: "dd214",
            title: "DD-214 / Separation Documents",
            detail: "Request DD-214 and separation paperwork through the VA/NARA records portal, then import your copy.",
            systemImage: "shield.lefthalf.filled",
            category: .service,
            portalLinkId: "va-sign-in",
            requestFormNumber: nil
        ),
        RecordPullSource(
            id: "c_file",
            title: "VA Claims File (C-File)",
            detail: "Generate a prefilled FOIA/Privacy Act request (VA Form 20-10206) for your complete claims file, sign it in-app, and submit it to VA.",
            systemImage: "folder.badge.person.crop",
            category: .vaRecords,
            portalLinkId: nil,
            requestFormNumber: "20-10206"
        ),
        RecordPullSource(
            id: "private_records",
            title: "Private Medical Records Release",
            detail: "Generate a prefilled authorization (VA Form 21-4142) so VA can pull records from your private doctors, and sign it in-app.",
            systemImage: "stethoscope",
            category: .medical,
            portalLinkId: nil,
            requestFormNumber: "21-4142"
        ),
    ]
}

struct VARecordsPullView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @EnvironmentObject private var vaultStore: VaultStore

    @State private var selectedPortalLink: VARecordsPortalLink?
    @State private var importTarget: RecordPullSource?
    @State private var isImporterPresented = false
    @State private var requestFormTarget: VAFormCatalogItem?
    @State private var importingDocumentIds: Set<String> = []
    @State private var portalDocuments: [RemoteCustomerDocument] = []
    @State private var isLoadingPortalDocs = false
    @State private var portalPullMessage: String?
    @State private var portalPullIsError = false

    var body: some View {
        List {
            Section {
                HeaderBand(
                    title: "Pull VA Records & Docs",
                    subtitle: "Bring every record your claim needs into one dossier: direct VA.gov pulls, signed request forms, and documents shared by Digital Sync.",
                    systemImage: "square.and.arrow.down.on.square.fill"
                )
                .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
            }

            Section {
                ForEach(RecordPullLibrary.sources) { source in
                    RecordPullRow(
                        source: source,
                        status: status(for: source),
                        onOpenPortal: source.portalLinkId == nil ? nil : {
                            openPortal(for: source)
                        },
                        onImport: {
                            importTarget = source
                            isImporterPresented = true
                        },
                        onGenerateRequest: source.requestFormNumber == nil ? nil : {
                            openRequestForm(for: source)
                        },
                        onToggleSkip: {
                            toggleSkip(for: source)
                        }
                    )
                }
            } header: {
                Text("VA record sources")
            } footer: {
                Text("VA Doc Finder never sees your VA.gov login. Records you download in the portal are imported only when you choose them.")
            }

            portalPullSection
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Pull Records")
        .sheet(item: $selectedPortalLink) { link in
            SecurePortalBrowserView(url: link.resolvedURL)
                .ignoresSafeArea()
        }
        .sheet(item: $requestFormTarget) { form in
            NavigationStack {
                VAFormDetailView(form: form)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Close") {
                                requestFormTarget = nil
                            }
                        }
                    }
            }
        }
        // `importTarget` is retained across the whole importer lifecycle
        // (only cleared inside the completion) so the source can never be nil
        // by the time the picker returns.
        .fileImporter(
            isPresented: $isImporterPresented,
            allowedContentTypes: [.pdf, .image, .text, .data],
            allowsMultipleSelection: true
        ) { result in
            let source = importTarget
            importTarget = nil
            guard let source else { return }
            if case .success(let urls) = result, !urls.isEmpty {
                let before = vaultStore.items.count
                vaultStore.importFiles(from: urls, category: source.category)
                // Only mark imported if the vault actually grew — importFiles
                // swallows failures into lastImportError.
                if vaultStore.items.count > before {
                    appState.profile.recordPullStates[source.id] = RecordPullStatus.imported.rawValue
                }
            }
        }
    }

    @ViewBuilder
    private var portalPullSection: some View {
        Section {
            if appState.profile.customerClientId.isEmpty || appState.profile.customerClientToken.isEmpty {
                Label("Connect to your Digital Sync portal (Dossier tab) to pull documents staff have shared with you.", systemImage: "person.crop.circle.badge.exclamationmark")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                Button {
                    refreshPortalDocuments()
                } label: {
                    Label(isLoadingPortalDocs ? "Checking Portal" : "Check Portal for Documents", systemImage: "arrow.triangle.2.circlepath")
                }
                .disabled(isLoadingPortalDocs)

                if staffSharedDocuments.isEmpty && !isLoadingPortalDocs && portalPullMessage == nil {
                    Text("No documents shared to your portal yet.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                ForEach(staffSharedDocuments, id: \.id) { document in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "doc.fill")
                            .font(.headline)
                            .foregroundStyle(Color.tyfysBlue)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(document.title.isEmpty ? document.originalFilename : document.title)
                                .font(.subheadline.weight(.semibold))
                            Text("\(document.category) · \(document.createdAt.prefix(10))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        if appState.profile.importedPortalDocumentIds.contains(document.id) {
                            Label("In dossier", systemImage: "checkmark.circle.fill")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.green)
                                .labelStyle(.titleAndIcon)
                        } else if importingDocumentIds.contains(document.id) {
                            ProgressView()
                                .controlSize(.small)
                        } else {
                            Button("Import") {
                                importPortalDocument(document)
                            }
                            .font(.caption.weight(.semibold))
                            .buttonStyle(.borderedProminent)
                            .tint(.tyfysBlue)
                        }
                    }
                    .padding(.vertical, 2)
                }

                if let portalPullMessage {
                    Label(portalPullMessage, systemImage: portalPullIsError ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(portalPullIsError ? Color.documentGold : Color.tyfysBlue)
                }
            }
        } header: {
            Text("From your Digital Sync portal")
        } footer: {
            Text("Documents Digital Sync staff share to your customer portal can be pulled straight into the dossier.")
        }
    }

    private func status(for source: RecordPullSource) -> RecordPullStatus {
        RecordPullStatus(rawValue: appState.profile.recordPullStates[source.id] ?? "") ?? .notStarted
    }

    private func openPortal(for source: RecordPullSource) {
        guard let linkId = source.portalLinkId,
              let link = VARecordsPortalLibrary.links.first(where: { $0.id == linkId }) else { return }
        if status(for: source) == .notStarted {
            appState.profile.recordPullStates[source.id] = RecordPullStatus.opened.rawValue
        }
        selectedPortalLink = link
    }

    private func openRequestForm(for source: RecordPullSource) {
        guard let number = source.requestFormNumber,
              let form = VAFormCatalogService.fallbackForms.first(where: { $0.formNumber == number }) else { return }
        appState.profile.recordPullStates[source.id] = RecordPullStatus.requested.rawValue
        requestFormTarget = form
    }

    private func toggleSkip(for source: RecordPullSource) {
        if status(for: source) == .skipped {
            appState.profile.recordPullStates[source.id] = nil
        } else {
            appState.profile.recordPullStates[source.id] = RecordPullStatus.skipped.rawValue
        }
    }

    /// Only documents Digital Sync staff shared — the app's own uploads are
    /// filtered out so they can't be re-imported into the vault they came from.
    private var staffSharedDocuments: [RemoteCustomerDocument] {
        portalDocuments.filter { $0.source != "ios-va-doc-finder" }
    }

    private func refreshPortalDocuments() {
        isLoadingPortalDocs = true
        portalPullMessage = nil
        portalPullIsError = false
        Task {
            do {
                let documents = try await CustomerSyncService.fetchPortalDocuments(
                    clientId: appState.profile.customerClientId,
                    clientToken: appState.profile.customerClientToken
                )
                await MainActor.run {
                    portalDocuments = documents
                    portalPullMessage = documents.isEmpty ? "No documents in your portal yet." : nil
                    isLoadingPortalDocs = false
                }
            } catch {
                await MainActor.run {
                    portalPullMessage = "Portal documents could not be loaded. \(error.localizedDescription)"
                    portalPullIsError = true
                    isLoadingPortalDocs = false
                }
            }
        }
    }

    private func importPortalDocument(_ document: RemoteCustomerDocument) {
        // Guard against a double-tap kicking off two 60-second downloads.
        guard !importingDocumentIds.contains(document.id) else { return }
        importingDocumentIds.insert(document.id)
        portalPullMessage = nil
        portalPullIsError = false
        Task {
            do {
                let localURL = try await CustomerSyncService.downloadPortalDocument(
                    clientId: appState.profile.customerClientId,
                    clientToken: appState.profile.customerClientToken,
                    document: document
                )
                await MainActor.run {
                    let category = DocumentCategory(rawValue: document.category) ?? .vaRecords
                    let before = vaultStore.items.count
                    vaultStore.importFiles(from: [localURL], category: category)
                    try? FileManager.default.removeItem(at: localURL)
                    importingDocumentIds.remove(document.id)
                    // Mark as imported only if the vault actually accepted it,
                    // so a failed copy doesn't become a permanent dead end.
                    if vaultStore.items.count > before {
                        appState.profile.importedPortalDocumentIds.append(document.id)
                        portalPullMessage = "\(document.originalFilename) added to your dossier."
                    } else {
                        portalPullMessage = vaultStore.lastImportError ?? "The document could not be saved to your dossier."
                        portalPullIsError = true
                    }
                }
            } catch {
                await MainActor.run {
                    importingDocumentIds.remove(document.id)
                    portalPullMessage = "Download failed. \(error.localizedDescription)"
                    portalPullIsError = true
                }
            }
        }
    }
}

private struct RecordPullRow: View {
    let source: RecordPullSource
    let status: RecordPullStatus
    let onOpenPortal: (() -> Void)?
    let onImport: () -> Void
    let onGenerateRequest: (() -> Void)?
    let onToggleSkip: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 10) {
                Image(systemName: source.systemImage)
                    .font(.headline)
                    .foregroundStyle(Color.tyfysBlue)
                    .frame(width: 34, height: 34)
                    .background(Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
                Text(source.title)
                    .font(.headline)
                    .lineLimit(2)
                Spacer()
                Text(status.label.uppercased())
                    .font(.caption2.bold())
                    .foregroundStyle(status.color)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(status.color.opacity(0.12))
                    .cornerRadius(4)
            }

            Text(source.detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    if let onOpenPortal {
                        Button(action: onOpenPortal) {
                            Label("Open VA.gov", systemImage: "safari")
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.tyfysBlue.opacity(0.08), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }

                    if let onGenerateRequest {
                        Button(action: onGenerateRequest) {
                            Label("Generate Request Form", systemImage: "wand.and.stars")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.documentGold, in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }

                    Button(action: onImport) {
                        Label("Import Files", systemImage: "square.and.arrow.down")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.tyfysBlue.opacity(0.08), in: Capsule())
                    }
                    .buttonStyle(.plain)

                    Button(action: onToggleSkip) {
                        Label(status == .skipped ? "Un-skip" : "Skip", systemImage: status == .skipped ? "arrow.uturn.backward" : "clock")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color(.systemGray5), in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
