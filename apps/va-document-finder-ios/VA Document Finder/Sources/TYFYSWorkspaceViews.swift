import SwiftUI
import UniformTypeIdentifiers

struct ClaimHomeView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @EnvironmentObject private var vaultStore: VaultStore
    let onSelectTab: (RootTab) -> Void

    private var currentPhase: Int {
        if appState.profile.completionProgress < 0.35 { return 1 }
        if vaultStore.items.isEmpty { return 2 }
        if appState.ratingLines.isEmpty { return 3 }
        return 4
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 16) {
                    HeaderBand(
                        title: "Claim Home",
                        subtitle: "A focused workspace for intake, records, rating math, and next-step organization.",
                        systemImage: "map.fill"
                    )

                    SOPTracker(currentPhase: currentPhase)

                    HStack(spacing: 10) {
                        TYFYSMetricTile(value: "\(Int(appState.profile.completionProgress * 100))%", label: "Profile complete", systemImage: "person.text.rectangle")
                        TYFYSMetricTile(value: "\(vaultStore.items.count)", label: "Records saved", systemImage: "folder.fill")
                        TYFYSMetricTile(value: "\(appState.combinedRating)%", label: "Modeled rating", systemImage: "percent")
                    }

                    SectionCard(title: "Next best actions", systemImage: "sparkles") {
                        VStack(spacing: 10) {
                            NextActionButton(
                                title: "Continue Records Intake",
                                detail: nextDocumentNeed,
                                systemImage: "tray.and.arrow.down.fill"
                            ) {
                                onSelectTab(.intake)
                            }
                            NextActionButton(
                                title: "Review evidence gaps",
                                detail: "Match each selected condition to service, medical, VA, and lay evidence.",
                                systemImage: "checklist.checked"
                            ) {
                                onSelectTab(.dossier)
                            }
                            NextActionButton(
                                title: "Model the rating picture",
                                detail: "Add current and target conditions before choosing a support path.",
                                systemImage: "function"
                            ) {
                                onSelectTab(.calculator)
                            }
                        }
                    }

                    SectionCard(title: "Profile snapshot", systemImage: "person.crop.circle.badge.checkmark") {
                        VStack(spacing: 10) {
                            SnapshotRow(label: "Branch", value: appState.profile.branch.isEmpty ? "Not set" : appState.profile.branch)
                            SnapshotRow(label: "Service era", value: appState.profile.era.isEmpty ? "Not set" : appState.profile.era)
                            SnapshotRow(label: "Current rating", value: "\(appState.profile.currentRating)%")
                            SnapshotRow(label: "Conditions", value: appState.profile.selectedConditions.isEmpty ? "None selected" : appState.profile.selectedConditions.joined(separator: ", "))
                            SnapshotRow(label: "Intake status", value: appState.profile.isIntakeSubmitted ? "Submitted locally" : "Draft")
                        }
                    }

                    SectionCard(title: "Privacy and control", systemImage: "shield.lefthalf.filled") {
                        VStack(alignment: .leading, spacing: 10) {
                            Label("Records imported here stay in the on-device dossier unless you choose to share them.", systemImage: "iphone.gen3")
                            Label("Support messages are sent only when you press Send.", systemImage: "paperplane.fill")
                            Label("This workspace helps organize evidence; it does not file claims with VA.", systemImage: "building.2")
                        }
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    }
                }
                .padding(16)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Claim Home")
        }
    }

    private var nextDocumentNeed: String {
        let missing = TYFYSData.documentOptions.first { !appState.profile.selectedDocuments.contains($0) }
        return missing ?? "Core intake record list is complete. Add supporting notes as they arrive."
    }
}

struct IntakeView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @State private var expandedConditionCategoryIDs: Set<String> = ["mental"]
    @State private var currentStep: IntakeStep = .medical
    @State private var showSubmittedConfirmation = false
    @State private var showMissedQuestionsError = false
    let onFinish: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "list.clipboard.fill")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(width: 38, height: 38)
                            .background(Color.documentGold, in: RoundedRectangle(cornerRadius: 8))
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Medical-first intake")
                                .font(.headline)
                                .foregroundStyle(Color.tyfysSlate)
                            Text(currentStep.subtitle)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .padding(.vertical, 6)
                }

                Section {
                    ProgressView(value: appState.profile.completionProgress)
                        .tint(.tyfysBlue)
                    Text("\(appState.profile.completionCount) of \(appState.profile.completionTotal) intake areas complete")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.secondary)
                    IntakeStepPills(currentStep: currentStep) { step in
                        showMissedQuestionsError = false
                        withAnimation(.easeInOut) {
                            currentStep = step
                        }
                    }
                }

                switch currentStep {
                case .medical:
                    Section {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Start with the body system, then choose the exact diagnosis or rating basis that best matches your records.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                            Text("\(appState.profile.selectedConditions.count) medical issue\(appState.profile.selectedConditions.count == 1 ? "" : "s") selected")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Color.tyfysBlue)
                        }
                        .padding(.vertical, 4)

                        ForEach(TYFYSData.conditionCategories) { category in
                            ConditionCategoryDisclosureRow(
                                category: category,
                                selectedConditions: appState.profile.selectedConditions,
                                selectedDetails: appState.profile.selectedConditionDetails,
                                isExpanded: expandedBinding(for: category.id)
                            ) { condition in
                                appState.toggleCondition(condition.name)
                            } onToggleDetail: { condition, detail in
                                appState.toggleConditionDetail(detail, for: condition)
                            }
                        }
                    } header: {
                        Text("Medical issues by 38 CFR body system")
                    } footer: {
                        Text("This selector mirrors VA Doc Finder condition lanes and uses 38 CFR Part 4 source labels to organize intake. It is for evidence organization only.")
                    }

                    selectedConditionSection

                case .eligibility:
                    Section("Representation and eligibility") {
                        BooleanQuestionRow(title: "Are you the veteran on this claim?", trueLabel: "Yes, I am", falseLabel: "No, I am helping", value: boolBinding(\.isVeteran))
                        BooleanQuestionRow(title: "Are you working with an accredited attorney?", trueLabel: "Yes", falseLabel: "No", value: boolBinding(\.hasAttorney))
                        BooleanQuestionRow(title: "Do you have an active appeal with a BVA Judge?", trueLabel: "Yes", falseLabel: "No", value: boolBinding(\.hasActiveAppeal))
                        BooleanQuestionRow(title: "Was your discharge Honorable or General Under Honorable?", trueLabel: "Yes", falseLabel: "No", value: boolBinding(\.eligibleDischarge))
                    }

                case .history:
                    Section("Claim history") {
                        BooleanQuestionRow(title: "Have you filed a VA claim before?", trueLabel: "Yes", falseLabel: "First time", value: boolBinding(\.filedBefore))
                        BooleanQuestionRow(title: "Have any conditions been denied before?", trueLabel: "Yes", falseLabel: "No", value: boolBinding(\.deniedBefore))
                        BooleanQuestionRow(title: "Do you have claims currently pending?", trueLabel: "Yes", falseLabel: "No", value: boolBinding(\.hasPendingClaims))
                    }

                case .service:
                    Section("Service history") {
                        SelectionGrid(title: "Branch", options: TYFYSData.branches, selectedValue: stringBinding(\.branch))
                        SelectionGrid(title: "Service era", options: TYFYSData.eras, selectedValue: stringBinding(\.era))
                    }

                    Section("Current VA rating") {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("\(appState.profile.currentRating)%")
                                    .font(.title.bold())
                                    .foregroundStyle(Color.tyfysSlate)
                                Spacer()
                                Stepper("Adjust", value: ratingBinding, in: 0...100, step: 10)
                                    .labelsHidden()
                            }
                            Slider(value: ratingDoubleBinding, in: 0...100, step: 10)
                                .tint(.tyfysBlue)
                        }
                        .padding(.vertical, 4)
                    }

                case .documents:
                    Section("Documents you already have") {
                        ForEach(TYFYSData.documentOptions, id: \.self) { option in
                            ToggleChipRow(
                                title: option,
                                detail: "Used to build your VA Doc Finder record review packet.",
                                systemImage: "doc.text.fill",
                                isSelected: appState.profile.selectedDocuments.contains(option)
                            ) {
                                appState.toggleDocument(option)
                            }
                        }
                    }

                case .review:
                    IntakeReviewSection(
                        profile: appState.profile,
                        missingItems: missingIntakeItems
                    )
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Intake")
            .safeAreaInset(edge: .bottom) {
                IntakeActionBar(
                    step: currentStep,
                    completionProgress: appState.profile.completionProgress,
                    isSubmitted: appState.profile.isIntakeSubmitted,
                    showError: showMissedQuestionsError,
                    onBack: moveBack,
                    onContinue: moveForward,
                    onSubmit: submitIntake
                )
            }
            .onChange(of: appState.profile) { _ in
                showMissedQuestionsError = false
            }
            .alert("Intake Submitted", isPresented: $showSubmittedConfirmation) {
                Button("Open Dossier") {
                    onFinish()
                }
                Button("Stay Here", role: .cancel) {}
            } message: {
                Text("Your intake is saved locally in this app. The next step is to add or review records in the Dossier.")
            }
        }
    }

    private func expandedBinding(for categoryID: String) -> Binding<Bool> {
        Binding {
            expandedConditionCategoryIDs.contains(categoryID)
        } set: { isExpanded in
            if isExpanded {
                expandedConditionCategoryIDs.insert(categoryID)
            } else {
                expandedConditionCategoryIDs.remove(categoryID)
            }
        }
    }

    private func boolBinding(_ keyPath: WritableKeyPath<VeteranProfile, Bool?>) -> Binding<Bool?> {
        Binding {
            appState.profile[keyPath: keyPath]
        } set: { value in
            appState.profile[keyPath: keyPath] = value
        }
    }

    private func stringBinding(_ keyPath: WritableKeyPath<VeteranProfile, String>) -> Binding<String> {
        Binding {
            appState.profile[keyPath: keyPath]
        } set: { value in
            appState.profile[keyPath: keyPath] = value
        }
    }

    private var ratingBinding: Binding<Int> {
        Binding {
            appState.profile.currentRating
        } set: { value in
            appState.profile.currentRating = value
        }
    }

    private var ratingDoubleBinding: Binding<Double> {
        Binding {
            Double(appState.profile.currentRating)
        } set: { value in
            appState.profile.currentRating = Int(value)
        }
    }

    private var selectedConditionSection: some View {
        Section("Selected condition detail") {
            if appState.profile.selectedConditions.isEmpty {
                EmptyStateView(
                    systemImage: "stethoscope",
                    title: "No medical issues selected",
                    message: "Open a body-system box above and choose the exact condition, diagnosis, or rating basis."
                )
            } else {
                ForEach(appState.profile.selectedConditions, id: \.self) { conditionName in
                    if let condition = TYFYSData.condition(named: conditionName) {
                        SelectedConditionSummaryRow(
                            condition: condition,
                            selectedDetails: appState.profile.selectedConditionDetails[condition.id] ?? []
                        )
                    } else {
                        Text(conditionName)
                            .font(.headline)
                    }
                }
            }
        }
    }

    private var missingIntakeItems: [String] {
        var missing: [String] = []
        if appState.profile.selectedConditions.isEmpty { missing.append("medical issues") }
        if appState.profile.isVeteran == nil { missing.append("veteran status") }
        if appState.profile.eligibleDischarge == nil { missing.append("discharge eligibility") }
        if appState.profile.filedBefore == nil { missing.append("claim history") }
        if appState.profile.branch.isEmpty { missing.append("branch") }
        if appState.profile.era.isEmpty { missing.append("service era") }
        if appState.profile.selectedDocuments.isEmpty { missing.append("known documents") }
        return missing
    }

    private func stepHasUnansweredQuestions(_ step: IntakeStep) -> Bool {
        switch step {
        case .medical:
            return appState.profile.selectedConditions.isEmpty
        case .eligibility:
            return appState.profile.isVeteran == nil ||
                   appState.profile.hasAttorney == nil ||
                   appState.profile.hasActiveAppeal == nil ||
                   appState.profile.eligibleDischarge == nil
        case .history:
            return appState.profile.filedBefore == nil ||
                   appState.profile.deniedBefore == nil ||
                   appState.profile.hasPendingClaims == nil
        case .service:
            return appState.profile.branch.isEmpty ||
                   appState.profile.era.isEmpty
        case .documents:
            return false
        case .review:
            return false
        }
    }

    private func moveBack() {
        showMissedQuestionsError = false
        guard let previous = currentStep.previous else { return }
        withAnimation(.easeInOut) {
            currentStep = previous
        }
    }

    private func moveForward() {
        if stepHasUnansweredQuestions(currentStep) {
            withAnimation {
                showMissedQuestionsError = true
            }
            return
        }
        showMissedQuestionsError = false
        guard let next = currentStep.next else { return }
        withAnimation(.easeInOut) {
            currentStep = next
        }
    }

    private func submitIntake() {
        appState.submitIntake()
        showSubmittedConfirmation = true
    }
}

