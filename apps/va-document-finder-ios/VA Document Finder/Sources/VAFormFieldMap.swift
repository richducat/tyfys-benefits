import Foundation

/// Data available on-device for prefilling VA form drafts.
/// The app never captures SSN, date of birth, VA file number, or mailing
/// address, so those PDF fields are always left blank.
struct VAFormFillData {
    let firstName: String
    let middleInitial: String
    let lastName: String
    let email: String
    let phoneDigits: String
    let conditions: [String]
    let statement: String

    init(contactName: String, email: String, phone: String, conditions: [String], statement: String) {
        let parts = contactName.split(separator: " ").map(String.init)
        firstName = parts.first ?? ""
        lastName = parts.count > 1 ? (parts.last ?? "") : ""
        middleInitial = parts.count > 2 ? String(parts[1].prefix(1)) : ""
        self.email = email.trimmingCharacters(in: .whitespacesAndNewlines)

        var digits = phone.filter(\.isNumber)
        if digits.count == 11, digits.hasPrefix("1") {
            digits = String(digits.dropFirst())
        }
        phoneDigits = digits
        self.conditions = conditions
        self.statement = statement
    }

    // US phone parts are only offered when a complete 10-digit number exists,
    // so partial numbers never scatter garbage across split phone boxes.
    var phoneArea: String { phoneDigits.count == 10 ? String(phoneDigits.prefix(3)) : "" }
    var phoneMiddleThree: String { phoneDigits.count == 10 ? String(phoneDigits.dropFirst(3).prefix(3)) : "" }
    var phoneLastFour: String { phoneDigits.count == 10 ? String(phoneDigits.suffix(4)) : "" }
    var conditionsJoined: String { conditions.joined(separator: ", ") }
}

enum VAFormFillTarget {
    case firstName
    case middleInitial
    case lastName
    case email
    case phoneArea
    case phoneMiddleThree
    case phoneLastFour
    case condition(Int)
    case conditionsJoined
    case statement
}

/// Verified PDF field maps for the official VA form catalog.
///
/// Every key below was verified against the official VBA PDF downloaded from
/// va.gov: field names, indexes, and the printed label next to each box were
/// extracted from the PDFs (2026-07-04 revisions). Keys are the lowercased
/// trailing path components of the XFA/AcroForm fully qualified field name,
/// e.g. "veteransfirstname[0]" or "row2[0].specificissue2[0]". A form with a
/// local map fills ONLY its mapped fields — SSN, DOB, claimant, dependent,
/// witness, and signature fields are intentionally unmapped and stay blank.
enum VAFormFieldMap {
    private typealias Entry = (key: String, target: VAFormFillTarget)

