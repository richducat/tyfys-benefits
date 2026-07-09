import XCTest

final class GenerateDraftUITests: XCTestCase {
    @MainActor
    func testGeneratePrefilledDraftFor4138() throws {
        let app = XCUIApplication()
        app.launch()

        // Fresh install shows onboarding; "Claim Research" routes to Tools.
        let research = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Claim Research'")).firstMatch
        if research.waitForExistence(timeout: 5) {
            research.tap()
        } else {
            app.tabBars.buttons["Tools"].tap()
        }

        let formsTool = app.buttons.containing(NSPredicate(format: "label CONTAINS 'VA Forms & PDF Filler'")).firstMatch
        XCTAssertTrue(formsTool.waitForExistence(timeout: 8), "VA Forms tool row not found in Tools tab")
        formsTool.tap()

        let searchField = app.textFields["Search forms"]
        XCTAssertTrue(searchField.waitForExistence(timeout: 8), "Forms search field not found")
        searchField.tap()
        searchField.typeText("4138")

        let formRow = app.staticTexts["VA Form 21-4138"]
        XCTAssertTrue(formRow.waitForExistence(timeout: 8), "Form 21-4138 not listed in catalog")
        formRow.tap()

        let generate = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Generate Prefilled PDF Draft'")).firstMatch
        XCTAssertTrue(generate.waitForExistence(timeout: 8), "Generate button not found")
        XCTAssertTrue(generate.isEnabled, "Generate button should be enabled for locally mapped form 21-4138")
        generate.tap()

        // Success = the share affordance for the generated draft appears
        // (includes downloading the official PDF from vba.va.gov and filling it).
        let share = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Share or Preview Draft PDF'")).firstMatch
        XCTAssertTrue(share.waitForExistence(timeout: 90), "Generated draft share link never appeared")

        // --- Sign & Date flow ---
        // The signing section renders below the fold in the lazy List; scroll
        // with slow swipes until the button is actually hittable so the tap
        // cannot race list deceleration or cell recycling.
        let signButton = app.buttons["sign-and-date"]
        var scrollAttempts = 0
        while !(signButton.exists && signButton.isHittable), scrollAttempts < 6 {
            app.swipeUp(velocity: .slow)
            scrollAttempts += 1
        }
        XCTAssertTrue(signButton.exists && signButton.isHittable, "Sign & Date button never became hittable")

        // First-time signing opens the signature pad; when a saved signature
        // already exists on this device, the app signs directly instead.
        // Exercise whichever path the install state presents.
        let saveSignature = app.buttons["save-signature"]
        signButton.tap()
        if saveSignature.waitForExistence(timeout: 6) {
            let canvas = app.otherElements["signature-canvas"]
            let drawTarget = canvas.exists ? canvas : app.otherElements.firstMatch
            let start = drawTarget.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.45))
            let mid = drawTarget.coordinate(withNormalizedOffset: CGVector(dx: 0.45, dy: 0.30))
            let end = drawTarget.coordinate(withNormalizedOffset: CGVector(dx: 0.65, dy: 0.50))
            start.press(forDuration: 0.05, thenDragTo: mid)
            mid.press(forDuration: 0.05, thenDragTo: end)
            XCTAssertTrue(saveSignature.isEnabled, "Save Signature stayed disabled after drawing")
            saveSignature.tap()
        }

        // Either path must end with a signed, shareable PDF.
        let signedShare = app.buttons["share-signed-pdf"]
        XCTAssertTrue(signedShare.waitForExistence(timeout: 30), "Signed PDF share link never appeared")
    }

    @MainActor
    func testRecordsPullCenter() throws {
        let app = XCUIApplication()
        app.launch()

        let research = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Claim Research'")).firstMatch
        if research.waitForExistence(timeout: 5) {
            research.tap()
        } else {
            app.tabBars.buttons["Tools"].tap()
        }

        let pullTool = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Pull VA Records'")).firstMatch
        XCTAssertTrue(pullTool.waitForExistence(timeout: 8), "Pull VA Records tool not in Tools tab")
        pullTool.tap()

        // Core record sources render with their action buttons.
        XCTAssertTrue(app.staticTexts["VA Benefit & Award Letters"].waitForExistence(timeout: 8))
        XCTAssertTrue(app.staticTexts["VA Medical Records (Blue Button)"].exists)
        let generateRequest = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Generate Request Form'")).firstMatch
        for _ in 0..<4 where !generateRequest.exists {
            app.swipeUp()
        }
        XCTAssertTrue(generateRequest.waitForExistence(timeout: 8), "C-File request-form action missing")
        generateRequest.tap()

        // The request flow lands on the prefill screen for the FOIA form.
        let generate = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Generate Prefilled PDF Draft'")).firstMatch
        XCTAssertTrue(generate.waitForExistence(timeout: 8), "Request form prefill screen did not open")
    }
}
