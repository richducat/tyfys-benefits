import Foundation

struct VeteranProfile: Codable, Equatable {
    var isVeteran: Bool?
    var hasAttorney: Bool?
    var hasActiveAppeal: Bool?
    var eligibleDischarge: Bool?
    var filedBefore: Bool?
    var deniedBefore: Bool?
    var branch: String = ""
    var era: String = ""
    var currentRating: Int = 0
    var hasPendingClaims: Bool?
    var selectedConditions: [String] = []
    var selectedConditionDetails: [String: [String]] = [:]
    var selectedDocuments: [String] = []
    var intakeSubmittedAt: Date?
    var customerSyncConsent: Bool = false
    var customerClientId: String = ""
    var customerClientToken: String = ""
    var customerLastSyncedAt: Date?
    var dossierSkippedDocuments: [String] = []
    var dossierTypedMedication: String = ""
    var uploadedRecordIds: [String] = []
    var recordPullStates: [String: String] = [:]
    var importedPortalDocumentIds: [String] = []

    init() {}

    enum CodingKeys: String, CodingKey {
        case isVeteran
        case hasAttorney
        case hasActiveAppeal
        case eligibleDischarge
        case filedBefore
        case deniedBefore
        case branch
        case era
        case currentRating
        case hasPendingClaims
        case selectedConditions
        case selectedConditionDetails
        case selectedDocuments
        case intakeSubmittedAt
        case customerSyncConsent
        case customerClientId
        case customerClientToken
        case customerLastSyncedAt
        case dossierSkippedDocuments
        case dossierTypedMedication
        case uploadedRecordIds
        case recordPullStates
        case importedPortalDocumentIds
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        isVeteran = try container.decodeIfPresent(Bool.self, forKey: .isVeteran)
        hasAttorney = try container.decodeIfPresent(Bool.self, forKey: .hasAttorney)
        hasActiveAppeal = try container.decodeIfPresent(Bool.self, forKey: .hasActiveAppeal)
        eligibleDischarge = try container.decodeIfPresent(Bool.self, forKey: .eligibleDischarge)
        filedBefore = try container.decodeIfPresent(Bool.self, forKey: .filedBefore)
        deniedBefore = try container.decodeIfPresent(Bool.self, forKey: .deniedBefore)
        branch = try container.decodeIfPresent(String.self, forKey: .branch) ?? ""
        era = try container.decodeIfPresent(String.self, forKey: .era) ?? ""
        currentRating = try container.decodeIfPresent(Int.self, forKey: .currentRating) ?? 0
        hasPendingClaims = try container.decodeIfPresent(Bool.self, forKey: .hasPendingClaims)
        selectedConditions = try container.decodeIfPresent([String].self, forKey: .selectedConditions) ?? []
        selectedConditionDetails = try container.decodeIfPresent([String: [String]].self, forKey: .selectedConditionDetails) ?? [:]
        selectedDocuments = try container.decodeIfPresent([String].self, forKey: .selectedDocuments) ?? []
        intakeSubmittedAt = try container.decodeIfPresent(Date.self, forKey: .intakeSubmittedAt)
        customerSyncConsent = try container.decodeIfPresent(Bool.self, forKey: .customerSyncConsent) ?? false
        customerClientId = try container.decodeIfPresent(String.self, forKey: .customerClientId) ?? ""
        customerClientToken = try container.decodeIfPresent(String.self, forKey: .customerClientToken) ?? ""
        customerLastSyncedAt = try container.decodeIfPresent(Date.self, forKey: .customerLastSyncedAt)
        dossierSkippedDocuments = try container.decodeIfPresent([String].self, forKey: .dossierSkippedDocuments) ?? []
        dossierTypedMedication = try container.decodeIfPresent(String.self, forKey: .dossierTypedMedication) ?? ""
        uploadedRecordIds = try container.decodeIfPresent([String].self, forKey: .uploadedRecordIds) ?? []
        recordPullStates = try container.decodeIfPresent([String: String].self, forKey: .recordPullStates) ?? [:]
        importedPortalDocumentIds = try container.decodeIfPresent([String].self, forKey: .importedPortalDocumentIds) ?? []
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(isVeteran, forKey: .isVeteran)
        try container.encodeIfPresent(hasAttorney, forKey: .hasAttorney)
        try container.encodeIfPresent(hasActiveAppeal, forKey: .hasActiveAppeal)
        try container.encodeIfPresent(eligibleDischarge, forKey: .eligibleDischarge)
        try container.encodeIfPresent(filedBefore, forKey: .filedBefore)
        try container.encodeIfPresent(deniedBefore, forKey: .deniedBefore)
        try container.encode(branch, forKey: .branch)
        try container.encode(era, forKey: .era)
        try container.encode(currentRating, forKey: .currentRating)
        try container.encodeIfPresent(hasPendingClaims, forKey: .hasPendingClaims)
        try container.encode(selectedConditions, forKey: .selectedConditions)
        try container.encode(selectedConditionDetails, forKey: .selectedConditionDetails)
        try container.encode(selectedDocuments, forKey: .selectedDocuments)
        try container.encodeIfPresent(intakeSubmittedAt, forKey: .intakeSubmittedAt)
        try container.encode(customerSyncConsent, forKey: .customerSyncConsent)
        try container.encode(customerClientId, forKey: .customerClientId)
        try container.encode(customerClientToken, forKey: .customerClientToken)
        try container.encodeIfPresent(customerLastSyncedAt, forKey: .customerLastSyncedAt)
        try container.encode(dossierSkippedDocuments, forKey: .dossierSkippedDocuments)
        try container.encode(dossierTypedMedication, forKey: .dossierTypedMedication)
        try container.encode(uploadedRecordIds, forKey: .uploadedRecordIds)
        try container.encode(recordPullStates, forKey: .recordPullStates)
        try container.encode(importedPortalDocumentIds, forKey: .importedPortalDocumentIds)
    }

