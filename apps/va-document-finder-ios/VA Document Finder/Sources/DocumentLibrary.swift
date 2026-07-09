import Foundation

enum DocumentLibrary {
    static let documents: [DocumentNeed] = [
        DocumentNeed(
            id: "dd214",
            title: "DD-214 or separation record",
            category: .service,
            scenarios: [.firstClaim, .supplemental, .appeal],
            summary: "Confirms service dates, character of discharge, MOS/rating, deployments, and medals.",
            whereToFind: [
                "VA.gov records portal",
                "National Archives / milConnect",
                "County veterans service office if previously recorded"
            ],
            checklist: [
                "Confirm all active-duty periods are represented.",
                "Check that discharge character is readable.",
                "Save a PDF copy and a photo backup."
            ],
            tips: [
                "Use this as the first file in any personal claim packet.",
                "If service dates are split across records, keep each record."
            ]
        ),
        DocumentNeed(
            id: "service-treatment-records",
            title: "Service treatment records",
            category: .medical,
            scenarios: [.firstClaim, .supplemental, .secondary, .appeal],
            summary: "Medical entries from active service that may show diagnosis, symptoms, treatment, injury, or exposure.",
            whereToFind: [
                "VA.gov or Tricare Online archive",
                "Branch medical records request",
                "National Personnel Records Center"
            ],
            checklist: [
                "Search by condition name and common abbreviations.",
                "Flag entrance and separation exams.",
                "Keep pages showing dates and provider signatures."
            ],
            tips: [
                "A normal separation exam can still matter. Keep it with the packet.",
                "If records are incomplete, write down where you requested them."
            ]
        ),
        DocumentNeed(
            id: "va-blue-button",
            title: "VA Blue Button records",
            category: .vaRecords,
            scenarios: [.increase, .supplemental, .secondary, .appeal, .pactAct],
            summary: "VA treatment history, medication lists, lab results, problem lists, and clinical notes.",
            whereToFind: [
                "VA.gov health records",
                "My HealtheVet Blue Button report"
            ],
            checklist: [
                "Export date ranges around diagnosis and worsening symptoms.",
                "Include medication lists when side effects are relevant.",
                "Save mental health notes separately if they need careful review."
            ],
            tips: [
                "Use date-range exports instead of one oversized file when possible.",
                "Keep a clean original and a working copy for highlights."
            ]
        ),
        DocumentNeed(
            id: "private-medical-records",
            title: "Private medical records",
            category: .medical,
            scenarios: [.firstClaim, .increase, .supplemental, .secondary, .appeal],
            summary: "Civilian provider notes, imaging, diagnosis records, and treatment plans outside VA care.",
            whereToFind: [
                "Provider patient portal",
                "Hospital medical records department",
                "Imaging center records desk"
            ],
            checklist: [
                "Request visit notes, not just billing summaries.",
                "Include imaging reports and relevant lab results.",
                "Add provider name, address, and treatment dates."
            ],
            tips: [
                "A signed records release can take weeks. Track request dates.",
                "Avoid uploading unrelated full-life medical history when narrower records are enough."
            ]
        ),
        DocumentNeed(
            id: "rating-decision",
            title: "VA rating decision letter",
            category: .vaRecords,
            scenarios: [.increase, .supplemental, .appeal, .secondary],
            summary: "Explains granted and denied issues, evidence reviewed, effective dates, and reasons for decision.",
            whereToFind: [
                "VA.gov claim letters",
                "Mail archive",
                "Accredited representative portal copy"
            ],
            checklist: [
                "Save every page including evidence and reasons sections.",
                "Note decision date and appeal deadline.",
                "Highlight each condition and percentage."
            ],
            tips: [
                "The reasons section is often the roadmap for missing evidence.",
                "Keep prior decisions together when filing an increase or appeal."
            ]
        ),
        DocumentNeed(
            id: "cp-exam",
            title: "C&P exam report",
            category: .vaRecords,
            scenarios: [.increase, .supplemental, .appeal, .secondary],
            summary: "Examiner findings used by VA to evaluate severity, nexus, limitations, and occupational impact.",
            whereToFind: [
                "VA regional office request",
                "VA medical records office for VA-performed exams",
                "Claims file request"
            ],
            checklist: [
                "Confirm exam date and claimed condition.",
                "Compare symptoms and range-of-motion findings to your records.",
                "Save addendum opinions with the original report."
            ],
            tips: [
                "Do not edit the report. Add your own notes separately.",
                "If findings conflict with records, identify exact pages that show the conflict."
            ]
        ),
        DocumentNeed(
            id: "buddy-statement",
            title: "Buddy or lay statement",
            category: .evidence,
            scenarios: [.firstClaim, .increase, .supplemental, .secondary, .appeal],
            summary: "A written observation from someone who directly saw symptoms, events, or day-to-day limitations.",
            whereToFind: [
                "Spouse, family member, service member, supervisor, or friend",
                "VA Form 21-10210"
            ],
            checklist: [
                "Use first-hand observations and dates when known.",
                "Describe frequency, severity, and functional impact.",
                "Include the writer's contact information and signature."
            ],
            tips: [
                "Specific examples are stronger than general support.",
                "One focused statement is better than several vague statements."
            ]
        ),
        DocumentNeed(
            id: "personal-statement",
            title: "Personal statement",
            category: .evidence,
            scenarios: [.firstClaim, .increase, .supplemental, .secondary, .appeal, .pactAct],
            summary: "Your own account of onset, symptoms, worsening, exposures, and how the condition affects work and life.",
            whereToFind: [
                "Write it with the VA Forms tool (VA Form 21-4138 or 21-10210) or in any notes app, then import it"
            ],
            checklist: [
                "Keep one issue per statement when possible.",
                "Describe what changed, when, and how often it occurs.",
                "Connect the statement to medical evidence where possible."
            ],
            tips: [
                "Plain language is usually better than medical jargon.",
                "Avoid exaggeration. Consistency matters."
            ]
        ),
        DocumentNeed(
            id: "nexus-opinion",
            title: "Nexus opinion or DBQ",
            category: .medical,
            scenarios: [.firstClaim, .secondary, .supplemental, .appeal],
            summary: "A clinician's structured medical opinion or disability benefits questionnaire.",
            whereToFind: [
                "Treating clinician",
                "Independent medical evaluator",
                "VA examination report"
            ],
            checklist: [
                "Confirm clinician credentials are visible.",
                "Check that rationale cites records or medical reasoning.",
                "Keep all pages and attachments together."
            ],
            tips: [
                "A conclusion without rationale is often weaker.",
                "For secondary claims, confirm both primary and secondary conditions are named."
            ]
        ),
        DocumentNeed(
            id: "exposure-records",
            title: "Deployment or exposure records",
            category: .service,
            scenarios: [.firstClaim, .supplemental, .pactAct, .appeal],
            summary: "Records showing locations, dates, duties, or events tied to toxic exposure or qualifying service.",
            whereToFind: [
                "DD-214 and personnel records",
                "Deployment orders",
                "Performance reports",
                "Travel vouchers or unit records"
            ],
            checklist: [
                "Capture country, base, ship, unit, and date range.",
                "Keep orders and travel records with service records.",
                "Add a short note explaining why the record matters."
            ],
            tips: [
                "Even indirect records can help establish location.",
                "Keep original file names when importing."
            ]
        ),
        DocumentNeed(
            id: "dependent-records",
            title: "Dependent records",
            category: .dependents,
            scenarios: [.firstClaim, .increase],
            summary: "Marriage, birth, school, or dependency records for compensation dependent updates.",
            whereToFind: [
                "Vital records office",
                "School registrar",
                "VA dependency forms"
            ],
            checklist: [
                "Save marriage and birth certificates as separate files.",
                "Confirm names and dates match VA records.",
                "Keep student verification current where relevant."
            ],
            tips: [
                "Dependency changes can affect payment. Track submission dates.",
                "Do not mix dependent files into medical evidence folders."
            ]
        ),
        DocumentNeed(
            id: "appeal-deadline",
            title: "Appeal deadline tracker",
            category: .forms,
            scenarios: [.supplemental, .appeal],
            summary: "A simple tracking note for decision dates, filing windows, and selected review lane.",
            whereToFind: [
                "Rating decision date",
                "VA.gov claim status",
                "Accredited representative notes"
            ],
            checklist: [
                "Record the exact decision date.",
                "Choose the intended review lane before gathering forms.",
                "Store deadline notes with the decision letter."
            ],
            tips: [
                "Calendar reminders reduce missed windows.",
                "This app does not calculate legal deadlines. Verify dates independently."
            ]
        )
    ]

    static let packetTasks: [PacketTask] = [
        PacketTask(id: "identity", title: "Confirm identity and service basics", detail: "Start with DD-214, service dates, contact details, and current mailing address.", category: .identity),
        PacketTask(id: "conditions", title: "List each condition separately", detail: "Use one line per issue so supporting evidence can be matched cleanly.", category: .forms),
        PacketTask(id: "medical", title: "Collect medical evidence", detail: "Gather VA, private, imaging, medication, and exam records tied to each issue.", category: .medical),
        PacketTask(id: "lay", title: "Add lay evidence", detail: "Attach personal and buddy statements only where they add first-hand facts.", category: .evidence),
        PacketTask(id: "decisions", title: "Review prior VA decisions", detail: "Save rating decisions and reasons for decision before preparing a supplemental or appeal packet.", category: .vaRecords),
        PacketTask(id: "organize", title: "Organize files for review", detail: "Use readable names, keep originals, and group files by condition or evidence type.", category: .forms)
    ]
}