struct DossierView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @EnvironmentObject private var vaultStore: VaultStore
    @State private var isImporterPresented = false
    @State private var selectedCategory: DocumentCategory = .evidence
    @State private var selectedPortalLink: VARecordsPortalLink?
    @State private var showPostPortalImportPrompt = false
    @State private var isUploadingDocuments = false
    @State private var uploadStatusMessage: String?
    @State private var uploadStatusIsError = false

    // Info Alert states
    @State private var showInfoAlert = false
    @State private var infoAlertTitle = ""
    @State private var infoAlertMessage = ""

    // Medication typing state
    @State private var showMedicationInput = false

    // Prefill form selection state
    @State private var activePrefillForm: VAFormCatalogItem?
    
    // Choose form selection alert state for Buddy letters
    @State private var showBuddyFormChoice = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HeaderBand(
                        title: "Military Records Intake",
                        subtitle: "Mirror the VA Doc Finder record checklist, import selected files, and keep a local working set.",
                        systemImage: "folder.badge.plus"
                    )
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section {
                    Picker("Default category", selection: $selectedCategory) {
                        ForEach(DocumentCategory.allCases) { category in
                            Label(category.rawValue, systemImage: category.symbol).tag(category)
                        }
                    }

                    Button {
                        isImporterPresented = true
                    } label: {
                        Label("Import Records", systemImage: "square.and.arrow.down.fill")
                            .font(.headline)
                    }
                }

                Section("VA.gov records portals") {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Open VA.gov in a secure Safari sheet", systemImage: "safari.fill")
                            .font(.headline)
                        Text("Sign in directly with VA.gov, Login.gov, or ID.me. VA Doc Finder cannot read passwords, AutoFill, site data, or browsing history.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.vertical, 4)

                    ForEach(VARecordsPortalLibrary.links) { link in
                        Button {
                            selectedPortalLink = link
                        } label: {
                            ToolRow(title: link.title, detail: link.detail, systemImage: link.systemImage)
                        }
                    }
                }

                Section {
                    Picker("Client Classification", selection: Binding(
                        get: { appState.profile.filedBefore ?? false },
                        set: { appState.profile.filedBefore = $0 }
                    )) {
                        Text("Never Filed").tag(false)
                        Text("Filed Before").tag(true)
                    }
                    .pickerStyle(.segmented)
                    .listRowInsets(EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12))
                } header: {
                    Text("Client Classification")
                }

                Section("Document Checklist") {
                    if appState.profile.filedBefore == true {
                        ForEach(filedBeforeDocs) { doc in
                            DossierChecklistRow(
                                item: doc,
                                status: badgeForDocument(doc.id),
                                onUpload: {
                                    selectedCategory = doc.category
                                    isImporterPresented = true
                                },
                                onSkip: {
                                    if appState.profile.dossierSkippedDocuments.contains(doc.id) {
                                        appState.profile.dossierSkippedDocuments.removeAll { $0 == doc.id }
                                    } else {
                                        appState.profile.dossierSkippedDocuments.append(doc.id)
                                    }
                                },
                                onInfo: {
                                    showInfoForDoc(doc.id)
                                },
                                onCreate: doc.id == "20-0995" || doc.id == "20-0996" ? {
                                    let formNum = doc.id == "20-0995" ? "20-0995" : "20-0996"
                                    if let form = VAFormCatalogService.fallbackForms.first(where: { $0.formNumber == formNum }) {
                                        activePrefillForm = form
                                    }
                                } : nil,
                                onType: nil,
                                onShortcut: ["rated_conditions", "claim_letters", "va_medical_record"].contains(doc.id) ? {
                                    triggerVAShortcut(doc.id)
                                } : nil
                            )
                        }
                    } else {
                        ForEach(neverFiledDocs) { doc in
                            DossierChecklistRow(
                                item: doc,
                                status: badgeForDocument(doc.id),
                                onUpload: {
                                    selectedCategory = doc.category
                                    isImporterPresented = true
                                },
                                onSkip: {
                                    if appState.profile.dossierSkippedDocuments.contains(doc.id) {
                                        appState.profile.dossierSkippedDocuments.removeAll { $0 == doc.id }
                                    } else {
                                        appState.profile.dossierSkippedDocuments.append(doc.id)
                                    }
                                },
                                onInfo: {
                                    showInfoForDoc(doc.id)
                                },
                                onCreate: doc.id == "buddy_letters" ? {
                                    showBuddyFormChoice = true
                                } : (doc.id == "21-526ez" || doc.id == "21-0966" ? {
                                    let formNum = doc.id == "21-526ez" ? "21-526EZ" : "21-0966"
                                    if let form = VAFormCatalogService.fallbackForms.first(where: { $0.formNumber == formNum }) {
                                        activePrefillForm = form
                                    }
                                } : nil),
                                onType: doc.id == "medication_list" ? {
                                    showMedicationInput = true
                                } : nil,
                                onShortcut: nil
                            )
                        }
                    }
                }

                Section("Local dossier") {
                    if vaultStore.items.isEmpty {
                        EmptyStateView(
                            systemImage: "folder",
                            title: "No imported records",
                            message: "Add PDFs, images, or notes from Files to create the local VA Doc Finder working dossier."
                        )
                    } else {
                        ForEach(vaultStore.items) { item in
                            VaultItemRow(item: item, fileURL: vaultStore.fileURL(for: item))
                                .swipeActions {
                                    Button(role: .destructive) {
                                        vaultStore.delete(item)
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                        }
                    }
                }

                customerSyncSection
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Dossier")
            .sheet(item: $selectedPortalLink, onDismiss: {
                showPostPortalImportPrompt = true
            }) { link in
                SecurePortalBrowserView(url: link.resolvedURL)
                    .ignoresSafeArea()
            }
            .fileImporter(
                isPresented: $isImporterPresented,
                allowedContentTypes: [.pdf, .image, .text, .data],
                allowsMultipleSelection: true
            ) { result in
                switch result {
                case .success(let urls):
                    vaultStore.importFiles(from: urls, category: selectedCategory)
                case .failure(let error):
                    vaultStore.lastImportError = error.localizedDescription
                }
            }
            .alert("Import Issue", isPresented: Binding(
                get: { vaultStore.lastImportError != nil },
                set: { isPresented in
                    if !isPresented {
                        vaultStore.lastImportError = nil
                    }
                }
            )) {
                Button("OK") {
                    vaultStore.lastImportError = nil
                }
            } message: {
                Text(vaultStore.lastImportError ?? "")
            }
            .alert("Import VA.gov Files", isPresented: $showPostPortalImportPrompt) {
                Button("Import Files") {
                    isImporterPresented = true
                }
                Button("Not Now", role: .cancel) {}
            } message: {
                Text("If you downloaded VA letters, Blue Button records, claim files, or PDFs, import them into the dossier now.")
            }
            .alert(infoAlertTitle, isPresented: $showInfoAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(infoAlertMessage)
            }
            .sheet(isPresented: $showMedicationInput) {
                MedicationInputSheet()
            }
            .sheet(item: $activePrefillForm) { form in
                NavigationStack {
                    VAFormDetailView(form: form)
                        .toolbar {
                            ToolbarItem(placement: .navigationBarLeading) {
                                Button("Close") {
                                    activePrefillForm = nil
                                }
                            }
                        }
                }
            }
            .confirmationDialog("Create Statement Document", isPresented: $showBuddyFormChoice, titleVisibility: .visible) {
                Button("VA Form 21-10210 (Lay/Witness Statement)") {
                    if let form = VAFormCatalogService.fallbackForms.first(where: { $0.formNumber == "21-10210" }) {
                        activePrefillForm = form
                    }
                }
                Button("VA Form 21-4138 (Statement in Support of Claim)") {
                    if let form = VAFormCatalogService.fallbackForms.first(where: { $0.formNumber == "21-4138" }) {
                        activePrefillForm = form
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Select which official VA form you would like to prefill with your profile information and intake records.")
            }
        }
    }

    @ViewBuilder
    private var customerSyncSection: some View {
        Section {
            Toggle(isOn: Binding(
                get: { appState.profile.customerSyncConsent },
                set: { appState.profile.customerSyncConsent = $0 }
            )) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Share with Digital Sync customer portal")
                        .font(.headline)
                    Text("Uploads intake, selected conditions, record list, and any records you choose to send to the staff portal.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            if !appState.supportConversation.hasReachableContact {
                Label("Add an email or phone number in Tools before syncing.", systemImage: "person.crop.circle.badge.exclamationmark")
                    .font(.caption)
                    .foregroundStyle(Color.documentGold)
            }

            Button {
                Task {
                    await appState.syncCustomerWorkspace(vaultItems: vaultStore.items)
                }
            } label: {
                Label(appState.customerSyncIsRunning ? "Syncing Portal" : "Sync Intake and Record List", systemImage: "arrow.triangle.2.circlepath")
            }
            .disabled(appState.customerSyncIsRunning || !appState.profile.customerSyncConsent || !appState.supportConversation.hasReachableContact)

            Button {
                uploadImportedRecords()
            } label: {
                Label(isUploadingDocuments ? "Uploading Records" : "Upload Imported Records", systemImage: "icloud.and.arrow.up.fill")
            }
            .disabled(
                isUploadingDocuments
                    || vaultStore.items.isEmpty
                    || !appState.profile.customerSyncConsent
                    || !appState.supportConversation.hasReachableContact
            )

            if let lastSync = appState.profile.customerLastSyncedAt {
                Label("Last synced \(lastSync.formatted(date: .abbreviated, time: .shortened))", systemImage: "checkmark.seal.fill")
                    .font(.caption)
                    .foregroundStyle(Color.tyfysBlue)
            }
            if let message = appState.customerSyncMessage {
                Label(message, systemImage: "checkmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(Color.tyfysBlue)
            }
            if let message = uploadStatusMessage {
                Label(message, systemImage: uploadStatusIsError ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(uploadStatusIsError ? Color.documentGold : Color.tyfysBlue)
            }
            if let error = appState.customerSyncError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Color.documentGold)
            }
        } header: {
            Text("Customer portal sync")
        } footer: {
            Text("VA.gov login data is never uploaded. Upload Imported Records sends every dossier record that has not been uploaded before; each record is sent once.")
        }
    }

    private func uploadImportedRecords() {
        isUploadingDocuments = true
        uploadStatusMessage = nil
        uploadStatusIsError = false
        // Clear any earlier sync banner so the upload outcome is what the
        // user sees — a stale "Customer portal updated." must not read as a
        // successful upload when the upload below fails.
        appState.customerSyncMessage = nil
        Task {
            if appState.profile.customerClientId.isEmpty {
                await appState.syncCustomerWorkspace(vaultItems: vaultStore.items)
                await MainActor.run { appState.customerSyncMessage = nil }
            }

            guard !appState.profile.customerClientId.isEmpty,
                  !appState.profile.customerClientToken.isEmpty else {
                await MainActor.run {
                    uploadStatusMessage = "Records were not uploaded — the portal connection could not be established. Try Sync Intake and Record List first."
                    uploadStatusIsError = true
                    isUploadingDocuments = false
                }
                return
            }

            let pending = vaultStore.items.filter { !appState.profile.uploadedRecordIds.contains($0.id.uuidString) }
            guard !pending.isEmpty else {
                await MainActor.run {
                    uploadStatusMessage = "All imported records were already uploaded."
                    isUploadingDocuments = false
                }
                return
            }

            // Upload each record independently so one bad file (e.g. missing
            // from disk) cannot permanently block the records behind it.
            var uploaded = 0
            var failed: [String] = []
            for item in pending {
                do {
                    _ = try await CustomerSyncService.uploadDocument(
                        clientId: appState.profile.customerClientId,
                        clientToken: appState.profile.customerClientToken,
                        item: item,
                        fileURL: vaultStore.fileURL(for: item)
                    )
                    uploaded += 1
                    await MainActor.run {
                        appState.profile.uploadedRecordIds.append(item.id.uuidString)
                    }
                } catch {
                    failed.append(item.title)
                }
            }
            await MainActor.run {
                if failed.isEmpty {
                    uploadStatusMessage = "\(uploaded) new record\(uploaded == 1 ? "" : "s") uploaded to the customer portal."
                } else {
                    uploadStatusMessage = "\(uploaded) uploaded, \(failed.count) failed (\(failed.joined(separator: ", "))). Successfully uploaded records will not be re-sent."
                    uploadStatusIsError = true
                }
                isUploadingDocuments = false
            }
        }
    }

    private func isDocumentUploaded(_ id: String) -> Bool {
        // Normalize separators so "Service_Treatment_Records.pdf" matches the
        // space-separated phrases below.
        func normalized(_ value: String) -> String {
            value.lowercased()
                .replacingOccurrences(of: "_", with: " ")
                .replacingOccurrences(of: "-", with: " ")
                .replacingOccurrences(of: ".", with: " ")
        }
        let matchesVault = vaultStore.items.contains { item in
            let title = normalized(item.title)
            let filename = normalized(item.originalFilename)

            switch id {
            case "dd214":
                return title.contains("dd214") || title.contains("dd 214") || title.contains("separation") ||
                       filename.contains("dd214") || filename.contains("dd 214") || filename.contains("separation")
            case "buddy_letters":
                return title.contains("buddy") || title.contains("lay") || title.contains("witness") || title.contains("statement") || title.contains("21 10210") || title.contains("21 4138") ||
                       filename.contains("buddy") || filename.contains("lay") || filename.contains("witness") || filename.contains("statement") || filename.contains("21 10210") || filename.contains("21 4138")
            case "str":
                return title.contains("treatment record") || title.contains("service treatment") || title.contains("military medical") || title.contains("sick call") ||
                       filename.contains("treatment record") || filename.contains("service treatment") || filename.contains("military medical") || filename.contains("sick call")
            case "private_medical":
                return title.contains("private") || title.contains("civilian") || title.contains("medical record") || title.contains("clinic") || title.contains("hospital") ||
                       filename.contains("private") || filename.contains("civilian") || filename.contains("medical record") || filename.contains("clinic") || filename.contains("hospital")
            case "medication_list":
                return title.contains("medication") || title.contains("med list") || title.contains("rx") ||
                       filename.contains("medication") || filename.contains("med list") || filename.contains("rx")
            case "rated_conditions":
                return title.contains("rating") || title.contains("rated") ||
                       filename.contains("rating") || filename.contains("rated")
            case "claim_letters":
                return title.contains("claim") || title.contains("decision") || title.contains("award") || title.contains("denial") ||
                       filename.contains("claim") || filename.contains("decision") || filename.contains("award") || filename.contains("denial")
            case "va_medical_record":
                return title.contains("blue button") || title.contains("bluebutton") || title.contains("va medical") || title.contains("my health") || title.contains("healthevet") ||
                       filename.contains("blue button") || filename.contains("bluebutton") || filename.contains("va medical") || filename.contains("my health") || filename.contains("healthevet")
            case "21-526ez":
                return title.contains("526ez") || title.contains("526 ez") || filename.contains("526ez") || filename.contains("526 ez")
            case "21-0966":
                return title.contains("0966") || filename.contains("0966")
            case "20-0995":
                return title.contains("0995") || filename.contains("0995")
            case "20-0996":
                return title.contains("0996") || filename.contains("0996")
            default:
                return false
            }
        }
        
        if matchesVault { return true }
        
        if id == "medication_list" && !appState.profile.dossierTypedMedication.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return true
        }
        
        return false
    }

    private func badgeForDocument(_ id: String) -> (text: String, color: Color) {
        if isDocumentUploaded(id) {
            return ("Uploaded", .green)
        }
        
        if appState.profile.dossierSkippedDocuments.contains(id) {
            return ("Uploaded Later", .secondary)
        }
        
        if id == "buddy_letters" || id == "21-0966" || id == "20-0996" {
            return ("Recommended", Color.documentGold)
        }
        
        return ("Needed", .red)
    }

    private func showInfoForDoc(_ id: String) {
        switch id {
        case "dd214":
            infoAlertTitle = "Why DD-214 is Needed"
            infoAlertMessage = "The DD-214 verifies your active duty service dates, character of discharge, and branch of service, which the VA requires to establish base eligibility for compensation."
        case "buddy_letters":
            infoAlertTitle = "Why Buddy Letters are Recommended"
            infoAlertMessage = "Lay witness statements from family, friends, or fellow service members provide first-hand evidence of how your injuries occurred in service or how they affect your daily life and work today."
        case "str":
            infoAlertTitle = "Why Service Treatment Records are Needed"
            infoAlertMessage = "STRs provide crucial medical evidence of in-service onset or treatment of your conditions, which is required to establish direct service connection."
        case "private_medical":
            infoAlertTitle = "Why Private Medical Records are Needed"
            infoAlertMessage = "Civilian medical records establish your current diagnoses, severity of symptoms, and continuous treatment history for conditions since you left active service."
        case "medication_list":
            infoAlertTitle = "Why Medication List is Needed"
            infoAlertMessage = "A comprehensive medication list demonstrates active treatment and the chronic nature of your conditions, which direct VA rating decisions."
        case "rated_conditions":
            infoAlertTitle = "Why Current Rated Conditions is Needed"
            infoAlertMessage = "Provides an authoritative summary of your current rated service-connected disabilities and diagnostic codes, which helps target potential increase or secondary claims."
        case "claim_letters":
            infoAlertTitle = "Why Claim Letters are Needed"
            infoAlertMessage = "Your prior VA decision letters contain detailed rationales for ratings, denials, or effective dates, which are essential to identifying appeal paths or supplemental claim evidence."
        case "va_medical_record":
            infoAlertTitle = "Why VA Medical Records are Needed"
            infoAlertMessage = "Health records from VA clinics and My HealtheVet detail your medical history, prescriptions, and diagnostics within the VA system, forming a major part of your claim evidence."
        case "21-526ez":
            infoAlertTitle = "Why VA Form 21-526EZ is Needed"
            infoAlertMessage = "This is the official Application for Disability Compensation. Generating this prefilled form is the final step to package your claim using your local intake profile."
        case "21-0966":
            infoAlertTitle = "Why VA Form 21-0966 is Recommended"
            infoAlertMessage = "The Intent to File form sets the earliest possible effective date for your compensation, giving you up to one full year to gather evidence before submitting the formal claim."
        case "20-0995":
            infoAlertTitle = "Why VA Form 20-0995 is Needed"
            infoAlertMessage = "If you have been denied before and have new medical records or private opinion letters, the Supplemental Claim form is required to reopen and review your claim."
        case "20-0996":
            infoAlertTitle = "Why VA Form 20-0996 is Recommended"
            infoAlertMessage = "The Higher-Level Review form is used to request that a senior officer re-examine your prior decision to find administrative or legal errors, without submitting new evidence."
        default:
            infoAlertTitle = "Document Details"
            infoAlertMessage = "This document helps organize your official claim packet."
        }
        showInfoAlert = true
    }

    private func triggerVAShortcut(_ id: String) {
        let portalId: String
        switch id {
        case "rated_conditions":
            portalId = "benefit-letters"
        case "claim_letters":
            portalId = "claim-status"
        case "va_medical_record":
            portalId = "blue-button"
        default:
            return
        }
        
        if let link = VARecordsPortalLibrary.links.first(where: { $0.id == portalId }) {
            selectedPortalLink = link
        }
    }
}