    var completionCount: Int {
        [
            isVeteran != nil,
            hasAttorney != nil,
            hasActiveAppeal != nil,
            eligibleDischarge != nil,
            filedBefore != nil,
            deniedBefore != nil,
            !branch.isEmpty,
            !era.isEmpty,
            hasPendingClaims != nil,
            !selectedConditions.isEmpty,
            !selectedDocuments.isEmpty
        ].filter { $0 }.count
    }

    var completionTotal: Int { 11 }

    var completionProgress: Double {
        Double(completionCount) / Double(completionTotal)
    }

    var isIntakeSubmitted: Bool {
        intakeSubmittedAt != nil
    }

    /// A copy safe to embed in a synced payload: the portal bearer token and
    /// client id are stripped so they are never persisted server-side in
    /// profile_json (they still travel once, at the top level, for auth).
    var sanitizedForSync: VeteranProfile {
        var copy = self
        copy.customerClientToken = ""
        copy.customerClientId = ""
        return copy
    }
}

struct SupportConversation: Codable, Equatable {
    var contactName: String = ""
    var contactEmail: String = ""
    var contactPhone: String = ""
    var threadId: String = ""
    var threadToken: String = ""
    var status: String = "open"
    var lastSyncedAt: Date?

    var hasReachableContact: Bool {
        !contactEmail.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            || !contactPhone.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var isLinked: Bool {
        !threadId.isEmpty && !threadToken.isEmpty
    }
}

struct ClaimCondition: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let systemImage: String
    let diagnosticCode: String
    let cfrSection: String
    let dbq: String
    let specialist: String
    let commonEvidence: [String]
    let detailOptions: [ConditionDetailOption]
    let notes: [String]
}

struct ClaimConditionCategory: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let systemImage: String
    let cfrRange: String
    let summary: String
    let conditions: [ClaimCondition]
}

struct ConditionDetailOption: Identifiable, Codable, Hashable {
    let id: String
    let label: String
    let detail: String
}

struct RatingLine: Identifiable, Codable, Hashable {
    let id: UUID
    var condition: String
    var rating: Int

    init(id: UUID = UUID(), condition: String, rating: Int) {
        self.id = id
        self.condition = condition
        self.rating = rating
    }
}

@MainActor
final class TYFYSAppState: ObservableObject {
    @Published var profile: VeteranProfile {
        didSet { save() }
    }

    @Published var ratingLines: [RatingLine] {
        didSet { save() }
    }

    @Published var messages: [SupportMessage] {
        didSet { save() }
    }

    @Published var supportConversation: SupportConversation {
        didSet { save() }
    }

    @Published var supportIsSyncing = false
    @Published var supportError: String?
    @Published var customerSyncIsRunning = false
    @Published var customerSyncError: String?
    @Published var customerSyncMessage: String?

    private let storageKey = "digitalSync.vaDocFinder.workspace.snapshot"

    // Auto-sync bookkeeping. Kept in memory: a fresh launch triggers one
    // foreground sync, which is harmless.
    private var autoSyncTask: Task<Void, Never>?
    private var lastSyncedFingerprint: String?

    init() {
        let storedData = UserDefaults.standard.data(forKey: storageKey)
        if let storedData,
           let snapshot = try? JSONDecoder().decode(TYFYSSnapshot.self, from: storedData) {
            profile = snapshot.profile
            ratingLines = snapshot.ratingLines
            messages = snapshot.messages
            supportConversation = snapshot.supportConversation
        } else {
            // Preserve an undecodable snapshot instead of letting the next
            // save() permanently overwrite the user's workspace data.
            if let storedData {
                UserDefaults.standard.set(storedData, forKey: storageKey + ".recovery")
            }
            profile = VeteranProfile()
            ratingLines = []
            supportConversation = SupportConversation()
            messages = [
                SupportMessage(sender: "Digital Sync Support", text: "Send a question when you want help with records, intake, or next steps. Replies from Digital Sync will appear here.")
            ]
        }
    }

    func resetWorkspace() {
        profile = VeteranProfile()
        ratingLines = []
        supportConversation = SupportConversation()
        customerSyncError = nil
        customerSyncMessage = nil
        messages = [
            SupportMessage(sender: "Digital Sync Support", text: "Workspace reset. Start with the intake questions and add records when ready.")
        ]
    }

    func toggleCondition(_ condition: String) {
        if profile.selectedConditions.contains(condition) {
            profile.selectedConditions.removeAll { $0 == condition }
            if let conditionModel = TYFYSData.condition(named: condition) {
                profile.selectedConditionDetails[conditionModel.id] = nil
            }
        } else {
            profile.selectedConditions.append(condition)
        }
    }

    func toggleConditionDetail(_ detail: ConditionDetailOption, for condition: ClaimCondition) {
        if !profile.selectedConditions.contains(condition.name) {
            profile.selectedConditions.append(condition.name)
        }

        var current = profile.selectedConditionDetails[condition.id] ?? []
        if current.contains(detail.label) {
            current.removeAll { $0 == detail.label }
        } else {
            current.append(detail.label)
        }
        profile.selectedConditionDetails[condition.id] = current
    }

    func toggleDocument(_ document: String) {
        if profile.selectedDocuments.contains(document) {
            profile.selectedDocuments.removeAll { $0 == document }
        } else {
            profile.selectedDocuments.append(document)
        }
    }

    func submitIntake() {
        profile.intakeSubmittedAt = .now
        messages.append(SupportMessage(
            sender: "Digital Sync Support",
            text: "Intake submitted locally. Next, review missing documents in the Dossier and keep adding records as they become available."
        ))
    }

    func reopenIntake() {
        profile.intakeSubmittedAt = nil
    }

