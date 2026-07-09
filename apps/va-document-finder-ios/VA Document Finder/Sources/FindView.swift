import SwiftUI

struct FindView: View {
    @State private var searchText = ""
    @State private var selectedScenario: ClaimScenario?
    @State private var selectedCategory: DocumentCategory?

    private var filteredDocuments: [DocumentNeed] {
        DocumentLibrary.documents.filter { document in
            let matchesSearch = searchText.isEmpty
                || document.title.localizedCaseInsensitiveContains(searchText)
                || document.summary.localizedCaseInsensitiveContains(searchText)
                || document.whereToFind.joined(separator: " ").localizedCaseInsensitiveContains(searchText)

            let matchesScenario = selectedScenario.map { document.scenarios.contains($0) } ?? true
            let matchesCategory = selectedCategory.map { document.category == $0 } ?? true

            return matchesSearch && matchesScenario && matchesCategory
        }
    }

    var body: some View {
        // No local NavigationStack: this view is pushed inside the Tools tab's
        // navigation stack, and nesting stacks breaks push navigation.
        List {
                Section {
                    HeaderBand(
                        title: "Find the records that belong in the packet.",
                        subtitle: "Search common VA claim document types, see where to locate them, and keep the guidance focused on organization.",
                        systemImage: "doc.viewfinder"
                    )
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Claim scenario")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.secondary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                FilterChip(title: "All", isSelected: selectedScenario == nil) {
                                    selectedScenario = nil
                                }
                                ForEach(ClaimScenario.allCases) { scenario in
                                    FilterChip(title: scenario.rawValue, isSelected: selectedScenario == scenario) {
                                        selectedScenario = scenario
                                    }
                                }
                            }
                        }

                        Text("Document type")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.secondary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                FilterChip(title: "All", isSelected: selectedCategory == nil) {
                                    selectedCategory = nil
                                }
                                ForEach(DocumentCategory.allCases) { category in
                                    FilterChip(title: category.rawValue, isSelected: selectedCategory == category) {
                                        selectedCategory = category
                                    }
                                }
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section {
                    if filteredDocuments.isEmpty {
                        EmptyStateView(
                            systemImage: "magnifyingglass",
                            title: "No matches",
                            message: "Try a broader search or remove one of the filters."
                        )
                    } else {
                        ForEach(filteredDocuments) { document in
                            NavigationLink(value: document) {
                                DocumentRow(document: document)
                            }
                        }
                    }
                } header: {
                    Text("\(filteredDocuments.count) document types")
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Find")
            .searchable(text: $searchText, prompt: "Search documents")
            .navigationDestination(for: DocumentNeed.self) { document in
                DocumentDetailView(document: document)
            }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(isSelected ? .white : Color.documentNavy)
                .padding(.horizontal, 12)
                .frame(height: 34)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(isSelected ? Color.documentNavy : Color.documentNavy.opacity(0.08))
                )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(title) filter")
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}

struct DocumentRow: View {
    let document: DocumentNeed

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: document.category.symbol)
                .font(.headline)
                .foregroundStyle(Color.documentNavy)
                .frame(width: 38, height: 38)
                .background(Color.documentNavy.opacity(0.09), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 6) {
                Text(document.title)
                    .font(.headline)
                    .foregroundStyle(.primary)
                Text(document.summary)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                Text(document.category.rawValue)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.documentGold)
            }
        }
        .padding(.vertical, 6)
    }
}

struct DocumentDetailView: View {
    let document: DocumentNeed

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 14) {
                    Image(systemName: document.category.symbol)
                        .font(.largeTitle.weight(.semibold))
                        .foregroundStyle(Color.documentGold)
                    Text(document.title)
                        .font(.title.bold())
                        .foregroundStyle(Color.documentInk)
                    Text(document.summary)
                        .font(.body)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 8)
            }

            DetailListSection(title: "Where to Find It", rows: document.whereToFind, symbol: "location.magnifyingglass")
            DetailListSection(title: "Check Before You Save", rows: document.checklist, symbol: "checkmark.seal")
            DetailListSection(title: "Practical Notes", rows: document.tips, symbol: "lightbulb")

            Section("Important") {
                Label(
                    "This app helps organize records. It does not submit VA claims, replace professional advice, or act as the Department of Veterans Affairs.",
                    systemImage: "exclamationmark.shield"
                )
                .font(.subheadline)
                .foregroundStyle(.secondary)
            }
        }
        .navigationTitle(document.category.rawValue)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DetailListSection: View {
    let title: String
    let rows: [String]
    let symbol: String

    var body: some View {
        Section(title) {
            ForEach(rows, id: \.self) { row in
                Label(row, systemImage: symbol)
                    .font(.body)
                    .labelStyle(.detailRow)
            }
        }
    }
}

struct DetailRowLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(alignment: .top, spacing: 12) {
            configuration.icon
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.documentGold)
                .frame(width: 24)
            configuration.title
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.vertical, 3)
    }
}

extension LabelStyle where Self == DetailRowLabelStyle {
    static var detailRow: DetailRowLabelStyle { DetailRowLabelStyle() }
}