struct DossierDocItem: Identifiable {
    let id: String
    let title: String
    let detail: String
    let category: DocumentCategory
}

private let neverFiledDocs = [
    DossierDocItem(id: "dd214", title: "DD-214 Paperwork", detail: "Upload this first so service dates and discharge details are organized.", category: .service),
    DossierDocItem(id: "buddy_letters", title: "Buddy Letters", detail: "Lay witness statements from family, friends, or fellow service members backing your claimed conditions.", category: .evidence),
    DossierDocItem(id: "str", title: "Service Treatment Records", detail: "Military medical visits, profiles, sick call notes, and in-service diagnoses.", category: .service),
    DossierDocItem(id: "private_medical", title: "Private Medical Records", detail: "Civilian treatment notes, imaging, specialist letters, and private doctor records.", category: .medical),
    DossierDocItem(id: "medication_list", title: "Medication List", detail: "A list of current medications and prescriptions. Can be typed directly or uploaded.", category: .medical),
    DossierDocItem(id: "21-0966", title: "VA Form 21-0966 (Intent to File)", detail: "Sets your retroactive payment effective date while you gather evidence.", category: .forms),
    DossierDocItem(id: "21-526ez", title: "VA Form 21-526EZ (Initial Claim)", detail: "Application for Disability Compensation. The official form to submit your initial claim packet.", category: .forms)
]

