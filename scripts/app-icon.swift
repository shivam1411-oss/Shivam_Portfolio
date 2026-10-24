import AppKit

// Usage: swift scripts/app-icon.swift android/app/src/main/res <folder-for-preview-pngs>
// App icon in the site's "cubic code matrix" style: beveled tiles of code with falling teal
// streams, and "SHIVAM SONI" on a dark plaque in the middle.
let resDir = CommandLine.arguments[1]
let previewDir = CommandLine.arguments[2]

func rgb(_ hex: Int, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: a)
}
let bg = rgb(0x0A0F0E)
let tile = rgb(0x0F1A18)
let teal = rgb(0x3FD1BF)
let indigo = rgb(0x9196F6)
let head = rgb(0xE8FFFB)

// Real code from the site's matrix, read down each column. Fixed so every size looks the same.
let code = Array("SELECTbucket,SUM(balance)FROMar_bookWHEREdpd>30GROUPBYbucket;cei=(open+sales-close)/(open+sales)*100dso=ar/credit_sales*days=>{}[]!=&&||")
let n = 16 // tiles per side of the full 108dp layer
// (column, head row, trail length): the lit streams.
let streams: [(Int, Double, Double)] = [(3, 12.5, 8), (4, 6.5, 5), (6, 13.5, 4), (9, 5.5, 4), (11, 13.5, 9), (12, 7.5, 6), (5, 4.5, 3), (10, 15.5, 3)]

/// Matrix tiles filling `rect`.
func drawMatrix(_ rect: NSRect) {
    bg.setFill()
    rect.fill()
    let cell = rect.width / CGFloat(n)
    let s = cell * 0.9
    let font = NSFont.monospacedSystemFont(ofSize: cell * 0.6, weight: .bold)
    for col in 0..<n {
        for row in 0..<n {
            let x = rect.minX + CGFloat(col) * cell + (cell - s) / 2
            let y = rect.maxY - CGFloat(row + 1) * cell + (cell - s) / 2 // row 0 at the top
            let t = NSRect(x: x, y: y, width: s, height: s)
            tile.setFill()
            NSBezierPath(roundedRect: t, xRadius: s * 0.12, yRadius: s * 0.12).fill()
            // Bevel: light top-left, dark bottom-right.
            rgb(0xFFFFFF, 0.07).setFill()
            NSRect(x: t.minX, y: t.maxY - s * 0.06, width: s, height: s * 0.06).fill()
            NSRect(x: t.minX, y: t.minY, width: s * 0.06, height: s).fill()
            rgb(0x000000, 0.45).setFill()
            NSRect(x: t.minX, y: t.minY, width: s, height: s * 0.06).fill()
            NSRect(x: t.maxX - s * 0.06, y: t.minY, width: s * 0.06, height: s).fill()

            var alpha: CGFloat = 0.22
            var color = teal
            for (c, h, len) in streams where c == col {
                let d = h - Double(row)
                if d >= 0 && d < len { alpha = max(alpha, CGFloat(0.25 + 0.75 * (1 - d / len))) }
                if d >= 0 && d < 1 { color = head; alpha = 1 }
            }
            let ch = String(code[(col * 7 + row * 3) % code.count])
            let str = NSAttributedString(string: ch, attributes: [.font: font, .foregroundColor: color.withAlphaComponent(alpha)])
            let sz = str.size()
            str.draw(at: NSPoint(x: t.midX - sz.width / 2, y: t.midY - sz.height / 2))
        }
    }
}

