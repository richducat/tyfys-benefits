import Foundation
import CoreGraphics
import PDFKit

/// Where the veteran/claimant signature belongs on each supported VA form,
/// plus the "Date Signed" boxes to fill at signing time.
///
/// Coordinates are top-left-origin page points, measured from the printed
/// signature-line labels of the official VBA PDFs (2026-07 revisions) with
/// the same extraction pipeline that produced VAFormFieldMap. Date keys are
/// lowercased trailing components of the fully qualified field names; index
/// suffixes select the veteran cluster, never witness/alternate/POA rows.
struct VAFormSignaturePlacement {
    let pageIndex: Int
    let x: CGFloat
    let topY: CGFloat
    let width: CGFloat
    let height: CGFloat
    let dateMonthKey: String?
    let dateDayKey: String?
    let dateYearKey: String?
}

enum VAFormSigningMap {
    static let placements: [String: VAFormSignaturePlacement] = [
        // 33A. VETERAN/SERVICE MEMBER SIGNATURE (p13 of the PDF, index 12)
        "21-526EZ": VAFormSignaturePlacement(pageIndex: 12, x: 30, topY: 633, width: 220, height: 26, dateMonthKey: "date_signed_month[0]", dateDayKey: "date_signed_day[0]", dateYearKey: "date_signed_year[0]"),
        // 25A. CLAIMANT'S SIGNATURE
        "20-0995": VAFormSignaturePlacement(pageIndex: 6, x: 40, topY: 84, width: 220, height: 32, dateMonthKey: "datesignedmonth[0]", dateDayKey: "datesignedday[0]", dateYearKey: "datesignedyear[0]"),
        // 19A. SIGNATURE OF VETERAN OR CLAIMANT
        "20-0996": VAFormSignaturePlacement(pageIndex: 4, x: 40, topY: 443, width: 220, height: 28, dateMonthKey: "date_signed_month[0]", dateDayKey: "date_signed_day[0]", dateYearKey: "date_signed_year[0]"),
        // 20. SIGNATURE OF VETERAN, CLAIMANT, OR FIDUCIARY (item 21 = date signed)
        "21-0966": VAFormSignaturePlacement(pageIndex: 1, x: 36, topY: 306, width: 220, height: 32, dateMonthKey: "month[2]", dateDayKey: "day[2]", dateYearKey: "year[2]"),
        // 9. SIGNATURE OF VETERAN/BENEFICIARY (item 10 = date signed)
        "21-4138": VAFormSignaturePlacement(pageIndex: 1, x: 36, topY: 540, width: 220, height: 32, dateMonthKey: "month[1]", dateDayKey: "day[1]", dateYearKey: "year[1]"),
        // 22A. VETERAN/CLAIMANT/WITNESS SIGNATURE (22B = date signed)
        "21-10210": VAFormSignaturePlacement(pageIndex: 2, x: 42, topY: 576, width: 220, height: 32, dateMonthKey: "month[5]", dateDayKey: "day[5]", dateYearKey: "year[5]"),
        // 16A. VETERAN/SERVICE MEMBER'S SIGNATURE (16B = date signed)
        "21-0781": VAFormSignaturePlacement(pageIndex: 5, x: 42, topY: 747, width: 220, height: 32, dateMonthKey: "date_signed_month[0]", dateDayKey: "date_signed_day[0]", dateYearKey: "date_signed_year[0]"),
        // 13. SIGNATURE OF PERSON AUTHORIZING DISCLOSURE (14 = date signed)
        "21-4142": VAFormSignaturePlacement(pageIndex: 1, x: 42, topY: 210, width: 220, height: 30, dateMonthKey: "date_signed_month[0]", dateDayKey: "date_signed_day[0]", dateYearKey: "date_signed_year[0]"),
        // 22A. REQUESTER'S SIGNATURE — this form has a real signature text
        // widget; the stamp box mirrors that widget's rect (22B = date signed)
        "20-10206": VAFormSignaturePlacement(pageIndex: 3, x: 38, topY: 103, width: 220, height: 27, dateMonthKey: "month[3]", dateDayKey: "day[3]", dateYearKey: "year[3]"),
        // 26A. SIGNATURE OF BENEFICIARY/CLAIMANT
        "21-686c": VAFormSignaturePlacement(pageIndex: 13, x: 32, topY: 431, width: 220, height: 32, dateMonthKey: "date_signed_month[0]", dateDayKey: "date_signed_day[0]", dateYearKey: "date_signed_year[0]"),
        // 21-4142a intentionally absent: it has no signature line — the
        // authorization signature lives on 21-4142 itself.
    ]
}

enum VAFormSigningError: LocalizedError {
    case unsupportedForm
    case unreadableDraft
    case renderFailed
    case placementOutOfRange

    var errorDescription: String? {
        switch self {
        case .unsupportedForm:
            "This form does not have a mapped signature line yet."
        case .unreadableDraft:
            "The generated draft could not be reopened for signing."
        case .renderFailed:
            "The signed copy could not be rendered."
        case .placementOutOfRange:
            "This form revision no longer matches the signature layout. Download the latest form and sign it directly."
        }
    }
}

enum VAFormSigner {
    static func canSign(formNumber: String) -> Bool {
        VAFormSigningMap.placements[formNumber] != nil
    }