    func addRatingLine(condition: String, rating: Int) {
        ratingLines.append(RatingLine(condition: condition, rating: rating))
    }

    func removeRatingLine(_ line: RatingLine) {
        ratingLines.removeAll { $0.id == line.id }
    }

    func updateSupportContact(name: String? = nil, email: String? = nil, phone: String? = nil) {
        if let name {
            supportConversation.contactName = name
        }
        if let email {
            supportConversation.contactEmail = email
        }
        if let phone {
            supportConversation.contactPhone = phone
        }
    }

    func refreshSupportMessages() async {
        guard supportConversation.isLinked else { return }

        supportIsSyncing = true
        supportError = nil
        do {
            let response = try await CustomerMessagingService.fetchThread(
                threadId: supportConversation.threadId,
                threadToken: supportConversation.threadToken
            )
            applySupportResponse(response)
        } catch {
            supportError = "Support messages could not be refreshed. \(error.localizedDescription)"
        }
        supportIsSyncing = false
    }

    @discardableResult
    func sendSupportMessage(_ text: String) async -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return false }
        guard supportConversation.hasReachableContact || supportConversation.isLinked else {
            supportError = "Add an email or phone number before sending your first support message."
            return false
        }

        supportIsSyncing = true
        supportError = nil
        var sent = false
        do {
            let response = try await CustomerMessagingService.sendMessage(
                text: trimmed,
                conversation: supportConversation,
                appSummary: customerSupportSummary(recordsSaved: nil)
            )
            applySupportResponse(response)
            sent = true
        } catch {
            supportError = "Message could not be sent. \(error.localizedDescription)"
        }
        supportIsSyncing = false
        return sent
    }

    func customerSupportSummary(recordsSaved: Int?) -> CustomerSupportAppSummary {
        // Without portal-sharing consent, no workspace state rides along with
        // a support message — completionPercent is derived from condition and
        // document selections, so it is gated too.
        let shareWorkspace = profile.customerSyncConsent
        return CustomerSupportAppSummary(
            intakeSubmitted: shareWorkspace ? profile.isIntakeSubmitted : false,
            completionPercent: shareWorkspace ? Int(profile.completionProgress * 100) : 0,
            selectedConditions: shareWorkspace ? profile.selectedConditions : [],
            selectedDocuments: shareWorkspace ? profile.selectedDocuments : [],
            recordsSaved: shareWorkspace ? recordsSaved : nil,
            modeledRating: shareWorkspace ? combinedRating : 0
        )
    }

    func syncCustomerWorkspace(vaultItems: [VaultItem]) async {
        guard profile.customerSyncConsent else {
            customerSyncError = "Turn on customer portal sync consent before uploading intake or records."
            return
        }
        guard supportConversation.hasReachableContact else {
            customerSyncError = "Add an email or phone number in Tools before syncing to the customer portal."
            return
        }

        customerSyncIsRunning = true
        customerSyncError = nil
        customerSyncMessage = nil
        do {
            let response = try await CustomerSyncService.syncWorkspace(
                clientId: profile.customerClientId,
                clientToken: profile.customerClientToken,
                conversation: supportConversation,
                profile: profile,
                records: vaultItems,
                appSummary: customerSupportSummary(recordsSaved: vaultItems.count)
            )
            profile.customerClientId = response.clientId
            profile.customerClientToken = response.clientToken
            profile.customerLastSyncedAt = .now
            customerSyncMessage = "Customer portal updated."
        } catch {
            customerSyncError = "Customer portal sync failed. \(error.localizedDescription)"
        }
        customerSyncIsRunning = false
    }

    /// A stable fingerprint of everything that gets synced. When it hasn't
    /// changed since the last successful sync, an auto-sync is skipped
    /// entirely — that's what keeps idle usage from touching the server.
    private func syncFingerprint(vaultItems: [VaultItem]) -> String {
        func tri(_ value: Bool?) -> String { value.map { $0 ? "y" : "n" } ?? "-" }
        var parts: [String] = [
            profile.isIntakeSubmitted ? "1" : "0",
            // The actual answer values, not a count — flipping a yes/no answer
            // must change the fingerprint so the correction actually syncs.
            tri(profile.isVeteran), tri(profile.hasAttorney), tri(profile.hasActiveAppeal),
            tri(profile.eligibleDischarge), tri(profile.filedBefore), tri(profile.deniedBefore),
            tri(profile.hasPendingClaims),
            profile.branch,
            profile.era,
            String(profile.currentRating),
            String(combinedRating),
            profile.selectedConditions.sorted().joined(separator: "|"),
            profile.selectedDocuments.sorted().joined(separator: "|"),
            profile.selectedConditionDetails
                .sorted { $0.key < $1.key }
                .map { "\($0.key)=\($0.value.sorted().joined(separator: ","))" }
                .joined(separator: ";"),
            supportConversation.contactName,
            supportConversation.contactEmail,
            supportConversation.contactPhone,
        ]
        parts.append(contentsOf: vaultItems.map { "\($0.id.uuidString):\($0.title)" }.sorted())
        return parts.joined(separator: "␟")
    }

    /// Debounced automatic sync. Safe to call on every change and on
    /// foreground: it coalesces bursts, skips the network entirely when
    /// consent is off or nothing changed, and never runs two syncs at once.
    /// Any imported documents not yet uploaded are always flushed afterward
    /// (a cheap no-op when there are none), so a coalesced change can't strand
    /// a just-imported file.
    func autoSync(vaultItems: [VaultItem]) {
        guard profile.customerSyncConsent, supportConversation.hasReachableContact else { return }

        autoSyncTask?.cancel()
        autoSyncTask = Task { [weak self] in
            // Coalesce rapid changes (e.g. typing, multi-file import) into one
            // request a few seconds after things settle.
            try? await Task.sleep(for: .seconds(3))
            guard let self, !Task.isCancelled else { return }
            // Don't race an in-flight sync; the unchanged fingerprint means the
            // next trigger (or foreground) retries.
            if self.customerSyncIsRunning { return }

            let fingerprint = self.syncFingerprint(vaultItems: vaultItems)
            if fingerprint != self.lastSyncedFingerprint {
                await self.syncCustomerWorkspace(vaultItems: vaultItems)
                if self.customerSyncError == nil {
                    self.lastSyncedFingerprint = fingerprint
                }
            }

            // Flush any records that still haven't reached the portal.
            await self.autoUploadRecords(vaultItems: vaultItems)
        }
    }

    /// Uploads any imported records not yet sent to the portal. Deduplicated
    /// via `uploadedRecordIds`, so re-triggering never re-sends a file.
    func autoUploadRecords(vaultItems: [VaultItem]) async {
        guard profile.customerSyncConsent,
              !profile.customerClientId.isEmpty,
              !profile.customerClientToken.isEmpty else { return }

        let pending = vaultItems.filter { !profile.uploadedRecordIds.contains($0.id.uuidString) }
        guard !pending.isEmpty else { return }

        for item in pending {
            do {
                _ = try await CustomerSyncService.uploadDocument(
                    clientId: profile.customerClientId,
                    clientToken: profile.customerClientToken,
                    item: item,
                    fileURL: vaultFileURL(for: item)
                )
                profile.uploadedRecordIds.append(item.id.uuidString)
            } catch {
                // Leave un-uploaded records for the next attempt; don't spam.
                break
            }
        }
    }

    /// Resolves a vault item's on-disk URL the same way VaultStore does, so
    /// auto-upload can read the file without a VaultStore reference.
    private func vaultFileURL(for item: VaultItem) -> URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Digital Sync", isDirectory: true)
            .appendingPathComponent("VA Document Finder", isDirectory: true)
            .appendingPathComponent("Imported Documents", isDirectory: true)
            .appendingPathComponent(item.storedFilename)
    }

    var combinedRating: Int {
        calculateCombinedRating(ratingLines.map(\.rating))
    }

    private func save() {
        let snapshot = TYFYSSnapshot(
            profile: profile,
            ratingLines: ratingLines,
            messages: messages,
            supportConversation: supportConversation
        )
        if let data = try? JSONEncoder().encode(snapshot) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func applySupportResponse(_ response: CustomerMessageResponse) {
        supportConversation.threadId = response.threadId
        supportConversation.threadToken = response.threadToken
        supportConversation.status = response.status
        supportConversation.lastSyncedAt = .now
        messages = response.messages.map { remote in
            SupportMessage(
                remoteId: remote.id,
                sender: remote.sender == "staff" ? "Digital Sync Support" : "You",
                text: remote.body,
                date: remote.date
            )
        }

        if messages.isEmpty {
            messages = [
                SupportMessage(sender: "Digital Sync Support", text: "Send a question when you want help with records, intake, or next steps. Replies from Digital Sync will appear here.")
            ]
        }
    }
}