private let filedBeforeDocs = [
    DossierDocItem(id: "rated_conditions", title: "Current Rated Conditions", detail: "Your current service-connected disability ratings, percentages, and diagnostic codes.", category: .vaRecords),
    DossierDocItem(id: "claim_letters", title: "Claim Letters & Decisions", detail: "Prior VA decision letters, award summaries, and rating decision narratives.", category: .vaRecords),
    DossierDocItem(id: "va_medical_record", title: "VA Medical Record", detail: "Health records from VA clinics and My HealtheVet Blue Button exports.", category: .vaRecords),
    DossierDocItem(id: "20-0995", title: "VA Form 20-0995 (Supplemental Claim)", detail: "Decision Review Request: Supplemental Claim. Used to reopen previously denied claims with new evidence.", category: .forms),
    DossierDocItem(id: "20-0996", title: "VA Form 20-0996 (Higher-Level Review)", detail: "Request a senior-level administrative review of prior decisions.", category: .forms)
]

struct DossierChecklistRow: View {
    let item: DossierDocItem
    let status: (text: String, color: Color)
    let onUpload: () -> Void
    let onSkip: () -> Void
    let onInfo: () -> Void
    let onCreate: (() -> Void)?
    let onType: (() -> Void)?
    let onShortcut: (() -> Void)?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center) {
                Text(item.title)
                    .font(.headline)
                    .lineLimit(2)
                    .foregroundStyle(Color.documentInk)
                Spacer()
                Text(status.text.uppercased())
                    .font(.caption2.bold())
                    .foregroundStyle(status.color)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(status.color.opacity(0.12))
                    .cornerRadius(4)
            }
            
            Text(item.detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    Button(action: onUpload) {
                        Label("Upload Now", systemImage: "square.and.arrow.down")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.tyfysBlue.opacity(0.08), in: Capsule())
                    }
                    .buttonStyle(.plain)
                    
                    if status.text != "Uploaded" {
                        Button(action: onSkip) {
                            Label(status.text == "Uploaded Later" ? "Need Document" : "Upload Later",
                                  systemImage: status.text == "Uploaded Later" ? "exclamationmark.circle" : "clock")
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color(.systemGray5), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    
                    if let onCreate = onCreate {
                        Button(action: onCreate) {
                            Label("Create Document", systemImage: "wand.and.stars")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.documentGold, in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    
                    if let onType = onType {
                        Button(action: onType) {
                            Label("Type List", systemImage: "keyboard")
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.tyfysBlue.opacity(0.08), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    
                    if let onShortcut = onShortcut {
                        Button(action: onShortcut) {
                            Label("VA.gov Shortcut", systemImage: "safari")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Color.documentGold)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.documentGold.opacity(0.08), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    
                    Button(action: onInfo) {
                        Label("Do I need it?", systemImage: "questionmark.circle")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color(.systemGray6), in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.vertical, 2)
            }
        }
        .padding(.vertical, 6)
    }
}

struct MedicationInputSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appState: TYFYSAppState
    @State private var text: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Type or paste your current medications, dosages, and prescribing doctors. This will be automatically saved to your local veteran profile and can prefill relevant VA claims forms.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                Section("Current Medications") {
                    TextEditor(text: $text)
                        .frame(minHeight: 200)
                        .font(.body)
                }
            }
            .navigationTitle("Type Medication List")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        appState.profile.dossierTypedMedication = text
                        dismiss()
                    }
                    .bold()
                }
            }
            .onAppear {
                text = appState.profile.dossierTypedMedication
            }
        }
    }
}

