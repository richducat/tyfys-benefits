import SwiftUI

@main
struct VA_Document_FinderApp: App {
    @StateObject private var vaultStore = VaultStore()
    @StateObject private var signatureStore = SignatureStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(vaultStore)
                .environmentObject(signatureStore)
        }
    }
}
