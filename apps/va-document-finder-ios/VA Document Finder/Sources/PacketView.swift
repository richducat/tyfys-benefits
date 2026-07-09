import SwiftUI

struct PacketView: View {
    @AppStorage("packet.completed.ids") private var completedRaw = ""

    private var completedIDs: Set<String> {
        // Ignore IDs from removed tasks so counts and progress stay accurate.
        Set(completedRaw.split(separator: ",").map(String.init))
            .intersection(Set(DocumentLibrary.packetTasks.map(\.id)))
    }

    private var progress: Double {
        guard !DocumentLibrary.packetTasks.isEmpty else { return 0 }
        return Double(completedIDs.count) / Double(DocumentLibrary.packetTasks.count)
    }

    var body: some View {
        // Pushed from the Tools tab; no local NavigationStack.
        List {
                Section {
                    HeaderBand(
                        title: "Build a clean review packet.",
                        subtitle: "Work through the basic organization sequence before sharing files with a representative, clinician, or support team.",
                        systemImage: "checklist.checked"
                    )
                    .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }

                Section {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Text("\(Int(progress * 100))%")
                                .font(.largeTitle.bold())
                                .foregroundStyle(Color.documentInk)
                            Spacer()
                            Text("\(completedIDs.count) of \(DocumentLibrary.packetTasks.count)")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                        }
                        ProgressView(value: progress)
                            .tint(Color.documentGold)
                            .accessibilityLabel("Packet progress")
                    }
                    .padding(.vertical, 6)
                }

                Section("Packet steps") {
                    ForEach(DocumentLibrary.packetTasks) { task in
                        Button {
                            toggle(task.id)
                        } label: {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: completedIDs.contains(task.id) ? "checkmark.circle.fill" : "circle")
                                    .font(.title3.weight(.semibold))
                                    .foregroundStyle(completedIDs.contains(task.id) ? Color.documentGold : .secondary)
                                    .frame(width: 30)

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(task.title)
                                        .font(.headline)
                                        .foregroundStyle(.primary)
                                    Text(task.detail)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                        .fixedSize(horizontal: false, vertical: true)
                                }

                                Spacer(minLength: 0)
                            }
                            .padding(.vertical, 6)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(task.title)
                    }
                }

                Section("Review position") {
                    Label("Keep originals untouched and create clean copies for review.", systemImage: "doc.on.doc")
                    Label("Use dates and condition names in file names when possible.", systemImage: "calendar.badge.clock")
                    Label("Verify deadlines and filing decisions outside this app.", systemImage: "exclamationmark.triangle")
                }
                .font(.subheadline)
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Packet")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Reset") {
                        writeCompletedIDs([])
                    }
                    .disabled(completedIDs.isEmpty)
                }
            }
    }

    private func toggle(_ id: String) {
        var updated = completedIDs
        if updated.contains(id) {
            updated.remove(id)
        } else {
            updated.insert(id)
        }
        writeCompletedIDs(updated)
    }

    private func writeCompletedIDs(_ ids: Set<String>) {
        completedRaw = ids.sorted().joined(separator: ",")
    }
}