enum IntakeStep: Int, CaseIterable, Identifiable {
    case medical
    case eligibility
    case history
    case service
    case documents
    case review

    var id: Int { rawValue }

    var title: String {
        switch self {
        case .medical: "Medical"
        case .eligibility: "Eligibility"
        case .history: "History"
        case .service: "Service"
        case .documents: "Records"
        case .review: "Review"
        }
    }

    var subtitle: String {
        switch self {
        case .medical:
            "Choose the body system first, then drill into the specific 38 CFR condition path and evidence needs."
        case .eligibility:
            "Answer the basic representation and eligibility questions that shape the record plan."
        case .history:
            "Capture prior claim, denial, appeal, and pending-claim context."
        case .service:
            "Add service branch, era, and current rating before reviewing the record checklist."
        case .documents:
            "Mark records already available so the dossier can focus on what is missing."
        case .review:
            "Review the intake draft, submit it locally, and move to the dossier workflow."
        }
    }

    var next: IntakeStep? {
        IntakeStep(rawValue: rawValue + 1)
    }

    var previous: IntakeStep? {
        IntakeStep(rawValue: rawValue - 1)
    }
}

struct IntakeStepPills: View {
    let currentStep: IntakeStep
    let onSelect: (IntakeStep) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(IntakeStep.allCases) { step in
                    Button {
                        onSelect(step)
                    } label: {
                        HStack(spacing: 6) {
                            Text("\(step.rawValue + 1)")
                                .font(.caption.bold())
                                .foregroundStyle(step == currentStep ? .white : Color.tyfysBlue)
                                .frame(width: 22, height: 22)
                                .background(step == currentStep ? Color.tyfysBlue : Color.tyfysBlue.opacity(0.12), in: Circle())
                            Text(step.title)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(step == currentStep ? Color.tyfysSlate : .secondary)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(step == currentStep ? Color.tyfysBlue.opacity(0.10) : Color(.tertiarySystemGroupedBackground), in: Capsule())
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("intake.step.\(step.title.lowercased())")
                }
            }
            .padding(.vertical, 2)
        }
    }
}

struct IntakeReviewSection: View {
    let profile: VeteranProfile
    let missingItems: [String]

