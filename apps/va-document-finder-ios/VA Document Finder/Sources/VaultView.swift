import SwiftUI
import UniformTypeIdentifiers

struct VaultView: View {
    @EnvironmentObject private var vaultStore: VaultStore
    @State private var isImporterPresented = false
    @State private var selectedCategory: DocumentCategory = .evidence

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HeaderBand(
                        title: "Keep a local working set.",
                        subtitle: "Import selected files into an on-device vault. Nothing is uploaded by this app.",
                        systemImage: "folder.badge.plus"
                    )
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section {
                    Picker("Default category", selection: $selectedCategory) {
                        ForEach(DocumentCategory.allCases) { category in
                            Label(category.rawValue, systemImage: category.symbol)
                                .tag(category)
                        }
                    }

                    Button {
                        isImporterPresented = true
                    } label: {
                        Label("Import Documents", systemImage: "square.and.arrow.down")
                            .font(.headline)
                    }
                }

                Section {
                    HStack(spacing: 10) {
                        MetricTile(value: "\(vaultStore.items.count)", label: "Imported files", systemImage: "doc.fill")
                        MetricTile(value: "\(Set(vaultStore.items.map(\.category)).count)", label: "Categories used", systemImage: "tray.full")
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section("Local vault") {
                    if vaultStore.items.isEmpty {
                        EmptyStateView(
                            systemImage: "folder",
                            title: "No imported documents",
                            message: "Add PDFs, images, or records from Files to create a local working set."
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
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Vault")
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
        }
    }
}

struct VaultItemRow: View {
    let item: VaultItem
    let fileURL: URL

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: item.category.symbol)
                .font(.headline)
                .foregroundStyle(Color.documentNavy)
                .frame(width: 38, height: 38)
                .background(Color.documentNavy.opacity(0.09), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 5) {
                Text(item.title)
                    .font(.headline)
                    .lineLimit(1)
                Text(item.originalFilename)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                Text("\(item.category.rawValue) · \(item.displayDate)")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Color.documentGold)
            }

            Spacer()

            if FileManager.default.fileExists(atPath: fileURL.path) {
                ShareLink(item: fileURL) {
                    Image(systemName: "square.and.arrow.up")
                        .font(.headline)
                }
                .buttonStyle(.borderless)
                .accessibilityLabel("Share \(item.title)")
            } else {
                Image(systemName: "exclamationmark.triangle")
                    .font(.headline)
                    .foregroundStyle(Color.documentGold)
                    .accessibilityLabel("File missing for \(item.title)")
            }
        }
        .padding(.vertical, 6)
    }
}
