import Foundation

struct CustomerSyncContact: Encodable {
    let name: String
    let email: String
    let phone: String
    let source: String
}

struct CustomerSyncRecord: Encodable {
    let id: String
    let title: String
    let originalFilename: String
    let category: String
    let importedAt: Date
}

struct CustomerWorkspaceSyncRequest: Encodable {
    let action: String
    let clientId: String
    let clientToken: String
    let threadId: String
    let threadToken: String
    let contact: CustomerSyncContact
    let source: String
    let profile: VeteranProfile
    let records: [CustomerSyncRecord]
    let appSummary: CustomerSupportAppSummary
}

struct CustomerWorkspaceSyncResponse: Decodable {
    let ok: Bool
    let clientId: String
    let clientToken: String
    let updatedAt: String
}

struct CustomerDocumentUploadResponse: Decodable {
    let ok: Bool
    let document: RemoteCustomerDocument
}

struct RemoteCustomerDocument: Decodable {
    let id: String
    let clientId: String
    let title: String
    let category: String
    let originalFilename: String
    let mimeType: String
    let sizeBytes: Int
    let createdAt: String
    let source: String?

    enum CodingKeys: String, CodingKey {
        case id, clientId, title, category, originalFilename, mimeType, sizeBytes, createdAt, source
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        clientId = try c.decodeIfPresent(String.self, forKey: .clientId) ?? ""
        title = try c.decodeIfPresent(String.self, forKey: .title) ?? ""
        category = try c.decodeIfPresent(String.self, forKey: .category) ?? ""
        originalFilename = try c.decodeIfPresent(String.self, forKey: .originalFilename) ?? "record.pdf"
        mimeType = try c.decodeIfPresent(String.self, forKey: .mimeType) ?? "application/octet-stream"
        sizeBytes = try c.decodeIfPresent(Int.self, forKey: .sizeBytes) ?? 0
        createdAt = try c.decodeIfPresent(String.self, forKey: .createdAt) ?? ""
        source = try c.decodeIfPresent(String.self, forKey: .source)
    }
}

enum CustomerSyncError: LocalizedError {
    case invalidURL
    case invalidResponse
    case server(String)
    case fileUnavailable

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            "The customer portal URL is not valid."
        case .invalidResponse:
            "The customer portal returned an unreadable response."
        case .server(let message):
            message
        case .fileUnavailable:
            "The selected dossier file could not be read."
        }
    }
}

enum CustomerSyncService {
    private static let endpointURLs = [
        URL(string: "https://tyfys.net/api/customer-crm.php"),
        URL(string: "https://customer.tyfys.net/api/customer-crm.php")
    ].compactMap { $0 }

    static func syncWorkspace(
        clientId: String,
        clientToken: String,
        conversation: SupportConversation,
        profile: VeteranProfile,
        records: [VaultItem],
        appSummary: CustomerSupportAppSummary
    ) async throws -> CustomerWorkspaceSyncResponse {
        let contact = CustomerSyncContact(
            name: conversation.contactName,
            email: conversation.contactEmail,
            phone: conversation.contactPhone,
            source: "ios-va-doc-finder"
        )
        let request = CustomerWorkspaceSyncRequest(
            action: "sync_workspace",
            clientId: clientId,
            clientToken: clientToken,
            threadId: conversation.threadId,
            threadToken: conversation.threadToken,
            contact: contact,
            source: "ios-va-doc-finder",
            // The bearer token/id are sent once at the top level for auth;
            // don't also embed them in the profile the server persists to
            // profile_json (that would store a live credential at rest).
            profile: profile.sanitizedForSync,
            records: records.map {
                CustomerSyncRecord(
                    id: $0.id.uuidString,
                    title: $0.title,
                    originalFilename: $0.originalFilename,
                    category: $0.category.rawValue,
                    importedAt: $0.importedAt
                )
            },
            appSummary: appSummary
        )

        let body = try JSONEncoder().encode(request)
        return try await performAcrossEndpoints { endpoint in
            var request = URLRequest(url: endpoint)
            request.httpMethod = "POST"
            request.timeoutInterval = 25
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.httpBody = body
            return request
        }
    }

    static func uploadDocument(
        clientId: String,
        clientToken: String,
        item: VaultItem,
        fileURL: URL
    ) async throws -> CustomerDocumentUploadResponse {
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            throw CustomerSyncError.fileUnavailable
        }