    var body: some View {
        Section("Review intake") {
            VStack(alignment: .leading, spacing: 12) {
                Label(profile.isIntakeSubmitted ? "Intake submitted locally" : "Intake draft ready to submit", systemImage: profile.isIntakeSubmitted ? "checkmark.seal.fill" : "square.and.pencil")
                    .font(.headline)
                    .foregroundStyle(profile.isIntakeSubmitted ? Color.documentGold : Color.tyfysSlate)

                SnapshotRow(label: "Medical issues", value: profile.selectedConditions.isEmpty ? "None selected" : profile.selectedConditions.joined(separator: ", "))
                SnapshotRow(label: "Branch", value: profile.branch.isEmpty ? "Not set" : profile.branch)
                SnapshotRow(label: "Era", value: profile.era.isEmpty ? "Not set" : profile.era)
                SnapshotRow(label: "Current rating", value: "\(profile.currentRating)%")
                SnapshotRow(label: "Documents", value: profile.selectedDocuments.isEmpty ? "None marked" : "\(profile.selectedDocuments.count) marked")

                if missingItems.isEmpty {
                    Label("No core intake gaps remain.", systemImage: "checkmark.circle.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.tyfysBlue)
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Still missing", systemImage: "exclamationmark.triangle.fill")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.documentGold)
                        FlowPillList(items: missingItems)
                        Text("You can submit a partial intake draft and return later. Submitting saves the intake status locally; it does not file anything with VA.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .padding(.vertical, 4)
        }
    }
}

struct IntakeActionBar: View {
    let step: IntakeStep
    let completionProgress: Double
    let isSubmitted: Bool
    let showError: Bool
    let onBack: () -> Void
    let onContinue: () -> Void
    let onSubmit: () -> Void

    var body: some View {
        VStack(spacing: 10) {
            if showError {
                Text("QUESTIONS MISSED scroll to answer")
                    .font(.subheadline.bold())
                    .foregroundStyle(.red)
                    .padding(.vertical, 4)
                    .transition(.opacity)
            }

            HStack(spacing: 12) {
                Button {
                    onBack()
                } label: {
                    Label("Back", systemImage: "chevron.left")
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.bordered)
                .disabled(step.previous == nil)
                .accessibilityIdentifier("intake.back")

                if step.next == nil {
                    Button {
                        onSubmit()
                    } label: {
                        Label(isSubmitted ? "Submit Again" : "Submit Intake", systemImage: "checkmark.circle.fill")
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.tyfysBlue)
                    .accessibilityIdentifier("intake.submit")
                } else {
                    Button {
                        onContinue()
                    } label: {
                        Label("Continue", systemImage: "chevron.right")
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.tyfysBlue)
                    .accessibilityIdentifier("intake.continue")
                }
            }

            Text("\(Int(completionProgress * 100))% complete - \(step.title)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 10)
        .background(.regularMaterial)
    }
}

struct RatingCalculatorView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @State private var selectedCondition = TYFYSData.conditions.first?.name ?? "PTSD"
    @State private var selectedRating = 10

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HeaderBand(
                        title: "VA Rating Calculator",
                        subtitle: "Native combined-rating math with the same Digital Sync workflow goal: model scenarios before deciding what records matter.",
                        systemImage: "function"
                    )
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(alignment: .firstTextBaseline) {
                            Text("\(appState.combinedRating)%")
                                .font(.system(size: 52, weight: .black, design: .rounded))
                                .foregroundStyle(Color.tyfysSlate)
                            Text("combined")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                            Spacer()
                        }
                        ProgressView(value: Double(appState.combinedRating), total: 100)
                            .tint(.tyfysBlue)
                    }
                    .padding(.vertical, 4)
                }

                Section("Add condition") {
                    Picker("Condition", selection: $selectedCondition) {
                        ForEach(TYFYSData.conditions.map(\.name), id: \.self) { condition in
                            Text(condition).tag(condition)
                        }
                    }
                    Stepper("Rating: \(selectedRating)%", value: $selectedRating, in: 0...100, step: 10)
                    Button {
                        appState.addRatingLine(condition: selectedCondition, rating: selectedRating)
                    } label: {
                        Label("Add to Scenario", systemImage: "plus.circle.fill")
                    }
                    .disabled(selectedRating == 0)
                }

                Section("Scenario") {
                    if appState.ratingLines.isEmpty {
                        EmptyStateView(systemImage: "percent", title: "No conditions added", message: "Add rated conditions to model a combined VA rating.")
                    } else {
                        ForEach(appState.ratingLines) { line in
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(line.condition)
                                        .font(.headline)
                                    Text("Included in combined rating math")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("\(line.rating)%")
                                    .font(.headline)
                                    .foregroundStyle(Color.tyfysBlue)
                            }
                            .swipeActions {
                                Button(role: .destructive) {
                                    appState.removeRatingLine(line)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                        }
                    }
                }

                Section("Important") {
                    Text("This calculator is an organizer and estimator. VA determines actual ratings and effective dates.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Calculator")
        }
    }
}

struct AccountView: View {
    @EnvironmentObject private var appState: TYFYSAppState
    @State private var draftMessage = ""
    @State private var showResetConfirmation = false
    let onShowOnboarding: () -> Void

    private var contactNameBinding: Binding<String> {
        Binding {
            appState.supportConversation.contactName
        } set: { value in
            appState.updateSupportContact(name: value)
        }
    }

    private var contactEmailBinding: Binding<String> {
        Binding {
            appState.supportConversation.contactEmail
        } set: { value in
            appState.updateSupportContact(email: value)
        }
    }

    private var contactPhoneBinding: Binding<String> {
        Binding {
            appState.supportConversation.contactPhone
        } set: { value in
            appState.updateSupportContact(phone: value)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HeaderBand(
                        title: "Tools & Support",
                        subtitle: "PACT research, evidence planning, medical opinion prep, strategy notes, and support surfaces from Digital Sync.",
                        systemImage: "square.grid.2x2.fill"
                    )
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section("Claim tools") {
                    NavigationLink {
                        VARecordsPullView()
                    } label: {
                        ToolRow(title: "Pull VA Records & Docs", detail: "One place to pull benefit letters, medical records, decisions, DD-214, and your C-file — plus documents from your Digital Sync portal.", systemImage: "square.and.arrow.down.on.square.fill")
                    }

                    NavigationLink {
                        PACTExplorerView()
                    } label: {
                        ToolRow(title: "PACT Act Explorer", detail: "Review common exposure-era signals and the records that support them.", systemImage: "lungs.fill")
                    }

                    NavigationLink {
                        MedicalOpinionDraftView()
                    } label: {
                        ToolRow(title: "Medical Opinion Draft", detail: "Organize diagnosis, service event, records, and nexus questions before outside review.", systemImage: "stethoscope")
                    }

                    NavigationLink {
                        StrategyView()
                    } label: {
                        ToolRow(title: "Claim Strategy", detail: "Turn intake answers into a practical next-step plan.", systemImage: "point.topleft.down.curvedto.point.bottomright.up")
                    }

                    NavigationLink {
                        FindView()
                    } label: {
                        ToolRow(title: "Evidence Checklist", detail: "Search common VA claim record types and where to find them.", systemImage: "doc.text.magnifyingglass")
                    }

                    NavigationLink {
                        VAFormsLibraryView()
                    } label: {
                        ToolRow(title: "VA Forms & PDF Filler", detail: "Search official VA forms and generate review-ready prefilled PDF drafts from intake data.", systemImage: "doc.fill.badge.plus")
                    }

                    NavigationLink {
                        ClaimQuestionsGuideView()
                    } label: {
                        ToolRow(title: "Claim Questions Guide", detail: "Review focused prompts for common claim organization questions.", systemImage: "message.badge.waveform")
                    }

                    NavigationLink {
                        PacketView()
                    } label: {
                        ToolRow(title: "Packet Builder", detail: "Work through the organization checklist before sharing files for review.", systemImage: "checklist.checked")
                    }

                    NavigationLink {
                        SettingsView()
                    } label: {
                        ToolRow(title: "App Info & Privacy", detail: "Privacy posture, scope, and Digital Sync policies.", systemImage: "info.circle")
                    }
                }

                supportSection

                Section("Digital Sync") {
                    Text("VA Doc Finder is provided by Digital Sync, LLC as a private records and preparation workspace. It is not affiliated with the Department of Veterans Affairs and does not submit claims, provide legal representation, or determine benefit eligibility.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Link(destination: URL(string: "https://tyfys.net/privacy.html")!) {
                        Label("Privacy Policy", systemImage: "lock.doc")
                    }
                    Link(destination: URL(string: "https://tyfys.net/app-support.html")!) {
                        Label("Support", systemImage: "questionmark.circle")
                    }
                    Link(destination: URL(string: "https://tyfys.net/account-deletion.html")!) {
                        Label("Account Deletion", systemImage: "person.crop.circle.badge.xmark")
                    }
                }

                Section {
                    Button {
                        onShowOnboarding()
                    } label: {
                        Label("Show Onboarding Again", systemImage: "sparkles")
                    }

                    Button(role: .destructive) {
                        showResetConfirmation = true
                    } label: {
                        Label("Reset Local Workspace", systemImage: "arrow.counterclockwise")
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Tools")
            .confirmationDialog(
                "Reset Local Workspace?",
                isPresented: $showResetConfirmation,
                titleVisibility: .visible
            ) {
                Button("Reset Everything", role: .destructive) {
                    appState.resetWorkspace()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This permanently clears your intake answers, rating scenario, support conversation link, and portal connection on this device. Imported documents stay in the dossier.")
            }
            .task {
                await appState.refreshSupportMessages()
            }
            .refreshable {
                await appState.refreshSupportMessages()
            }
        }
    }

    @ViewBuilder
    private var supportSection: some View {
        Section {
            VStack(alignment: .leading, spacing: 12) {
                Text("Add your contact details so Digital Sync can reply to this app conversation.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                TextField("Name", text: contactNameBinding)
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .textFieldStyle(.roundedBorder)

                TextField("Email", text: contactEmailBinding)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)

                TextField("Phone", text: contactPhoneBinding)
                    .keyboardType(.phonePad)
                    .textContentType(.telephoneNumber)
                    .textFieldStyle(.roundedBorder)
            }
            .padding(.vertical, 4)

            if appState.messages.isEmpty {
                EmptyStateView(
                    systemImage: "message",
                    title: "No messages yet",
                    message: "Send a question and replies from Digital Sync will appear here."
                )
            } else {
                ForEach(appState.messages) { message in
                    MessageBubble(message: message)
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                TextField("Message Digital Sync support", text: $draftMessage, axis: .vertical)
                    .lineLimit(2...5)
                    .textFieldStyle(.roundedBorder)

                HStack {
                    if appState.supportIsSyncing {
                        ProgressView()
                            .controlSize(.small)
                    }

                    Text(appState.supportConversation.isLinked ? "Conversation linked" : "Ready to start a conversation")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)

                    Spacer()

                    Button {
                        let message = draftMessage
                        draftMessage = ""
                        Task {
                            let sent = await appState.sendSupportMessage(message)
                            // Restore the failed draft only if the user hasn't
                            // started typing a new message in the meantime.
                            if !sent && draftMessage.isEmpty {
                                draftMessage = message
                            }
                        }
                    } label: {
                        Label("Send", systemImage: "paperplane.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.tyfysBlue)
                    .disabled(
                        appState.supportIsSyncing
                            || draftMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                    )
                }
            }
            .padding(.vertical, 4)

            if let supportError = appState.supportError {
                Label(supportError, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Color.documentGold)
            }
        } header: {
            Text("Digital Sync Support")
        } footer: {
            Text("Your contact details and typed message are sent to the Digital Sync customer console. If portal sharing is turned on in the Dossier tab, a workspace summary (selected conditions, checklist, modeled rating) is included; otherwise nothing else is sent. Documents are never uploaded from this screen.")
        }
    }
}

struct ToolRow: View {
    let title: String
    let detail: String
    let systemImage: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: systemImage)
                .font(.headline)
                .foregroundStyle(Color.tyfysBlue)
                .frame(width: 38, height: 38)
                .background(Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, 4)
    }
}

struct PACTExplorerView: View {
    private let rows = [
        ("Post-9/11 Southwest Asia", "Deployment orders, location history, diagnosis, and exposure screening notes."),
        ("Burn pits or airborne hazards", "PACT Act screening, pulmonary records, medication history, and lay statement."),
        ("Vietnam or Agent Orange era", "Service location proof, diagnosis, VA records, and prior rating decisions."),
        ("Camp Lejeune water exposure", "Base assignment records, diagnosis, treatment records, and timeline notes.")
    ]

    var body: some View {
        List {
            Section {
                HeaderBand(title: "PACT Act Explorer", subtitle: "Organize exposure-era clues and the documents that should be reviewed together.", systemImage: "lungs.fill")
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
            }
            Section("Exposure paths") {
                ForEach(rows, id: \.0) { row in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(row.0)
                            .font(.headline)
                        Text(row.1)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 6)
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("PACT Explorer")
    }
}

struct MedicalOpinionDraftView: View {
    @State private var diagnosis = ""
    @State private var serviceEvent = ""
    @State private var records = ""

    var body: some View {
        Form {
            Section {
                HeaderBand(title: "Medical Opinion Draft", subtitle: "Collect the facts a qualified professional would need before drafting or evaluating nexus language.", systemImage: "stethoscope")
                    .listRowInsets(EdgeInsets(top: 12, leading: 0, bottom: 8, trailing: 0))
                    .listRowBackground(Color.clear)
            }
            Section("Draft inputs") {
                TextField("Current diagnosis or symptom", text: $diagnosis, axis: .vertical)
                TextField("In-service event, exposure, or onset", text: $serviceEvent, axis: .vertical)
                TextField("Records that support the connection", text: $records, axis: .vertical)
            }
            Section("Review outline") {
                Text(outline)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Opinion Draft")
    }

    private var outline: String {
        if diagnosis.isEmpty && serviceEvent.isEmpty && records.isEmpty {
            return "Complete the fields above and this outline will update into a clean review question you can discuss with a qualified professional."
        }

        return """
        Condition: \(diagnosis.isEmpty ? "Not entered yet" : diagnosis)
        Service event: \(serviceEvent.isEmpty ? "Not entered yet" : serviceEvent)
        Supporting records: \(records.isEmpty ? "Not entered yet" : records)

        Review question: Do the records support a medically reasonable connection, aggravation theory, or secondary relationship that should be reviewed by a qualified professional?
        """
    }
}

struct StrategyView: View {
    @EnvironmentObject private var appState: TYFYSAppState

    var body: some View {
        List {
            Section {
                HeaderBand(title: "Claim Strategy", subtitle: "A plain-language plan based on intake completion, selected conditions, and available records.", systemImage: "point.topleft.down.curvedto.point.bottomright.up")
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
            }
            Section("Recommended sequence") {
                StrategyStep(number: 1, title: "Finish baseline intake", detail: "\(appState.profile.completionCount) of \(appState.profile.completionTotal) areas are complete.")
                StrategyStep(number: 2, title: "Gather missing records", detail: missingDocuments)
                StrategyStep(number: 3, title: "Prioritize conditions", detail: selectedConditions)
                StrategyStep(number: 4, title: "Review rating impact", detail: "Modeled combined rating: \(appState.combinedRating)%.")
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Strategy")
    }

    private var missingDocuments: String {
        let missing = TYFYSData.documentOptions.filter { !appState.profile.selectedDocuments.contains($0) }
        return missing.isEmpty ? "Core document checklist is marked complete." : missing.prefix(3).joined(separator: ", ")
    }

    private var selectedConditions: String {
        appState.profile.selectedConditions.isEmpty ? "No conditions selected yet." : appState.profile.selectedConditions.joined(separator: ", ")
    }
}

struct StrategyStep: View {
    let number: Int
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(number)")
                .font(.headline.bold())
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(Color.tyfysBlue, in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 5)
    }
}

struct ClaimQuestionsGuideView: View {
    private let prompts = [
        ("Where should I start?", "Start with service proof, current diagnosis, prior VA decisions, and the highest-impact condition."),
        ("What makes evidence stronger?", "Good evidence connects the condition, timeline, severity, and daily/work impact with clear dates."),
        ("What should I avoid?", "Avoid filing from memory alone when records, dates, and medication history can be organized first."),
        ("What is this not?", "This guide does not submit claims, provide legal representation, or replace medical advice.")
    ]

    var body: some View {
        List {
            Section {
                HeaderBand(title: "Claim Questions Guide", subtitle: "Focused prompts for organizing records and next-step questions.", systemImage: "message.badge.waveform")
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
            }
            Section("Guidance prompts") {
                ForEach(prompts, id: \.0) { prompt in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(prompt.0)
                            .font(.headline)
                        Text(prompt.1)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 6)
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Claims Guide")
    }
}

struct SectionCard<Content: View>: View {
    let title: String
    let systemImage: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Label(title, systemImage: systemImage)
                .font(.headline)
                .foregroundStyle(Color.tyfysSlate)
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}

struct TYFYSMetricTile: View {
    let value: String
    let label: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: systemImage)
                .font(.headline)
                .foregroundStyle(Color.documentGold)
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(Color.tyfysSlate)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text(label)
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(12)
        .frame(maxWidth: .infinity, minHeight: 108, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}

struct SOPTracker: View {
    let currentPhase: Int

    private let phases = [
        ("Setup", "Account Setup"),
        ("Prep", "Admin Prep"),
        ("Strategy", "Strategy & Intake"),
        ("Medical", "Exams & Medical")
    ]

    var body: some View {
        SectionCard(title: phases[max(0, currentPhase - 1)].1, systemImage: "timeline.selection") {
            VStack(spacing: 14) {
                HStack(spacing: 0) {
                    ForEach(Array(phases.enumerated()), id: \.offset) { index, phase in
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(index + 1 <= currentPhase ? Color.tyfysBlue : Color(.tertiarySystemFill))
                                    .frame(width: 34, height: 34)
                                Text("\(index + 1)")
                                    .font(.caption.bold())
                                    .foregroundStyle(index + 1 <= currentPhase ? .white : .secondary)
                            }
                            Text(phase.0)
                                .font(.caption2.bold())
                                .foregroundStyle(index + 1 == currentPhase ? Color.tyfysBlue : .secondary)
                                .lineLimit(1)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                Text(phaseDescription)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var phaseDescription: String {
        switch currentPhase {
        case 1:
            "Secure the baseline answers and identify the first missing documents."
        case 2:
            "Organize DD-214, service records, and decision history before deeper strategy."
        case 3:
            "Use rating math and evidence gaps to prioritize the next review path."
        default:
            "Prepare records, notes, and medical context for outside review or appointments."
        }
    }
}

struct NextActionButton: View {
    let title: String
    let detail: String
    let systemImage: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: systemImage)
                    .font(.headline)
                    .foregroundStyle(Color.tyfysBlue)
                    .frame(width: 34, height: 34)
                    .background(Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(detail)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
            }
            .padding(10)
            .background(Color(.tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }
}

struct SnapshotRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
            Spacer(minLength: 12)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(Color.tyfysSlate)
                .multilineTextAlignment(.trailing)
        }
    }
}

struct BooleanQuestionRow: View {
    let title: String
    let trueLabel: String
    let falseLabel: String
    @Binding var value: Bool?

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 8) {
                ChoiceButton(title: trueLabel, isSelected: value == true) {
                    value = true
                }
                ChoiceButton(title: falseLabel, isSelected: value == false) {
                    value = false
                }
            }
        }
        .padding(.vertical, 6)
    }
}

struct ChoiceButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .lineLimit(2)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.70)
                .foregroundStyle(isSelected ? .white : Color.tyfysBlue)
                .padding(.horizontal, 6)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .frame(minHeight: 44)
                .background(isSelected ? Color.tyfysBlue : Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }
}

struct SelectionGrid: View {
    let title: String
    let options: [String]
    @Binding var selectedValue: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 132), spacing: 8)], spacing: 8) {
                ForEach(options, id: \.self) { option in
                    ChoiceButton(title: option, isSelected: selectedValue == option) {
                        selectedValue = option
                    }
                }
            }
        }
        .padding(.vertical, 6)
    }
}

struct ConditionCategoryDisclosureRow: View {
    let category: ClaimConditionCategory
    let selectedConditions: [String]
    let selectedDetails: [String: [String]]
    @Binding var isExpanded: Bool
    let onToggleCondition: (ClaimCondition) -> Void
    let onToggleDetail: (ClaimCondition, ConditionDetailOption) -> Void

    private var selectedCount: Int {
        category.conditions.filter { selectedConditions.contains($0.name) }.count
    }

    var body: some View {
        DisclosureGroup(isExpanded: $isExpanded) {
            VStack(spacing: 10) {
                ForEach(category.conditions) { condition in
                    ConditionSelectorRow(
                        condition: condition,
                        isSelected: selectedConditions.contains(condition.name),
                        selectedDetails: selectedDetails[condition.id] ?? []
                    ) {
                        onToggleCondition(condition)
                    } onToggleDetail: { detail in
                        onToggleDetail(condition, detail)
                    }
                }
            }
            .padding(.top, 10)
        } label: {
            ConditionCategoryHeader(category: category, selectedCount: selectedCount)
        }
        .tint(Color.tyfysBlue)
        .padding(.vertical, 6)
    }
}

struct ConditionCategoryHeader: View {
    let category: ClaimConditionCategory
    let selectedCount: Int

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: category.systemImage)
                .font(.headline)
                .foregroundStyle(Color.tyfysBlue)
                .frame(width: 38, height: 38)
                .background(Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
            VStack(alignment: .leading, spacing: 5) {
                HStack(alignment: .firstTextBaseline) {
                    Text(category.name)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Spacer(minLength: 8)
                    if selectedCount > 0 {
                        Text("\(selectedCount)")
                            .font(.caption.bold())
                            .foregroundStyle(.white)
                            .frame(minWidth: 22, minHeight: 22)
                            .background(Color.documentGold, in: Circle())
                    }
                }
                Text(category.cfrRange)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.tyfysBlue)
                Text(category.summary)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

struct ConditionSelectorRow: View {
    let condition: ClaimCondition
    let isSelected: Bool
    let selectedDetails: [String]
    let onToggleCondition: () -> Void
    let onToggleDetail: (ConditionDetailOption) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button(action: onToggleCondition) {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: condition.systemImage)
                        .font(.headline)
                        .foregroundStyle(isSelected ? .white : Color.tyfysBlue)
                        .frame(width: 36, height: 36)
                        .background(isSelected ? Color.tyfysBlue : Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
                    VStack(alignment: .leading, spacing: 5) {
                        Text(condition.name)
                            .font(.headline)
                            .foregroundStyle(.primary)
                        HStack(spacing: 6) {
                            MetadataCapsule(text: "DC \(condition.diagnosticCode)")
                            MetadataCapsule(text: condition.cfrSection)
                        }
                        Text(condition.dbq)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 10)
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .font(.title3)
                        .foregroundStyle(isSelected ? Color.documentGold : .secondary)
                }
            }
            .buttonStyle(.plain)

            if isSelected {
                VStack(alignment: .leading, spacing: 10) {
                    ConditionEvidenceSummary(condition: condition)

                    if !condition.detailOptions.isEmpty {
                        Text("Specific issue details")
                            .font(.caption.bold())
                            .foregroundStyle(Color.tyfysSlate)
                        VStack(spacing: 8) {
                            ForEach(condition.detailOptions) { detail in
                                ConditionDetailButton(
                                    detail: detail,
                                    isSelected: selectedDetails.contains(detail.label)
                                ) {
                                    onToggleDetail(detail)
                                }
                            }
                        }
                    }
                }
                .padding(.leading, 48)
            }
        }
        .padding(12)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}

struct ConditionEvidenceSummary: View {
    let condition: ClaimCondition

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Label(condition.specialist, systemImage: "person.text.rectangle")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text("Evidence: \(condition.commonEvidence.joined(separator: ", "))")
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            ForEach(condition.notes, id: \.self) { note in
                Label(note, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Color.documentGold)
            }
        }
    }
}

