import SwiftUI

struct ContentView: View {
    @StateObject private var appState = TYFYSAppState()
    @State private var selectedTab = RootTab.initial
    @AppStorage("digitalSync.vaDocFinder.onboardingCompleted") private var onboardingCompleted = false

    private var shouldShowOnboarding: Bool {
        !onboardingCompleted
    }

    var body: some View {
        Group {
            if shouldShowOnboarding {
                OnboardingView { tab in
                    onboardingCompleted = true
                    selectedTab = tab
                }
            } else {
                TabView(selection: $selectedTab) {
                    ClaimHomeView { tab in
                        selectedTab = tab
                    }
                    .tabItem {
                        Label("Home", systemImage: "house.fill")
                    }
                    .tag(RootTab.home)

                    IntakeView(onFinish: {
                        selectedTab = .dossier
                    })
                    .tabItem {
                        Label("Intake", systemImage: "list.clipboard.fill")
                    }
                    .tag(RootTab.intake)

                    DossierView()
                        .tabItem {
                            Label("Dossier", systemImage: "folder.fill")
                        }
                        .tag(RootTab.dossier)

                    RatingCalculatorView()
                        .tabItem {
                            Label("Calc", systemImage: "function")
                        }
                        .tag(RootTab.calculator)

                    AccountView {
                        onboardingCompleted = false
                    }
                    .tabItem {
                        Label("Tools", systemImage: "square.grid.2x2.fill")
                    }
                    .tag(RootTab.tools)
                }
                .tint(.tyfysBlue)
            }
        }
        .environmentObject(appState)
    }
}

enum RootTab: Hashable {
    case home
    case intake
    case dossier
    case calculator
    case tools

    static var initial: RootTab {
        .home
    }
}

struct OnboardingView: View {
    let onComplete: (RootTab) -> Void
    @EnvironmentObject private var appState: TYFYSAppState
    @State private var showLoginSheet = false

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                Spacer(minLength: 40)
                
                // App Logo & Brand Header
                VStack(spacing: 16) {
                    Image(systemName: "shield.checkered")
                        .font(.system(size: 68, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 120, height: 120)
                        .background(
                            LinearGradient(
                                colors: [Color.tyfysBlue, Color.documentNavy],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            in: RoundedRectangle(cornerRadius: 24)
                        )
                        .shadow(color: Color.tyfysBlue.opacity(0.3), radius: 15, x: 0, y: 10)

                    VStack(spacing: 4) {
                        Text("VA Doc Finder")
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .foregroundStyle(Color.tyfysSlate)
                        Text("BY DIGITAL SYNC")
                            .font(.caption.weight(.bold))
                            .textCase(.uppercase)
                            .foregroundStyle(Color.documentGold)
                            .tracking(2)
                    }
                }
                .padding(.top, 20)

                Text("Your private native workspace to organize service records, medical evidence, and model combined VA claims.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                // The 3 Core Actions styled as premium, harmonious cards
                VStack(spacing: 18) {
                    LandingActionCard(
                        title: "Start Claim",
                        subtitle: "Guided medical-first intake to identify CFR disability paths and build your custom records checklist.",
                        systemImage: "list.clipboard.fill",
                        color: Color.tyfysBlue
                    ) {
                        onComplete(.intake)
                    }

                    LandingActionCard(
                        title: "Claim Research",
                        subtitle: "Search official VA.gov forms catalog and generate review-ready prefilled PDF drafts from local data.",
                        systemImage: "doc.text.magnifyingglass",
                        color: Color.documentGold
                    ) {
                        onComplete(.tools)
                    }

                    LandingActionCard(
                        title: "Connect to Digital Sync",
                        subtitle: "Add your contact details to link this device to the Digital Sync customer portal for record checklists and support.",
                        systemImage: "person.badge.key.fill",
                        color: Color.documentNavy
                    ) {
                        showLoginSheet = true
                    }
                }
                .padding(.horizontal, 20)

                Spacer(minLength: 40)
            }
        }
        .background(Color(.systemGroupedBackground))
        .sheet(isPresented: $showLoginSheet) {
            MemberLoginSheet {
                onComplete(.home)
            }
        }
    }
}

struct LandingActionCard: View {
    let title: String
    let subtitle: String
    let systemImage: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: systemImage)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 52, height: 52)
                    .background(color, in: RoundedRectangle(cornerRadius: 12))

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(title)
                            .font(.headline.weight(.bold))
                            .foregroundStyle(Color.tyfysSlate)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.secondary)
                    }
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
            .shadow(color: Color.black.opacity(0.03), radius: 8, x: 0, y: 4)
        }
        .buttonStyle(.plain)
    }
}

