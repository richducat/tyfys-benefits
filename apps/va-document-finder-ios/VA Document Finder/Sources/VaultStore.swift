import Foundation

@MainActor
final class VaultStore: ObservableObject {
    @Published private(set) var items: [VaultItem] = []
    @Published var lastImportError: String?

    private let fileManager = FileManager.default
    private let metadataURL: URL
    private let documentsURL: URL

    init() {
        let support = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Digital Sync", isDirectory: true)
            .appendingPathComponent("VA Document Finder", isDirectory: true)
        let legacySupport = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("TYFYS", isDirectory: true)
        documentsURL = support.appendingPathComponent("Imported Documents", isDirectory: true)
        metadataURL = support.appendingPathComponent("vault.json")
        migrateLegacyVaultIfNeeded(from: legacySupport, to: support)
        load()
    }

    func importFiles(from urls: [URL], category: DocumentCategory = .evidence) {
        do {
            try ensureFolders()
        } catch {
            lastImportError = "The dossier folder could not be created. \(error.localizedDescription)"
            return
        }

        // Import each file independently so one unreadable file cannot abort
        // the batch or leave already-copied files without saved metadata.
        var failedImports: [String] = []
        for url in urls {
            let hasAccess = url.startAccessingSecurityScopedResource()
            defer {
                if hasAccess { url.stopAccessingSecurityScopedResource() }
            }

            do {
                let storedName = "\(UUID().uuidString)-\(url.lastPathComponent)"
                let destination = documentsURL.appendingPathComponent(storedName)

                if fileManager.fileExists(atPath: destination.path) {
                    try fileManager.removeItem(at: destination)
                }

                try fileManager.copyItem(at: url, to: destination)
                items.insert(
                    VaultItem(
                        id: UUID(),
                        title: url.deletingPathExtension().lastPathComponent,
                        originalFilename: url.lastPathComponent,
                        storedFilename: storedName,
                        importedAt: Date(),
                        category: category
                    ),
                    at: 0
                )
            } catch {
                failedImports.append(url.lastPathComponent)
            }
        }

        do {
            try save()
        } catch {
            lastImportError = "Imported files could not be recorded. \(error.localizedDescription)"
            return
        }

        if !failedImports.isEmpty {
            lastImportError = "Could not import: \(failedImports.joined(separator: ", ")). Any other selected files were imported."
        }
    }

    func delete(_ item: VaultItem) {
        if let index = items.firstIndex(of: item) {
            items.remove(at: index)
        }

        let url = fileURL(for: item)
        if fileManager.fileExists(atPath: url.path) {
            try? fileManager.removeItem(at: url)
        }

        try? save()
    }

    func fileURL(for item: VaultItem) -> URL {
        documentsURL.appendingPathComponent(item.storedFilename)
    }

    private func load() {
        do {
            try ensureFolders()
            guard fileManager.fileExists(atPath: metadataURL.path) else {
                items = []
                return
            }
            let data = try Data(contentsOf: metadataURL)
            do {
                items = try JSONDecoder().decode([VaultItem].self, from: data)
            } catch {
                // One corrupt record must not hide the whole vault (the next
                // save would then erase it permanently). Keep a backup of the
                // raw file and salvage every record that still decodes.
                let backupURL = metadataURL.deletingPathExtension().appendingPathExtension("recovery.json")
                try? data.write(to: backupURL, options: [.atomic])

                let decoder = JSONDecoder()
                if let rawRecords = try? JSONSerialization.jsonObject(with: data) as? [Any] {
                    items = rawRecords.compactMap { record in
                        guard let recordData = try? JSONSerialization.data(withJSONObject: record) else { return nil }
                        return try? decoder.decode(VaultItem.self, from: recordData)
                    }
                    if items.count < rawRecords.count {
                        lastImportError = "Some saved vault records could not be read and were skipped. A backup was kept as vault.recovery.json."
                    }
                } else {
                    items = []
                    lastImportError = "Saved vault metadata could not be loaded. A backup was kept as vault.recovery.json."
                }
            }
        } catch {
            items = []
            lastImportError = "Saved vault metadata could not be loaded."
        }
    }

    private func save() throws {
        try ensureFolders()
        let data = try JSONEncoder().encode(items)
        try data.write(to: metadataURL, options: [.atomic])
    }

    private func ensureFolders() throws {
        try fileManager.createDirectory(at: documentsURL, withIntermediateDirectories: true)
    }

    private func migrateLegacyVaultIfNeeded(from legacySupport: URL, to support: URL) {
        guard fileManager.fileExists(atPath: legacySupport.path),
              !fileManager.fileExists(atPath: support.path) else {
            return
        }

        try? fileManager.createDirectory(at: support.deletingLastPathComponent(), withIntermediateDirectories: true)
        try? fileManager.moveItem(at: legacySupport, to: support)
    }
}