struct ConditionDetailButton: View {
    let detail: ConditionDetailOption
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? Color.documentGold : .secondary)
                    .font(.headline)
                VStack(alignment: .leading, spacing: 3) {
                    Text(detail.label)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(detail.detail)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
            }
            .padding(10)
            .background(isSelected ? Color.tyfysBlue.opacity(0.08) : Color(.tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.tyfysBlue.opacity(0.35) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

struct SelectedConditionSummaryRow: View {
    let condition: ClaimCondition
    let selectedDetails: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(condition.name)
                    .font(.headline)
                Spacer(minLength: 8)
                Text("DC \(condition.diagnosticCode)")
                    .font(.caption.bold())
                    .foregroundStyle(Color.tyfysBlue)
            }
            Text("\(condition.cfrSection) - \(condition.dbq)")
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            if selectedDetails.isEmpty {
                Text("No specific details selected yet.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                FlowPillList(items: selectedDetails)
            }
        }
        .padding(.vertical, 4)
    }
}

struct MetadataCapsule: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption2.bold())
            .foregroundStyle(Color.tyfysBlue)
            .padding(.horizontal, 7)
            .padding(.vertical, 4)
            .background(Color.tyfysBlue.opacity(0.10), in: Capsule())
            .lineLimit(1)
            .minimumScaleFactor(0.8)
    }
}