    private static let formMaps: [String: [Entry]] = [
        "21-526EZ": [
            ("veteran_service_member_first_name[0]", .firstName),
            ("veteran_service_member_middle_initial[0]", .middleInitial),
            ("veteran_service_member_last_name[0]", .lastName),
            ("email_address_optional[0]", .email),
            ("daytime_phone_number_area_code[0]", .phoneArea),
            // Page_10 prefix required: the same telephone component names are
            // reused by the section 14F point-of-contact block on #subform[9].
            ("page_10[0].telephone_middle_three_numbers[0]", .phoneMiddleThree),
            ("page_10[0].telephone_last_four_numbers[0]", .phoneLastFour),
        ] + (0..<15).map { ("currentdisability[\($0)]", VAFormFillTarget.condition($0)) },
        "20-0995": [
            ("veteransfirstname[0]", .firstName),
            ("veteransmiddleinitial1[0]", .middleInitial),
            ("veteranslastname[0]", .lastName),
            ("email[0]", .email),
            ("veteransphoneareacode[0]", .phoneArea),
            ("veteransphonefirstthreenumbers[0]", .phoneMiddleThree),
            ("veteransphonelastfournumbers[0]", .phoneLastFour),
            // Issue table rows share a field name; the Row parent disambiguates.
            ("row1[0].specificissue1[0]", .condition(0)),
            ("row2[0].specificissue2[0]", .condition(1)),
            ("row3[0].specificissue2[0]", .condition(2)),
            ("row4[0].specificissue2[0]", .condition(3)),
            ("row5[0].specificissue2[0]", .condition(4)),
            ("row6[0].specificissue2[0]", .condition(5)),
            ("row7[0].specificissue2[0]", .condition(6)),
        ],
        "20-0996": [
            ("veterans_first_name[0]", .firstName),
            ("veterans_middle_initial1[0]", .middleInitial),
            ("veterans_last_name[0]", .lastName),
            ("telephone_number_area_code[0]", .phoneArea),
            ("telephone_middle_three_numbers[0]", .phoneMiddleThree),
            ("telephone_last_four_numbers[0]", .phoneLastFour),
            // Section IV rows in on-page visual order (verified by widget
            // coordinates): indexes are not laid out sequentially in the PDF.
            ("specificissue1[2]", .condition(0)),
            ("specificissue1[3]", .condition(1)),
            ("specificissue1[1]", .condition(2)),
            ("specificissue1[0]", .condition(3)),
            ("specificissue3[0]", .condition(4)),
            ("specificissue4[0]", .condition(5)),
            ("specificissue5[0]", .condition(6)),
        ],
        "21-0966": [
            ("veteransfirstname[0]", .firstName),
            ("veteransmiddleinitial1[0]", .middleInitial),
            ("veteranslastname[0]", .lastName),
            ("emailaddress1[0]", .email),
            // FirstThreeNumbers[0]/LastFourNumbers[0] on this form are the
            // veteran's SSN — only the [1] pair after AreaCode[0] is the phone.
            ("areacode[0]", .phoneArea),
            ("firstthreenumbers[1]", .phoneMiddleThree),
            ("lastfournumbers[1]", .phoneLastFour),
        ],
        "21-4138": [
            ("veterans_beneficiary_first_name[0]", .firstName),
            ("middle_initial1[0]", .middleInitial),
            ("last_name[0]", .lastName),
            ("email_address[0]", .email),
            ("areacode[0]", .phoneArea),
            ("firstthreenumbers[0]", .phoneMiddleThree),
            ("lastfournumbers[0]", .phoneLastFour),
            ("remarks[0]", .statement),
        ],
        "21-10210": [
            ("veterans_first_name[0]", .firstName),
            ("middle_initial1[0]", .middleInitial),
            ("last_name[0]", .lastName),
            ("email_address[0]", .email),
            ("areacode[0]", .phoneArea),
            ("firstthreenumbers[0]", .phoneMiddleThree),
            ("lastfournumbers[0]", .phoneLastFour),
            ("textfield1[0]", .statement),
        ],
        "21-0781": [
            ("veterans_service_members_first_name[0]", .firstName),
            ("veteransmiddleinitial1[0]", .middleInitial),
            ("veteranslastname[0]", .lastName),
            ("areacode[0]", .phoneArea),
            ("firstthreenumbers[0]", .phoneMiddleThree),
            ("lastfournumbers[0]", .phoneLastFour),
            ("remarks_if_any[0]", .statement),
        ],
        "21-4142": [
            ("veteranfirstname[0]", .firstName),
            ("veteranmiddleinitial1[0]", .middleInitial),
            ("veteranlastname[0]", .lastName),
            // The patient defaults to the veteran; both spellings appear.
            ("patients_firstname[0]", .firstName),
            ("patients_middleinitial1[0]", .middleInitial),
            ("patientmiddleinitial1[0]", .middleInitial),
            ("patients_lastname[0]", .lastName),
            ("telephonenumber_areacode[0]", .phoneArea),
            ("telephonenumber_secondthreenumbers[0]", .phoneMiddleThree),
            ("telephonenumber_lastfournumbers[0]", .phoneLastFour),
            ("conditions_you_are_being_treated_for[0]", .conditionsJoined),
        ],
        "21-4142a": [
            ("veteranfirstname[0]", .firstName),
            ("veteranmiddleinitial1[0]", .middleInitial),
            ("veteranlastname[0]", .lastName),
            ("patients_firstname[0]", .firstName),
            ("patientmiddleinitial1[0]", .middleInitial),
            ("patients_lastname[0]", .lastName),
            ("conditions_you_are_being_treated_for[0]", .conditionsJoined),
        ],
        "20-10206": [
            ("first_name[0]", .firstName),
            ("middle_initial1[0]", .middleInitial),
            ("last_name[0]", .lastName),
            ("email_address[0]", .email),
            ("areacode[0]", .phoneArea),
            ("firstthreenumbers[0]", .phoneMiddleThree),
            ("lastfournumbers[0]", .phoneLastFour),
            ("remarks[0]", .statement),
        ],
        "21-686c": [
            ("veteranfirstname[0]", .firstName),
            ("veteranmiddleinitial1[0]", .middleInitial),
            ("veteranlastname[0]", .lastName),
            ("email_address[0]", .email),
            ("telephonenumber_areacode_firstthreenumbers[0]", .phoneArea),
            ("telephonenumber_secondthreenumbers[0]", .phoneMiddleThree),
            ("telephonenumber_lastfournumbers[0]", .phoneLastFour),
            ("remarks_if_any[0]", .statement),
        ],
    ]

