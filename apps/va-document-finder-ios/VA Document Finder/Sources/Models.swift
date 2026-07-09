import Foundation
import SwiftUI

enum DocumentCategory: String, CaseIterable, Identifiable, Codable {
    case identity = "Identity"
    case service = "Service"
    case medical = "Medical"
    case vaRecords = "VA Records"
    case evidence = "Evidence"
    case forms = "Forms"
    case dependents = "Dependents"

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .identity: "person.text.rectangle"
        case .service: "shield.lefthalf.filled"
        case .medical: "cross.case"
        case .vaRecords: "building.columns"
        case .evidence: "doc.text.magnifyingglass"
        case .forms: "square.and.pencil"
        case .dependents: "person.2"
        }
    }
}

enum ClaimScenario: String, CaseIterable, Identifiable, Codable {
    case firstClaim = "First claim"
    case increase = "Increase"
    case supplemental = "Supplemental"
    case secondary = "Secondary"
    case pactAct = "PACT Act"
    case appeal = "Appeal"

    var id: String { rawValue }
}

struct DocumentNeed: Identifiable, Hashable, Codable {
    let id: String
    let title: String
    let category: DocumentCategory
    let scenarios: [ClaimScenario]
    let summary: String
    let whereToFind: [String]
    let checklist: [String]
    let tips: [String]
}

struct PacketTask: Identifiable, Hashable {
    let id: String
    let title: String
    let detail: String
    let category: DocumentCategory
}

struct VaultItem: Identifiable, Codable, Hashable {
    let id: UUID
    var title: String
    var originalFilename: String
    var storedFilename: String
    var importedAt: Date
    var category: DocumentCategory

    var displayDate: String {
        importedAt.formatted(date: .abbreviated, time: .omitted)
    }
}