struct FlowPillList: View {
    let items: [String]

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 140), spacing: 6)], alignment: .leading, spacing: 6) {
            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.tyfysSlate)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 6)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.documentGold.opacity(0.16), in: Capsule())
            }
        }
    }
}

struct ToggleChipRow: View {
    let title: String
    let detail: String
    let systemImage: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: systemImage)
                    .font(.headline)
                    .foregroundStyle(isSelected ? .white : Color.tyfysBlue)
                    .frame(width: 38, height: 38)
                    .background(isSelected ? Color.tyfysBlue : Color.tyfysBlue.opacity(0.10), in: RoundedRectangle(cornerRadius: 8))
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text(detail)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? Color.documentGold : .secondary)
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
    }
}

struct MessageBubble: View {
    let message: SupportMessage

    private var isVeteran: Bool {
        message.sender == "You" || message.sender == "Veteran"
    }

    var body: some View {
        HStack {
            if isVeteran { Spacer(minLength: 32) }
            VStack(alignment: .leading, spacing: 4) {
                Text(message.sender)
                    .font(.caption.bold())
                    .foregroundStyle(isVeteran ? .white.opacity(0.82) : .secondary)
                Text(message.text)
                    .font(.subheadline)
                    .foregroundStyle(isVeteran ? .white : .primary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(12)
            .background(isVeteran ? Color.tyfysBlue : Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
            if !isVeteran { Spacer(minLength: 32) }
        }
        .listRowSeparator(.hidden)
    }
}