struct TYFYSSnapshot: Codable {
    var profile: VeteranProfile
    var ratingLines: [RatingLine]
    var messages: [SupportMessage]
    var supportConversation: SupportConversation

    init(
        profile: VeteranProfile,
        ratingLines: [RatingLine],
        messages: [SupportMessage],
        supportConversation: SupportConversation
    ) {
        self.profile = profile
        self.ratingLines = ratingLines
        self.messages = messages
        self.supportConversation = supportConversation
    }

    enum CodingKeys: String, CodingKey {
        case profile
        case ratingLines
        case messages
        case supportConversation
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        profile = try container.decodeIfPresent(VeteranProfile.self, forKey: .profile) ?? VeteranProfile()
        ratingLines = try container.decodeIfPresent([RatingLine].self, forKey: .ratingLines) ?? []
        messages = try container.decodeIfPresent([SupportMessage].self, forKey: .messages) ?? []
        supportConversation = try container.decodeIfPresent(SupportConversation.self, forKey: .supportConversation) ?? SupportConversation()
    }
}

struct SupportMessage: Identifiable, Codable, Hashable {
    let id: UUID
    var remoteId: String?
    var sender: String
    var text: String
    var date: Date

    init(id: UUID = UUID(), remoteId: String? = nil, sender: String, text: String, date: Date = .now) {
        self.id = id
        self.remoteId = remoteId
        self.sender = sender
        self.text = text
        self.date = date
    }
}

enum TYFYSData {
    static let branches = ["Army", "Navy", "Marines", "Air Force", "Coast Guard", "Space Force"]

    static let eras = [
        "Korea",
        "Vietnam",
        "Desert Shield / Storm",
        "UN Peacekeeping / Bosnia",
        "Post 9/11",
        "Other Conflict / Expedition",
        "Peacetime"
    ]

    static let documentOptions = [
        "DD-214 or separation paperwork",
        "Service treatment records",
        "Personnel or deployment records",
        "VA records, rating decisions, or C-file pages",
        "Private medical records tied to claimed conditions",
        "Lay or buddy statements",
        "Blue Button export",
        "Medication list"
    ]