struct MemberLoginSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appState: TYFYSAppState
    let onLoginSuccess: () -> Void

    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var shareWorkspace = false
    @State private var showValidationError = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Connect Workspace")
                            .font(.title2.bold())
                            .foregroundStyle(Color.tyfysSlate)
                        Text("Add your contact details so Digital Sync can match this device to your customer profile and reply to support messages. No password is required — this is not a sign-in.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                    .padding(.bottom, 12)
                }

                Section("Contact Details") {
                    HStack {
                        Image(systemName: "person.fill")
                            .foregroundStyle(.secondary)
                            .frame(width: 24)
                        TextField("Full Name", text: $name)
                            .textInputAutocapitalization(.words)
                    }
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundStyle(.secondary)
                            .frame(width: 24)
                        TextField("Email Address", text: $email)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }
                    HStack {
                        Image(systemName: "phone.fill")
                            .foregroundStyle(.secondary)
                            .frame(width: 24)
                        TextField("Phone Number", text: $phone)
                            .keyboardType(.phonePad)
                    }
                }

                Section {
                    Toggle(isOn: $shareWorkspace) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Share workspace with Digital Sync")
                                .font(.headline)
                            Text("Optional. Allows syncing your intake answers, selected conditions, and record checklist to the staff portal. You can change this anytime in the Dossier tab.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                if showValidationError {
                    Section {
                        Label("Please provide a valid Name and Email to connect.", systemImage: "exclamationmark.triangle.fill")
                            .font(.subheadline)
                            .foregroundStyle(.red)
                    }
                }

                Section {
                    Button {
                        validateAndConnect()
                    } label: {
                        HStack {
                            Spacer()
                            Label("Connect Member Workspace", systemImage: "arrow.triangle.2.circlepath")
                                .font(.headline)
                            Spacer()
                        }
                        .frame(height: 48)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.tyfysBlue)
                    .disabled(name.isEmpty || email.isEmpty)
                }
            }
            .navigationTitle("Connect Workspace")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                shareWorkspace = appState.profile.customerSyncConsent
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func validateAndConnect() {
        guard !name.isEmpty, !email.isEmpty else {
            showValidationError = true
            return
        }

        // Update Support Contact info which establishes local identity
        appState.updateSupportContact(name: name)
        appState.updateSupportContact(email: email)
        appState.updateSupportContact(phone: phone)

        // Portal sharing follows the toggle exactly: connecting with it off
        // revokes any earlier consent, and it is never granted as a side
        // effect of connecting.
        appState.profile.customerSyncConsent = shareWorkspace

        dismiss()
        onLoginSuccess()
    }
}

extension Color {
    static let documentNavy = Color(red: 0.08, green: 0.18, blue: 0.32)
    static let documentGold = Color(red: 0.74, green: 0.55, blue: 0.22)
    static let documentInk = Color(red: 0.08, green: 0.10, blue: 0.12)
    static let documentMist = Color(red: 0.95, green: 0.97, blue: 0.98)
    static let tyfysBlue = Color(red: 0.10, green: 0.35, blue: 0.78)
    static let tyfysSlate = Color(red: 0.09, green: 0.11, blue: 0.16)
    static let tyfysSurface = Color(red: 0.96, green: 0.98, blue: 1.00)
}

struct HeaderBand: View {
    let title: String
    let subtitle: String
    let systemImage: String
    var eyebrow: String = "VA Doc Finder by Digital Sync"

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 12) {
                Image(systemName: systemImage)
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.documentGold, in: RoundedRectangle(cornerRadius: 8))

                VStack(alignment: .leading, spacing: 2) {
                    Text(eyebrow)
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.82))
                    Text("Veteran claim workspace")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.white.opacity(0.68))
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.82)
                Text(subtitle)
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.78))
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(
                    LinearGradient(
                        colors: [.tyfysSlate, .tyfysBlue],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
    }
}

struct MetricTile: View {
    let value: String
    let label: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: systemImage)
                .font(.title3.weight(.semibold))
                .foregroundStyle(Color.documentGold)
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(Color.documentInk)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text(label)
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, minHeight: 116, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}

struct EmptyStateView: View {
    let systemImage: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: systemImage)
                .font(.system(size: 38, weight: .semibold))
                .foregroundStyle(Color.documentGold)
                .frame(width: 72, height: 72)
                .background(Color.documentGold.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
            Text(title)
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    ContentView()
        .environmentObject(VaultStore())
}
