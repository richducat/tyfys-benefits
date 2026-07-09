import SwiftUI

struct SettingsView: View {
    var body: some View {
        // Pushed from the Tools tab; no local NavigationStack.
        List {
            Section {
                HeaderBand(
                    title: "VA Doc Finder",
                    subtitle: "A native Digital Sync workspace for intake, records, rating math, and claim-related organization.",
                    systemImage: "shield.checkered"
                )
                .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
            }

            Section("Privacy posture") {
                Label("No password or account sign-up is required.", systemImage: "person.crop.circle.badge.checkmark")
                Label("Imported documents are copied into local app storage.", systemImage: "iphone.gen3")
                Label("Intake details and records are uploaded to the Digital Sync customer portal only when you turn on sharing and choose to sync or upload.", systemImage: "hand.raised")
                Label("The app does not use ad tracking.", systemImage: "eye.slash")
            }

            Section("Scope") {
                Text("VA Doc Finder by Digital Sync is not affiliated with the Department of Veterans Affairs. It does not submit claims, provide legal representation, provide medical advice, or determine eligibility for benefits.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Section("Digital Sync") {
                Link(destination: URL(string: "https://tyfys.net/privacy.html")!) {
                    Label("Privacy Policy", systemImage: "lock.doc")
                }
                Link(destination: URL(string: "https://tyfys.net/app-support.html")!) {
                    Label("Support", systemImage: "questionmark.circle")
                }
                Link(destination: URL(string: "https://tyfys.net/account-deletion.html")!) {
                    Label("Data & Account Deletion", systemImage: "person.crop.circle.badge.xmark")
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Info")
    }
}
