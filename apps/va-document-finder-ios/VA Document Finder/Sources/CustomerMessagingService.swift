import Foundation

struct CustomerSupportAppSummary: Encodable {
    let intakeSubmitted: Bool
    let completionPercent: Int
    let selectedConditions: [String]
    let selectedDocuments: [String]
    let recordsSaved: Int?
    let modeledRating: Int
}

struct CustomerMessageResponse: Decodable {
    let ok: Bool
    let threadId: String
    let threadToken: String
    let status: String
    let messages: [RemoteSupportMessage]
}

struct RemoteSupportMessage: Decodable {
    let id: String
    let sender: String
    let body: String
    let at: String

    var date: Date {
        let fractionalFormatter = ISO8601DateFormatter()
        fractionalFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let parsed = fractionalFormatter.date(from: at) {
            return parsed
        }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: at) ?? Date()
    }
}

private struct SendCustomerMessageRequest: Encodable {
    let threadId: String
    let threadToken: String
    let contactName: String
    let contactEmail: String
    let contactPhone: String
    let message: String
    let source: String
    let appSummary: CustomerSupportAppSummary
}

private struct FetchCustomerThreadResponse: Decodable {
    let ok: Bool
    let threadId: String
    let threadToken: String?
    let status: String
    let messages: [RemoteSupportMessage]
}

enum CustomerMessagingError: LocalizedError {
    case invalidURL
    case invalidResponse
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            "The support service URL is not valid."
        case .invalidResponse:
            "The support service returned an unreadable response."
        case .server(let message):
            message
        }
    }
}

enum CustomerMessagingService {
    private static let endpointURLs = [
        URL(string: "https://tyfys.net/api/customer-messages.php"),
        URL(string: "https://customer.tyfys.net/api/customer-messages.php")
    ].compactMap { $0 }

    static func sendMessage(
        text: String,
        conversation: SupportConversation,
        appSummary: CustomerSupportAppSummary
    ) async throws -> CustomerMessageResponse {
        let body = try JSONEncoder().encode(SendCustomerMessageRequest(
            threadId: conversation.threadId,
            threadToken: conversation.threadToken,
            contactName: conversation.contactName,
            contactEmail: conversation.contactEmail,
            contactPhone: conversation.contactPhone,
            message: text,
            source: "ios-va-doc-finder",
            appSummary: appSummary
        ))

        return try await performAcrossEndpoints { url in
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.timeoutInterval = 20
            request.httpBody = body
            return request
        }
    }

    static func fetchThread(threadId: String, threadToken: String) async throws -> CustomerMessageResponse {
        let response: FetchCustomerThreadResponse = try await performAcrossEndpoints { endpoint in
            guard var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false) else {
                throw CustomerMessagingError.invalidURL
            }

            components.queryItems = [
                URLQueryItem(name: "threadId", value: threadId),
                URLQueryItem(name: "threadToken", value: threadToken)
            ]

            guard let url = components.url else { throw CustomerMessagingError.invalidURL }

            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.timeoutInterval = 20
            return request
        }

        return CustomerMessageResponse(
            ok: response.ok,
            threadId: response.threadId,
            threadToken: response.threadToken ?? threadToken,
            status: response.status,
            messages: response.messages
        )
    }

    private static func performAcrossEndpoints<Response: Decodable>(
        makeRequest: (URL) throws -> URLRequest
    ) async throws -> Response {
        guard !endpointURLs.isEmpty else { throw CustomerMessagingError.invalidURL }

        var lastError: Error?
        for endpointURL in endpointURLs {
            do {
                return try await perform(try makeRequest(endpointURL), as: Response.self)
            } catch {
                lastError = error
                if shouldTryNextEndpoint(after: error) {
                    continue
                }
                throw error
            }
        }

        throw lastError ?? CustomerMessagingError.invalidURL
    }

    private static func shouldTryNextEndpoint(after error: Error) -> Bool {
        if error is URLError {
            return true
        }

        if case CustomerMessagingError.invalidResponse = error {
            return true
        }

        if case CustomerMessagingError.server(let message) = error,
           message.contains("HTTP 404") || message.contains("HTTP 500") {
            return true
        }

        return false
    }

    private static func perform<Response: Decodable>(_ request: URLRequest, as type: Response.Type) async throws -> Response {
        let (data, urlResponse) = try await URLSession.shared.data(for: request)
        guard let httpResponse = urlResponse as? HTTPURLResponse else {
            throw CustomerMessagingError.invalidResponse
        }

        if (200..<300).contains(httpResponse.statusCode) {
            do {
                return try JSONDecoder().decode(type, from: data)
            } catch {
                throw CustomerMessagingError.invalidResponse
            }
        }

        if let payload = try? JSONDecoder().decode(CustomerMessageErrorResponse.self, from: data),
           !payload.error.isEmpty {
            throw CustomerMessagingError.server(payload.error)
        }

        throw CustomerMessagingError.server("Support service returned HTTP \(httpResponse.statusCode).")
    }
}

private struct CustomerMessageErrorResponse: Decodable {
    let error: String
}
