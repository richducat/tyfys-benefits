import Foundation
import PencilKit
import SwiftUI

/// Persists the veteran's drawn signature: the editable PencilKit drawing and
/// a rendered transparent PNG used for stamping onto forms. One signature per
/// device, stored in Application Support next to the document vault.
@MainActor
final class SignatureStore: ObservableObject {
    @Published private(set) var signatureImage: UIImage?
    @Published private(set) var updatedAt: Date?

    private let fileManager = FileManager.default
    private let folderURL: URL
    private var drawingURL: URL { folderURL.appendingPathComponent("signature.drawing") }
    private var imageURL: URL { folderURL.appendingPathComponent("signature.png") }

    init() {
        folderURL = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Digital Sync", isDirectory: true)
            .appendingPathComponent("VA Document Finder", isDirectory: true)
            .appendingPathComponent("Signature", isDirectory: true)
        load()
    }

    var hasSignature: Bool { signatureImage != nil }

    func savedDrawing() -> PKDrawing? {
        guard let data = try? Data(contentsOf: drawingURL) else { return nil }
        return try? PKDrawing(data: data)
    }

    func save(drawing: PKDrawing) {
        let bounds = drawing.bounds
        guard !bounds.isEmpty else { return }
        // Render at 3x with a little padding so the stamp stays crisp when
        // scaled onto the form's signature line. Force the light trait:
        // PencilKit stores ink as a dynamic color, so a black stroke would
        // otherwise render WHITE in dark mode and stamp invisibly on the
        // white PDF page.
        let padded = bounds.insetBy(dx: -8, dy: -8)
        var image = drawing.image(from: padded, scale: 3)
        UITraitCollection(userInterfaceStyle: .light).performAsCurrent {
            image = drawing.image(from: padded, scale: 3)
        }
        do {
            try fileManager.createDirectory(at: folderURL, withIntermediateDirectories: true)
            try drawing.dataRepresentation().write(to: drawingURL, options: [.atomic])
            if let png = image.pngData() {
                try png.write(to: imageURL, options: [.atomic])
            }
            signatureImage = image
            updatedAt = Date()
        } catch {
            // Keep the in-memory signature usable even if persistence failed.
            signatureImage = image
            updatedAt = Date()
        }
    }

    func clear() {
        try? fileManager.removeItem(at: drawingURL)
        try? fileManager.removeItem(at: imageURL)
        signatureImage = nil
        updatedAt = nil
    }

    private func load() {
        guard let data = try? Data(contentsOf: imageURL), let image = UIImage(data: data) else { return }
        signatureImage = image
        if let attributes = try? fileManager.attributesOfItem(atPath: imageURL.path) {
            updatedAt = attributes[.modificationDate] as? Date
        }
    }
}

struct SignatureCanvasView: UIViewRepresentable {
    @Binding var drawing: PKDrawing

    func makeUIView(context: Context) -> PKCanvasView {
        let canvas = PKCanvasView()
        canvas.drawing = drawing
        // Fixed black ink (not the dynamic .black) and a light canvas so the
        // ink the user sees matches the ink stamped onto the white PDF.
        canvas.tool = PKInkingTool(.pen, color: UIColor(white: 0.05, alpha: 1), width: 4)
        canvas.drawingPolicy = .anyInput
        canvas.overrideUserInterfaceStyle = .light
        canvas.backgroundColor = .clear
        canvas.isOpaque = false
        canvas.delegate = context.coordinator
        return canvas
    }

    func updateUIView(_ canvas: PKCanvasView, context: Context) {
        if canvas.drawing != drawing {
            canvas.drawing = drawing
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(drawing: $drawing)
    }

    final class Coordinator: NSObject, PKCanvasViewDelegate {
        private let drawing: Binding<PKDrawing>

        init(drawing: Binding<PKDrawing>) {
            self.drawing = drawing
        }

        func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) {
            drawing.wrappedValue = canvasView.drawing
        }
    }
}

/// Full-screen signature pad: draw with a finger or Apple Pencil above a
/// baseline, then save. The saved signature is reused for every form until
/// the veteran redraws it.
struct SignaturePadSheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var signatureStore: SignatureStore
    var onSaved: (() -> Void)? = nil

    @State private var drawing = PKDrawing()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("Sign with your finger or Apple Pencil. This signature is stored only on your device and stamped onto forms you choose to sign.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal)

                ZStack(alignment: .bottom) {
                    // Fixed near-white "paper" fill (not a dynamic system
                    // color) so the black ink stays visible while drawing even
                    // in dark mode — matching the ink stamped onto the PDF.
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(white: 0.98))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .strokeBorder(Color.tyfysBlue.opacity(0.35), style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
                        )

                    VStack(spacing: 6) {
                        Rectangle()
                            .fill(Color.documentGold)
                            .frame(height: 1.5)
                        HStack {
                            Image(systemName: "xmark")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(Color.documentGold)
                            Text("Sign above the line")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Spacer()
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 28)

                    SignatureCanvasView(drawing: $drawing)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .accessibilityElement()
                        .accessibilityIdentifier("signature-canvas")
                }
                .frame(height: 240)
                .padding(.horizontal)

                HStack {
                    Button {
                        drawing = PKDrawing()
                    } label: {
                        Label("Clear", systemImage: "trash")
                    }
                    .disabled(drawing.strokes.isEmpty)

                    Spacer()

                    Button {
                        signatureStore.save(drawing: drawing)
                        dismiss()
                        onSaved?()
                    } label: {
                        Label("Save Signature", systemImage: "checkmark.circle.fill")
                            .font(.headline)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.tyfysBlue)
                    .disabled(drawing.strokes.isEmpty)
                    .accessibilityIdentifier("save-signature")
                }
                .padding(.horizontal)

                Spacer()
            }
            .padding(.top, 12)
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Your Signature")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                if drawing.strokes.isEmpty, let saved = signatureStore.savedDrawing() {
                    drawing = saved
                }
            }
        }
    }
}