    static func hasLocalMap(for formNumber: String) -> Bool {
        formMaps[formNumber] != nil
    }

    static func value(for fieldName: String, formNumber: String, data: VAFormFillData) -> String? {
        let components = fieldName.lowercased().split(separator: ".").map(String.init)
        guard !components.isEmpty else { return nil }

        if let entries = formMaps[formNumber] {
            for entry in entries {
                let keyComponents = entry.key.split(separator: ".").map(String.init)
                guard components.count >= keyComponents.count else { continue }
                if Array(components.suffix(keyComponents.count)) == keyComponents {
                    return resolve(entry.target, data: data)
                }
            }
            // Verified forms fill mapped fields only; everything else stays blank.
            return nil
        }

        return genericValue(components: components, data: data)
    }

    private static func resolve(_ target: VAFormFillTarget, data: VAFormFillData) -> String? {
        let value: String
        switch target {
        case .firstName: value = data.firstName
        case .middleInitial: value = data.middleInitial
        case .lastName: value = data.lastName
        case .email: value = data.email
        case .phoneArea: value = data.phoneArea
        case .phoneMiddleThree: value = data.phoneMiddleThree
        case .phoneLastFour: value = data.phoneLastFour
        case .condition(let index):
            value = data.conditions.indices.contains(index) ? data.conditions[index] : ""
        case .conditionsJoined: value = data.conditionsJoined
        case .statement: value = data.statement
        }
        return value.isEmpty ? nil : value
    }

    /// Conservative fallback for forms added to the server catalog before a
    /// verified local map exists. Any field that could belong to another person
    /// or to data the app does not hold is skipped outright.
    private static func genericValue(components: [String], data: VAFormFillData) -> String? {
        let joined = components.joined(separator: ".")
        let banned = [
            "ssn", "socialsecurity", "social_security", "claimant", "spouse",
            "child", "dependent", "witness", "representative", "poc", "patient",
            "fax", "signature", "month", "day", "year", "insurance",
            "file_number", "filenumber", "unit", "organization", "provider",
            "address",
        ]
        if banned.contains(where: joined.contains) { return nil }
        guard let lastRaw = components.last, lastRaw.hasSuffix("[0]") else { return nil }
        let name = lastRaw.replacingOccurrences(of: #"\[\d+\]$"#, with: "", options: .regularExpression)

        let firstNames: Set<String> = [
            "veteransfirstname", "veterans_first_name", "veteranfirstname",
            "first_name", "veterans_beneficiary_first_name", "veterans_service_members_first_name",
        ]
        let middleInitials: Set<String> = [
            "veteransmiddleinitial1", "veterans_middle_initial1", "veteranmiddleinitial1",
            "middle_initial1", "middle_initial",
        ]
        let lastNames: Set<String> = [
            "veteranslastname", "veterans_last_name", "veteranlastname", "last_name",
        ]
        let phoneAreas: Set<String> = [
            "areacode", "telephone_number_area_code", "daytime_phone_number_area_code",
            "veteransphoneareacode", "telephonenumber_areacode",
        ]
        let remarks: Set<String> = ["remarks", "remarks_if_any"]

        if firstNames.contains(name) { return emptyToNil(data.firstName) }
        if middleInitials.contains(name) { return emptyToNil(data.middleInitial) }
        if lastNames.contains(name) { return emptyToNil(data.lastName) }
        if name.hasPrefix("email") { return emptyToNil(data.email) }
        if phoneAreas.contains(name) { return emptyToNil(data.phoneArea) }
        if remarks.contains(name) { return emptyToNil(data.statement) }
        // Split phone-number boxes are only filled when the field name itself
        // says "phone" — bare FirstThreeNumbers/LastFourNumbers are SSN boxes
        // on several VA forms and must never be guessed at.
        if joined.contains("phone") {
            if name.contains("firstthreenumbers") || name.contains("middle_three") || name.contains("secondthreenumbers") {
                return emptyToNil(data.phoneMiddleThree)
            }
            if name.contains("lastfournumbers") || name.contains("last_four") {
                return emptyToNil(data.phoneLastFour)
            }
        }
        return nil
    }

    private static func emptyToNil(_ value: String) -> String? {
        value.isEmpty ? nil : value
    }
}