/// Name plaque centred in `rect`, sized to `width`.
func drawName(_ rect: NSRect, width: CGFloat) {
    let fontSize = width * 0.215
    let font = NSFont.monospacedSystemFont(ofSize: fontSize, weight: .heavy)
    let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor.white]
    let l1 = NSAttributedString(string: "SHIVAM", attributes: attrs)
    let l2 = NSAttributedString(string: "SONI", attributes: attrs)
    let lineH = fontSize * 1.08
    let padX = width * 0.09
    let padY = width * 0.07
    let barH = width * 0.035
    let plaqueW = max(l1.size().width, l2.size().width) + padX * 2
    let plaqueH = lineH * 2 + barH + padY * 2.4
    let plaque = NSRect(x: rect.midX - plaqueW / 2, y: rect.midY - plaqueH / 2, width: plaqueW, height: plaqueH)

    // Soft dark halo so the name lifts off the code behind it.
    NSGraphicsContext.saveGraphicsState()
    let shadow = NSShadow()
    shadow.shadowColor = rgb(0x000000, 0.8)
    shadow.shadowBlurRadius = width * 0.12
    shadow.set()
    rgb(0x0A0F0E, 0.92).setFill()
    NSBezierPath(roundedRect: plaque, xRadius: width * 0.08, yRadius: width * 0.08).fill()
    NSGraphicsContext.restoreGraphicsState()
    let border = NSBezierPath(roundedRect: plaque.insetBy(dx: 0.5, dy: 0.5), xRadius: width * 0.08, yRadius: width * 0.08)
    border.lineWidth = max(1, width * 0.012)
    teal.withAlphaComponent(0.55).setStroke()
    border.stroke()

    let top = plaque.maxY - padY
    l1.draw(at: NSPoint(x: rect.midX - l1.size().width / 2, y: top - lineH))
    l2.draw(at: NSPoint(x: rect.midX - l2.size().width / 2, y: top - lineH * 2))
    let barW = plaqueW - padX * 2
    let bar = NSRect(x: rect.midX - barW / 2, y: plaque.minY + padY, width: barW, height: barH)
    NSGradient(starting: teal, ending: indigo)!.draw(in: NSBezierPath(roundedRect: bar, xRadius: barH / 2, yRadius: barH / 2), angle: 0)
}

enum Kind { case background, foreground, square, round, adaptivePreview }

func render(_ px: Int, _ kind: Kind) -> Data {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: px, bitsPerSample: 8,
                               samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    let s = CGFloat(px)
    let full = NSRect(x: 0, y: 0, width: s, height: s)
    switch kind {
    case .background:
        drawMatrix(full)
    case .foreground:
        // Adaptive layers are 108dp; launchers show the central ~72dp, and only 66dp is guaranteed.
        drawName(full, width: s * 0.5)
    case .square, .round, .adaptivePreview:
        let clip = kind == .square ? NSBezierPath(roundedRect: full, xRadius: s * 0.22, yRadius: s * 0.22) : NSBezierPath(ovalIn: full)
        clip.addClip()
        // Legacy icons show the whole thing, so zoom the 108dp layer to its visible 72dp centre.
        let layer = full.insetBy(dx: -s * 0.25, dy: -s * 0.25)
        drawMatrix(layer)
        drawName(layer, width: layer.width * 0.5)
    }
    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])!
}

let densities: [(String, Int)] = [("mdpi", 1), ("hdpi", 2), ("xhdpi", 3), ("xxhdpi", 4), ("xxxhdpi", 5)]
let legacy = [1: 48, 2: 72, 3: 96, 4: 144, 5: 192]
let layer = [1: 108, 2: 162, 3: 216, 4: 324, 5: 432]
for (name, k) in densities {
    let dir = "\(resDir)/mipmap-\(name)"
    try! render(legacy[k]!, .square).write(to: URL(fileURLWithPath: "\(dir)/ic_launcher.png"))
    try! render(legacy[k]!, .round).write(to: URL(fileURLWithPath: "\(dir)/ic_launcher_round.png"))
    try! render(layer[k]!, .foreground).write(to: URL(fileURLWithPath: "\(dir)/ic_launcher_foreground.png"))
    try! render(layer[k]!, .background).write(to: URL(fileURLWithPath: "\(dir)/ic_launcher_background.png"))
}
try! render(512, .square).write(to: URL(fileURLWithPath: "\(previewDir)/icon-512.png"))
try! render(96, .round).write(to: URL(fileURLWithPath: "\(previewDir)/icon-96-round.png"))
print("icons written")