        let fileData = try Data(contentsOf: fileURL)
        let boundary = "Boundary-\(UUID().uuidString)"
        let metadata: [String: String] = [
            "title": item.title,
            "category": item.category.rawValue,
            "source": "ios-va-doc-finder"
        ]
        let metadataData = try JSONEncoder().encode(metadata)
        var body = Data()
        appendFormField(name: "clientToken", value: clientToken, boundary: boundary, to: &body)
        appendFormField(name: "metadata", data: metadataData, boundary: boundary, contentType: "application/json", to: &body)
        appendFileField(
            name: "document",
            filename: item.originalFilename,
            data: fileData,
            mimeType: mimeType(for: item.originalFilename),
            boundary: boundary,
            to: &body
        )
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        return try await performAcrossEndpoints { endpoint in
            guard var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false) else {
                throw CustomerSyncError.invalidURL
            }
            components.queryItems = [
                URLQueryItem(name: "resource", value: "documents"),
                URLQueryItem(name: "clientId", value: clientId)
            ]
            guard let url = components.url else { throw CustomerSyncError.invalidURL }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.timeoutInterval = 40
            request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.httpBody = body
            return request
        }
    }

    /// Records generated/signed form metadata in the CRM (action: forms_generate).
    static func recordGeneratedForm(
        clientId: String,
        clientToken: String,
        formNumber: String,
        revisionDate: String,
        sourceURL: String,
        status: String
    ) async throws {
        struct GeneratedFormRequest: Encodable {
            let action = "forms_generate"
            let clientId: String
            let clientToken: String
            let formNumber: String
            let revisionDate: String
            let sourceURL: String
            let status: String
            let source = "ios-va-doc-finder"
        }
        struct GeneratedFormResponse: Decodable {
            let ok: Bool
        }
        let body = try JSONEncoder().encode(GeneratedFormRequest(
            clientId: clientId,
            clientToken: clientToken,
            formNumber: formNumber,
            revisionDate: revisionDate,
            sourceURL: sourceURL,
            status: status
        ))
        let _: GeneratedFormResponse = try await performAcrossEndpoints { endpoint in
            var request = URLRequest(url: endpoint)
            request.httpMethod = "POST"
            request.timeoutInterval = 25
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.httpBody = body
            return request
        }
    }

    /// Lists documents staff shared to this client's portal (resource: documents_list).
    static func fetchPortalDocuments(clientId: String, clientToken: String) async throws -> [RemoteCustomerDocument] {
        struct DocumentListResponse: Decodable {
            let ok: Bool
            let documents: [RemoteCustomerDocument]
        }
        let response: DocumentListResponse = try await performAcrossEndpoints { endpoint in
            guard var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false) else {
                throw CustomerSyncError.invalidURL
            }
            components.queryItems = [
                URLQueryItem(name: "resource", value: "documents_list"),
                URLQueryItem(name: "clientId", value: clientId)
            ]
            guard let url = components.url else { throw CustomerSyncError.invalidURL }
            var request = URLRequest(url: url)
            request.timeoutInterval = 25
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            // Send the token in a header, not the query string, so it never
            // lands in the shared host's request access logs.
            request.setValue(clientToken, forHTTPHeaderField: "X-Client-Token")
            return request
        }
        return response.documents
    }

    /// Downloads one portal document to a temporary file and returns its URL.
    static func downloadPortalDocument(
        clientId: String,
        clientToken: String,
        document: RemoteCustomerDocument
    ) async throws -> URL {
        var lastError: Error?
        for endpoint in endpointURLs {
            guard var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false) else { continue }
            components.queryItems = [
                URLQueryItem(name: "resource", value: "document_download"),
                URLQueryItem(name: "clientId", value: clientId),
                URLQueryItem(name: "documentId", value: document.id)
            ]
            guard let url = components.url else { continue }
            do {
                var request = URLRequest(url: url)
                request.timeoutInterval = 60
                request.setValue(clientToken, forHTTPHeaderField: "X-Client-Token")
                let (tempURL, response) = try await URLSession.shared.download(for: request)
                guard let httpResponse = response as? HTTPURLResponse,
                      (200..<300).contains(httpResponse.statusCode) else {
                    throw CustomerSyncError.invalidResponse
                }
                // Give the temp file its real name so vault import keeps it.
                let named = FileManager.default.temporaryDirectory
                    .appendingPathComponent("portal-\(document.id)-\(document.originalFilename)")
                try? FileManager.default.removeItem(at: named)
                try FileManager.default.moveItem(at: tempURL, to: named)
                return named
            } catch {
                lastError = error
                continue
            }
        }
        throw lastError ?? CustomerSyncError.invalidURL
    }

    private static func performAcrossEndpoints<Response: Decodable>(
        makeRequest: (URL) throws -> URLRequest
    ) async throws -> Response {
        var lastError: Error?
        for endpoint in endpointURLs {
            do {
                return try await perform(try makeRequest(endpoint), as: Response.self)
            } catch {
                lastError = error
                if error is URLError {
                    continue
                }
                if case CustomerSyncError.invalidResponse = error {
                    continue
                }
                if case CustomerSyncError.server(let message) = error,
                   message.contains("HTTP 404") || message.contains("HTTP 500") || message.contains("HTTP 503") {
                    continue
                }
                throw error
            }
        }
        throw lastError ?? CustomerSyncError.invalidURL
    }

    private static func perform<Response: Decodable>(_ request: URLRequest, as type: Response.Type) async throws -> Response {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw CustomerSyncError.invalidResponse
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            if let payload = try? JSONDecoder().decode(CustomerPortalErrorResponse.self, from: data),
               !payload.error.isEmpty {
                throw CustomerSyncError.server(payload.error)
            }
            throw CustomerSyncError.server("Customer portal returned HTTP \(httpResponse.statusCode).")
        }
        do {
            return try JSONDecoder().decode(type, from: data)
        } catch {
            throw CustomerSyncError.invalidResponse
        }
    }

    private static func appendFormField(name: String, value: String, boundary: String, to body: inout Data) {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(value)\r\n".data(using: .utf8)!)
    }

    private static func appendFormField(name: String, data: Data, boundary: String, contentType: String, to body: inout Data) {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(contentType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)
    }

    private static func appendFileField(
        name: String,
        filename: String,
        data: Data,
        mimeType: String,
        boundary: String,
        to body: inout Data
    ) {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)
    }

    private static func mimeType(for filename: String) -> String {
        switch filename.lowercased().split(separator: ".").last {
        case "pdf":
            "application/pdf"
        case "png":
            "image/png"
        case "jpg", "jpeg":
            "image/jpeg"
        case "txt":
            "text/plain"
        default:
            "application/octet-stream"
        }
    }
}

private struct CustomerPortalErrorResponse: Decodable {
    let error: String
}