    static let conditionCategories: [ClaimConditionCategory] = [
        ClaimConditionCategory(
            id: "mental",
            name: "Mental health",
            systemImage: "brain.head.profile",
            cfrRange: "38 CFR 4.125-4.130",
            summary: "PTSD is separate from other mental health diagnoses, but overlapping symptoms usually become one VA mental-health evaluation.",
            conditions: [
                condition(
                    id: "ptsd",
                    name: "PTSD",
                    image: "brain.head.profile",
                    dc: "9411",
                    cfr: "38 CFR 4.130",
                    dbq: "PTSD DBQ / Mental Disorders DBQ",
                    specialist: "Psychologist or psychiatrist",
                    evidence: ["Current PTSD diagnosis", "Stressor statement or VA Form 21-0781", "Treatment notes", "Buddy or spouse statement"],
                    details: [
                        detail("combat", "Combat or hostile military event", "Firefight, IED, mortar, direct attack, or similar event."),
                        detail("mst", "Military sexual trauma", "MST marker, report, behavior change, or later disclosure."),
                        detail("training", "Training accident or duty trauma", "Vehicle, range, aircraft, shipboard, or other documented incident."),
                        detail("fear", "Fear of hostile military activity", "Deployment-related fear, threat exposure, or persistent hypervigilance.")
                    ],
                    notes: ["Do not stack PTSD, depression, and anxiety when the same symptoms overlap."]
                ),
                condition(
                    id: "mdd",
                    name: "Major Depressive Disorder",
                    image: "cloud.rain",
                    dc: "9434",
                    cfr: "38 CFR 4.130",
                    dbq: "Mental Disorders DBQ",
                    specialist: "Psychologist or psychiatrist",
                    evidence: ["Diagnosis", "Medication history", "Therapy notes", "Work and social impairment examples"],
                    details: [
                        detail("primary", "Direct service onset", "Symptoms or treatment began during service."),
                        detail("secondary_pain", "Secondary to chronic pain", "Mood symptoms linked to service-connected pain or limitations."),
                        detail("secondary_tinnitus", "Secondary to tinnitus or sleep disruption", "Mood symptoms linked to tinnitus, insomnia, or disrupted sleep.")
                    ],
                    notes: ["Rated using the same general formula as PTSD and anxiety."]
                ),
                condition(
                    id: "anxiety",
                    name: "Anxiety, panic, or adjustment disorder",
                    image: "waveform.path.ecg",
                    dc: "9400 / 9412 / 9440",
                    cfr: "38 CFR 4.130",
                    dbq: "Mental Disorders DBQ",
                    specialist: "Psychologist or psychiatrist",
                    evidence: ["Diagnosis", "Medication list", "Panic or avoidance history", "Occupational impact notes"],
                    details: [
                        detail("gad", "Generalized anxiety", "Persistent worry, irritability, concentration issues, or restlessness."),
                        detail("panic", "Panic attacks", "Frequency, triggers, ER visits, missed work, or avoidance pattern."),
                        detail("adjustment", "Adjustment disorder", "Mood or anxiety symptoms tied to a service-related stressor.")
                    ],
                    notes: ["The app tracks the diagnosis separately, but VA usually rates one overall mental-health impairment picture."]
                ),
                condition(
                    id: "somatic",
                    name: "Somatic symptom disorder",
                    image: "person.crop.circle.badge.exclamationmark",
                    dc: "9421",
                    cfr: "38 CFR 4.130",
                    dbq: "Mental Disorders DBQ",
                    specialist: "Psychologist or psychiatrist",
                    evidence: ["Diagnosis", "Pain or symptom history", "Mental health notes", "Functional impact statement"],
                    details: [
                        detail("pain_focus", "Pain-focused symptoms", "Mental health impairment connected to persistent physical symptoms."),
                        detail("medical_anxiety", "Medical anxiety or preoccupation", "Functional impairment from persistent health-related distress.")
                    ],
                    notes: []
                )
            ]
        ),
        ClaimConditionCategory(
            id: "spine_joints",
            name: "Spine, neck, and joints",
            systemImage: "figure.walk",
            cfrRange: "38 CFR 4.40-4.73, 4.71a",
            summary: "Start with the body part, then identify range of motion, instability, flare-ups, imaging, and assistive devices.",
            conditions: [
                condition(
                    id: "lumbar",
                    name: "Thoracolumbar back strain or pain",
                    image: "figure.strengthtraining.traditional",
                    dc: "5237",
                    cfr: "38 CFR 4.71a",
                    dbq: "Back DBQ",
                    specialist: "Orthopedic, physio, or primary care",
                    evidence: ["Range-of-motion measurements", "MRI or X-ray", "Flare-up statement", "Radiculopathy notes"],
                    details: [
                        detail("rom", "Limited forward flexion", "Actual flexion degrees or painful motion point."),
                        detail("flareups", "Flare-ups", "Frequency, duration, triggers, and functional loss."),
                        detail("spasm", "Spasm or guarding", "Abnormal gait, contour, or prescribed treatment."),
                        detail("radicular", "Pain, numbness, or tingling down leg", "Possible lower-extremity radiculopathy path.")
                    ],
                    notes: []
                ),
                condition(
                    id: "cervical",
                    name: "Cervical neck strain or pain",
                    image: "figure.stand",
                    dc: "5237",
                    cfr: "38 CFR 4.71a",
                    dbq: "Neck DBQ",
                    specialist: "Orthopedic, physio, or primary care",
                    evidence: ["Cervical range-of-motion measurements", "MRI or X-ray", "Upper-extremity symptoms", "Flare-up statement"],
                    details: [
                        detail("neck_rom", "Limited neck motion", "Forward flexion, combined ROM, or painful motion."),
                        detail("arm_symptoms", "Pain, numbness, or tingling down arm", "Possible upper-extremity radiculopathy path."),
                        detail("headaches", "Neck-related headaches", "Headache pattern tied to cervical symptoms.")
                    ],
                    notes: []
                ),
                condition(
                    id: "knee",
                    name: "Knee condition",
                    image: "figure.run",
                    dc: "5257 / 5260 / 5261",
                    cfr: "38 CFR 4.71a",
                    dbq: "Knee and Lower Leg DBQ",
                    specialist: "Orthopedic",
                    evidence: ["Flexion and extension measurements", "Instability testing", "Brace or cane prescription", "Flare-up statement"],
                    details: [
                        detail("flexion_5260", "Limited flexion (DC 5260)", "Difficulty bending the knee, measured in degrees."),
                        detail("extension_5261", "Limited extension (DC 5261)", "Difficulty straightening the knee, measured in degrees."),
                        detail("instability_5257", "Instability or subluxation (DC 5257)", "Giving way, falls, brace, cane, or patellar instability."),
                        detail("meniscus", "Meniscus symptoms", "Locking, swelling, pain, or history of surgery.")
                    ],
                    notes: ["Knee can have different rating bases. Select the exact problem instead of using one generic knee label."]
                ),
                condition(
                    id: "shoulder",
                    name: "Shoulder or arm limitation",
                    image: "figure.strengthtraining.functional",
                    dc: "5201",
                    cfr: "38 CFR 4.71a",
                    dbq: "Shoulder and Arm DBQ",
                    specialist: "Orthopedic",
                    evidence: ["Shoulder range-of-motion measurements", "Imaging", "Dominant side", "Flare-up statement"],
                    details: [
                        detail("dominant", "Dominant arm affected", "Identify whether the major or minor extremity is involved."),
                        detail("abduction", "Limited abduction or flexion", "Where pain starts and maximum motion."),
                        detail("instability", "Dislocation or instability", "Frequency, guarding, or surgical history.")
                    ],
                    notes: []
                ),
                condition(
                    id: "ankle_foot",
                    name: "Ankle or foot condition",
                    image: "shoeprints.fill",
                    dc: "5271 / 5269",
                    cfr: "38 CFR 4.71a",
                    dbq: "Ankle or Foot Conditions DBQ",
                    specialist: "Orthopedic or podiatrist",
                    evidence: ["Range-of-motion findings", "Podiatry notes", "Orthotics or brace records", "Imaging"],
                    details: [
                        detail("ankle_rom", "Limited ankle motion (DC 5271)", "Dorsiflexion/plantar flexion limits or painful motion."),
                        detail("plantar_5269", "Plantar fasciitis (DC 5269)", "Treatment history, orthotics, surgery, and bilateral or unilateral involvement."),
                        detail("flatfoot", "Flat feet or arch pain", "Orthotics, pronation, calluses, or weight-bearing line changes.")
                    ],
                    notes: []
                )
            ]
        ),
        ClaimConditionCategory(
            id: "neuro",
            name: "Headaches, nerves, and TBI",
            systemImage: "bolt.heart",
            cfrRange: "38 CFR 4.120-4.124a",
            summary: "Neurologic issues need the exact diagnosis, frequency, nerve path, severity, and functional impact.",
            conditions: [
                condition(
                    id: "migraines",
                    name: "Migraines",
                    image: "bolt.heart",
                    dc: "8100",
                    cfr: "38 CFR 4.124a",
                    dbq: "Headaches DBQ",
                    specialist: "Neurologist or primary care",
                    evidence: ["Headache log", "Medication list", "Work impact notes", "Treatment records"],
                    details: [
                        detail("prostrating", "Prostrating attacks", "Attacks require lying down, dark room, or stopping activity."),
                        detail("frequency", "Monthly or more frequent pattern", "Document average frequency over several months."),
                        detail("economic", "Work or economic impact", "Missed work, reduced productivity, or accommodations.")
                    ],
                    notes: ["DC 8100 focuses on prostrating attacks and frequency."]
                ),
                condition(
                    id: "radiculopathy",
                    name: "Radiculopathy or peripheral neuropathy",
                    image: "point.3.connected.trianglepath.dotted",
                    dc: "8520 / 8521 / 8526",
                    cfr: "38 CFR 4.124a",
                    dbq: "Peripheral Nerves DBQ",
                    specialist: "Neurologist or physiatrist",
                    evidence: ["EMG or nerve study", "Straight-leg or sensory exam", "Spine imaging", "Pain/numbness map"],
                    details: [
                        detail("sciatic_8520", "Sciatic nerve (DC 8520)", "Lower back into buttock, posterior leg, calf, or foot pattern."),
                        detail("peroneal_8521", "Common peroneal nerve (DC 8521)", "Foot drop, dorsiflexion/eversion weakness, or lateral leg pattern."),
                        detail("femoral_8526", "Femoral nerve (DC 8526)", "Anterior thigh or quadriceps weakness pattern."),
                        detail("upper_extremity", "Upper-extremity nerve path", "Arm, hand, grip, numbness, tingling, or cervical-related symptoms.")
                    ],
                    notes: ["Select the nerve family when known. Do not guess a nerve code without the medical basis."]
                ),
                condition(
                    id: "tbi",
                    name: "TBI residuals",
                    image: "brain",
                    dc: "8045",
                    cfr: "38 CFR 4.124a",
                    dbq: "TBI DBQ",
                    specialist: "Neurologist, neuropsychologist, or TBI specialist",
                    evidence: ["Incident report", "Head injury records", "Cognitive assessment", "Residual symptom history"],
                    details: [
                        detail("cognitive", "Memory, attention, or executive function", "Cognitive facet symptoms and testing."),
                        detail("emotional", "Emotional or behavioral residuals", "Mood, irritability, or behavioral changes."),
                        detail("physical", "Physical residuals", "Headaches, dizziness, balance, vision, or sensory issues.")
                    ],
                    notes: ["DC 8045 uses a facet-based framework and can interact with separately diagnosed residuals."]
                )
            ]
        ),
        ClaimConditionCategory(
            id: "respiratory",
            name: "Sleep, respiratory, and PACT Act",
            systemImage: "lungs",
            cfrRange: "38 CFR 4.96-4.97",
            summary: "Separate sleep apnea, asthma, sinusitis, rhinitis, and exposure-linked respiratory diagnoses before choosing evidence.",
            conditions: [
                condition(
                    id: "sleep_apnea",
                    name: "Sleep apnea",
                    image: "moon.zzz",
                    dc: "6847",
                    cfr: "38 CFR 4.97",
                    dbq: "Sleep Apnea DBQ",
                    specialist: "Sleep specialist or pulmonologist",
                    evidence: ["Sleep study", "CPAP prescription", "Daytime sleepiness notes", "Secondary nexus evidence"],
                    details: [
                        detail("cpap", "CPAP or breathing assistance device", "Prescription and compliance records."),
                        detail("hypersomnolence", "Persistent daytime hypersomnolence", "Fatigue, naps, safety issues, or work impact."),
                        detail("secondary", "Secondary theory", "Linked to another condition such as rhinitis, sinusitis, PTSD, or weight-gain pathway.")
                    ],
                    notes: ["Sleep apnea is not the same issue as insomnia. Keep the theory and evidence separate."]
                ),
                condition(
                    id: "insomnia",
                    name: "Insomnia or sleep disturbance",
                    image: "bed.double",
                    dc: "Mental health schedule varies",
                    cfr: "38 CFR 4.130",
                    dbq: "Mental Disorders DBQ when ratable as mental health",
                    specialist: "Psychologist, psychiatrist, or sleep specialist",
                    evidence: ["Sleep complaints", "Medication history", "Mental health notes", "Work and daytime impact"],
                    details: [
                        detail("mental_health", "Part of mental-health symptoms", "Sleep impairment tied to anxiety, depression, PTSD, or adjustment symptoms."),
                        detail("pain_related", "Pain-related insomnia", "Sleep loss tied to back, neck, joint, or neuropathy pain."),
                        detail("tinnitus_related", "Tinnitus-related insomnia", "Trouble falling asleep or waking due to ringing.")
                    ],
                    notes: ["Insomnia often belongs in a mental-health or secondary theory, not the sleep apnea code."]
                ),
                condition(
                    id: "asthma",
                    name: "Asthma",
                    image: "lungs",
                    dc: "6602",
                    cfr: "38 CFR 4.97",
                    dbq: "Respiratory Conditions DBQ",
                    specialist: "Pulmonologist",
                    evidence: ["Pulmonary function test", "Inhaler or steroid history", "ER/urgent care records", "Exposure history"],
                    details: [
                        detail("pft", "PFT values", "FEV-1, FEV-1/FVC, or DLCO where applicable."),
                        detail("meds", "Daily inhaler or steroid pattern", "Treatment level and exacerbation frequency."),
                        detail("deployment", "Deployment or burn pit exposure", "Location, dates, and PACT Act screening notes.")
                    ],
                    notes: ["38 CFR 4.96 has special rules for certain coexisting respiratory ratings."]
                ),
                condition(
                    id: "sinus_rhinitis",
                    name: "Sinusitis or rhinitis",
                    image: "nose",
                    dc: "6510-6514 / 6522",
                    cfr: "38 CFR 4.97",
                    dbq: "Sinusitis/Rhinitis DBQ",
                    specialist: "ENT specialist",
                    evidence: ["ENT notes", "CT scan", "Antibiotic history", "Nasal obstruction or polyps findings"],
                    details: [
                        detail("sinusitis_6514", "Chronic sinusitis (DC 6510-6514)", "Episodes, antibiotics, headaches, pain, discharge, crusting, or surgery."),
                        detail("rhinitis_6522", "Allergic or vasomotor rhinitis (DC 6522)", "Polyps or nasal obstruction on one or both sides."),
                        detail("pact", "PACT Act exposure lane", "Deployment location, toxic exposure screening, and diagnosis.")
                    ],
                    notes: ["Sinusitis and rhinitis use different criteria. Select the actual diagnosis path."]
                )
            ]
        ),
        ClaimConditionCategory(
            id: "hearing",
            name: "Hearing, ear, and balance",
            systemImage: "ear",
            cfrRange: "38 CFR 4.85-4.87",
            summary: "Noise exposure, audiology findings, tinnitus, hearing loss, and vestibular conditions need separate evidence.",
            conditions: [
                condition(
                    id: "tinnitus",
                    name: "Tinnitus",
                    image: "ear.badge.waveform",
                    dc: "6260",
                    cfr: "38 CFR 4.87",
                    dbq: "Hearing Loss and Tinnitus DBQ",
                    specialist: "Audiologist",
                    evidence: ["MOS or duty noise exposure", "Audiology records", "Lay statement", "Onset history"],
                    details: [
                        detail("recurrent", "Recurrent tinnitus", "Ringing, buzzing, hissing, or roaring pattern."),
                        detail("noise", "Military noise exposure", "Weapons, aircraft, engines, shipboard, or occupational exposure."),
                        detail("secondary", "Secondary symptoms", "Sleep, anxiety, concentration, or headache impact to track separately.")
                    ],
                    notes: ["DC 6260 has a single schedular maximum for recurrent tinnitus."]
                ),
                condition(
                    id: "hearing_loss",
                    name: "Hearing loss",
                    image: "ear",
                    dc: "6100",
                    cfr: "38 CFR 4.85",
                    dbq: "Hearing Loss and Tinnitus DBQ",
                    specialist: "Audiologist",
                    evidence: ["Maryland CNC test", "Puretone thresholds", "Audiogram", "Noise exposure history"],
                    details: [
                        detail("audiogram", "Audiogram table result", "Puretone average and speech discrimination are required."),
                        detail("functional", "Functional impact", "Difficulty hearing speech, work impact, or safety issues.")
                    ],
                    notes: ["Hearing loss is table-driven. Do not estimate it without the official audiology data."]
                ),
                condition(
                    id: "vertigo",
                    name: "Vertigo or vestibular condition",
                    image: "rotate.3d",
                    dc: "6204 / 6205",
                    cfr: "38 CFR 4.87",
                    dbq: "Ear Conditions DBQ",
                    specialist: "ENT or audiologist",
                    evidence: ["ENT diagnosis", "Dizziness episode log", "Gait or balance notes", "Hearing/tinnitus findings"],
                    details: [
                        detail("peripheral_6204", "Peripheral vestibular disorder (DC 6204)", "Dizziness and occasional staggering pattern."),
                        detail("menieres_6205", "Meniere's syndrome (DC 6205)", "Hearing impairment with vertigo and cerebellar gait pattern.")
                    ],
                    notes: []
                )
            ]
        ),
        ClaimConditionCategory(
            id: "digestive",
            name: "Digestive and GI",
            systemImage: "stethoscope",
            cfrRange: "38 CFR 4.110-4.114",
            summary: "GERD, IBS, and other GI claims need diagnosis, symptom frequency, medication, testing, and secondary theory.",
            conditions: [
                condition(
                    id: "gerd",
                    name: "GERD",
                    image: "pills",
                    dc: "7206",
                    cfr: "38 CFR 4.114",
                    dbq: "Esophageal Conditions DBQ",
                    specialist: "Gastroenterologist or primary care",
                    evidence: ["Diagnosis", "Medication list", "Endoscopy or GI notes", "Symptom frequency"],
                    details: [
                        detail("daily", "Daily or near-daily symptoms", "Heartburn, regurgitation, pain, nausea, sleep disruption."),
                        detail("testing", "Endoscopy or imaging", "Objective GI testing or specialist notes."),
                        detail("secondary_meds", "Secondary to medication", "NSAIDs, mental-health medication, or other treatment side effects.")
                    ],
                    notes: []
                ),
                condition(
                    id: "ibs",
                    name: "IBS or irritable colon syndrome",
                    image: "list.bullet.clipboard",
                    dc: "7319",
                    cfr: "38 CFR 4.114",
                    dbq: "Intestinal Conditions DBQ",
                    specialist: "Gastroenterologist or primary care",
                    evidence: ["Diagnosis", "Symptom log", "Medication or diet notes", "Work impact notes"],
                    details: [
                        detail("diarrhea", "Diarrhea pattern", "Frequency, urgency, accidents, and work disruption."),
                        detail("constipation", "Constipation pattern", "Frequency, treatment, bloating, and abdominal distress."),
                        detail("alternating", "Alternating diarrhea and constipation", "Track episodes and severe symptoms.")
                    ],
                    notes: []
                )
            ]
        ),
        ClaimConditionCategory(
            id: "skin_scars",
            name: "Skin, scars, and visible residuals",
            systemImage: "bandage",
            cfrRange: "38 CFR 4.118",
            summary: "Skin claims need location, area, treatment type, flare pattern, painful scars, and instability.",
            conditions: [
                condition(
                    id: "scars",
                    name: "Scars",
                    image: "bandage",
                    dc: "7800-7805",
                    cfr: "38 CFR 4.118",
                    dbq: "Scars/Disfigurement DBQ",
                    specialist: "Primary care, dermatologist, or surgeon",
                    evidence: ["Scar measurements", "Pain or instability notes", "Photos", "Surgery or injury records"],
                    details: [
                        detail("painful", "Painful scar", "Tender, painful, or sensitive scar."),
                        detail("unstable", "Unstable scar", "Frequent loss of skin covering."),
                        detail("head_face_neck", "Head, face, or neck scar", "Visible disfigurement location and measurements."),
                        detail("functional", "Functional limitation", "Scar limits motion or use of the affected part.")
                    ],
                    notes: []
                ),
                condition(
                    id: "dermatitis",
                    name: "Dermatitis, eczema, or skin disease",
                    image: "allergens",
                    dc: "7806",
                    cfr: "38 CFR 4.118",
                    dbq: "Skin Diseases DBQ",
                    specialist: "Dermatologist",
                    evidence: ["Diagnosis", "Flare photos", "Medication history", "Body-area estimate"],
                    details: [
                        detail("area", "Body area affected", "Percent of exposed and total body area."),
                        detail("systemic", "Systemic therapy", "Medication type, duration, and frequency."),
                        detail("flare", "Flare pattern", "Triggers, duration, and photos during active flare.")
                    ],
                    notes: []
                )
            ]
        )
    ]