    /// Directory where generated drafts and signed copies live.
    static var generatedFormsFolder: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Digital Sync", isDirectory: true)
            .appendingPathComponent("VA Document Finder", isDirectory: true)
            .appendingPathComponent("Generated VA Forms", isDirectory: true)
    }

    /// Removes every signed copy of a form. Called when a draft is regenerated
    /// so a signature can never certify answers it never saw — the integrity
    /// rule must hold across app launches, not just within one screen.
    static func purgeSignedCopies(formNumber: String) {
        let fm = FileManager.default
        guard let files = try? fm.contentsOfDirectory(at: generatedFormsFolder, includingPropertiesForKeys: nil) else { return }
        for file in files where file.lastPathComponent.hasPrefix("\(formNumber)-signed-") {
            try? fm.removeItem(at: file)
        }
    }

    /// Stamps the drawn signature onto the draft's signature line, fills the
    /// veteran "Date Signed" boxes, and writes a FLATTENED copy next to the
    /// draft. Flattening locks the signed copy: its fields are no longer
    /// editable, so the signature cannot silently drift out of sync with the
    /// answers it certified (the finalize-integrity rule).
    static func sign(
        draftURL: URL,
        formNumber: String,
        signatureImage: CGImage,
        date: Date = Date()
    ) throws -> URL {
        guard let placement = VAFormSigningMap.placements[formNumber] else {
            throw VAFormSigningError.unsupportedForm
        }
        guard let document = PDFDocument(url: draftURL) else {
            throw VAFormSigningError.unreadableDraft
        }

        // Guard against form-revision drift: if the mapped signature page no
        // longer exists, refuse rather than stamp a signature onto the wrong
        // page (or a page that isn't there) and call it "signed".
        guard placement.pageIndex < document.pageCount else {
            throw VAFormSigningError.placementOutOfRange
        }

        fillDateSigned(in: document, placement: placement, date: date)

        let data = try flatten(document: document, stamp: signatureImage, placement: placement)
        let signedURL = draftURL.deletingLastPathComponent()
            .appendingPathComponent("\(formNumber)-signed-\(Int(date.timeIntervalSince1970)).pdf")
        try data.write(to: signedURL, options: [.atomic])
        return signedURL
    }

    private static func fillDateSigned(in document: PDFDocument, placement: VAFormSignaturePlacement, date: Date) {
        var components = Calendar(identifier: .gregorian)
        components.timeZone = .current
        let parts = components.dateComponents([.month, .day, .year], from: date)
        let values: [(String?, String)] = [
            (placement.dateMonthKey, String(format: "%02d", parts.month ?? 0)),
            (placement.dateDayKey, String(format: "%02d", parts.day ?? 0)),
            (placement.dateYearKey, String(parts.year ?? 0)),
        ]

        for pageIndex in 0..<document.pageCount {
            guard let page = document.page(at: pageIndex) else { continue }
            for annotation in page.annotations where annotation.widgetFieldType == .text {
                guard let fieldName = annotation.fieldName?.lowercased() else { continue }
                for (key, value) in values {
                    guard let key else { continue }
                    if matches(fieldName: fieldName, key: key) {
                        annotation.widgetStringValue = value
                    }
                }
            }
        }
    }

    /// Exact match on the trailing path components, mirroring VAFormFieldMap
    /// so bare keys like "month[2]" can never bleed into other numbered rows.
    private static func matches(fieldName: String, key: String) -> Bool {
        let components = fieldName.split(separator: ".").map(String.init)
        let keyComponents = key.split(separator: ".").map(String.init)
        guard components.count >= keyComponents.count else { return false }
        return Array(components.suffix(keyComponents.count)) == keyComponents
    }

    private static func flatten(
        document: PDFDocument,
        stamp: CGImage,
        placement: VAFormSignaturePlacement
    ) throws -> Data {
        let output = NSMutableData()
        guard let consumer = CGDataConsumer(data: output as CFMutableData),
              let firstPage = document.page(at: 0) else {
            throw VAFormSigningError.renderFailed
        }
        var firstBox = firstPage.bounds(for: .mediaBox)
        guard let context = CGContext(consumer: consumer, mediaBox: &firstBox, nil) else {
            throw VAFormSigningError.renderFailed
        }

        for pageIndex in 0..<document.pageCount {
            guard let page = document.page(at: pageIndex) else { continue }
            var box = page.bounds(for: .mediaBox)
            context.beginPage(mediaBox: &box)
            context.saveGState()
            page.draw(with: .mediaBox, to: context)
            context.restoreGState()

            if pageIndex == placement.pageIndex {
                context.draw(stamp, in: stampRect(placement: placement, pageBounds: box, imageSize: CGSize(width: stamp.width, height: stamp.height)))
            }
            context.endPage()
        }
        context.closePDF()
        return output as Data
    }

    private static func stampRect(placement: VAFormSignaturePlacement, pageBounds: CGRect, imageSize: CGSize) -> CGRect {
        // Convert the extracted top-left-origin box to PDF bottom-left origin.
        let boxBottom = pageBounds.maxY - placement.topY - placement.height
        let box = CGRect(x: pageBounds.minX + placement.x, y: boxBottom, width: placement.width, height: placement.height)
        guard imageSize.width > 0, imageSize.height > 0 else { return box }
        // Aspect-fit, anchored to the left end of the signature line.
        let scale = min(box.width / imageSize.width, box.height / imageSize.height)
        let width = imageSize.width * scale
        let height = imageSize.height * scale
        return CGRect(x: box.minX, y: box.minY, width: width, height: height)
    }
}