    static var conditions: [ClaimCondition] {
        conditionCategories.flatMap(\.conditions)
    }

    static func condition(named name: String) -> ClaimCondition? {
        conditions.first { $0.name == name }
    }

    private static func condition(
        id: String,
        name: String,
        image: String,
        dc: String,
        cfr: String,
        dbq: String,
        specialist: String,
        evidence: [String],
        details: [ConditionDetailOption],
        notes: [String]
    ) -> ClaimCondition {
        ClaimCondition(
            id: id,
            name: name,
            systemImage: image,
            diagnosticCode: dc,
            cfrSection: cfr,
            dbq: dbq,
            specialist: specialist,
            commonEvidence: evidence,
            detailOptions: details,
            notes: notes
        )
    }

    private static func detail(_ id: String, _ label: String, _ detail: String) -> ConditionDetailOption {
        ConditionDetailOption(id: id, label: label, detail: detail)
    }
}

func calculateCombinedRating(_ ratings: [Int]) -> Int {
    let sortedRatings = ratings.filter { $0 > 0 }.sorted(by: >)
    var combined = 0.0

    for rating in sortedRatings {
        let next = (100.0 - combined) * Double(rating) / 100.0
        // 38 CFR 4.25 Table I rounds each intermediate combined value to the
        // nearest whole number before combining the next rating.
        combined = (combined + next).rounded()
    }

    return min(100, Int((combined / 10.0).rounded() * 10))
}
