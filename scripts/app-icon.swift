import AppKit

// Usage: swift scripts/app-icon.swift android/app/src/main/res <folder-for-preview-pngs>
// App icon and launch images: the low-poly stag (the same one hidden in the site's code matrix, see
// src/components/deerMask.js) in the dark theme's teal → indigo, over the site's "cubic code matrix".
// The adaptive icon's foreground is the stag alone, so Android's launch screen (which shows that layer on the
// dark background) is the stag too. The old drawable*/splash.png images are redrawn to match.
let resDir = CommandLine.arguments[1]
let previewDir = CommandLine.arguments[2]

func rgb(_ hex: Int, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: a)
}
let bg = rgb(0x0A0B0E) // --bg in the dark theme (and @color/ic_launcher_background)
let tile = rgb(0x0F1A18)
let teal = rgb(0x3FD1BF)
let streamHead = rgb(0xE8FFFB)

// Real code from the site's matrix, read down each column. Fixed so every size looks the same.
let code = Array("SELECTbucket,SUM(balance)FROMar_bookWHEREdpd>30GROUPBYbucket;cei=(open+sales-close)/(open+sales)*100dso=ar/credit_sales*days=>{}[]!=&&||")
let n = 16 // tiles per side of the full 108dp layer
// (column, head row, trail length): the lit streams.
let streams: [(Int, Double, Double)] = [(3, 12.5, 8), (4, 6.5, 5), (6, 13.5, 4), (9, 5.5, 4), (11, 13.5, 9), (12, 7.5, 6), (5, 4.5, 3), (10, 15.5, 3)]

/// Matrix tiles filling `rect`, with a dark pool in the middle so the stag stands out.
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
            rgb(0xFFFFFF, 0.1).setFill()
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
                if d >= 0 && d < 1 { color = streamHead; alpha = 1 }
            }
            let ch = String(code[(col * 7 + row * 3) % code.count])
            let str = NSAttributedString(string: ch, attributes: [.font: font, .foregroundColor: color.withAlphaComponent(alpha)])
            let sz = str.size()
            str.draw(at: NSPoint(x: t.midX - sz.width / 2, y: t.midY - sz.height / 2))
        }
    }
    NSGradient(colors: [bg.withAlphaComponent(0.8), bg.withAlphaComponent(0.4), bg.withAlphaComponent(0)])!
        .draw(in: NSBezierPath(ovalIn: rect.insetBy(dx: rect.width * 0.14, dy: rect.width * 0.14)), relativeCenterPosition: .zero)
}

// ---------------------------------------------------------------- the stag (ported from src/components/deerMask.js)

enum Tone { case left, mid, right }
// The dark theme's palette: --accent, the midpoint, --accent-2.
let tones: [Tone: NSColor] = [.left: rgb(0x3FD1BF), .mid: rgb(0x68B4DB), .right: rgb(0x9196F6)]

// Drawing space: x 40…424, y 286…626, y grows downwards; the right half mirrors the left about x = 232.
let box = (x0: 40.0, y0: 286.0, x1: 424.0, y1: 626.0)
let cx = 232.0
let headFacets: [([(Double, Double)], Tone)] = [
    ([(137, 479), (186, 491), (180, 520), (158, 516)], .left), // ear
    ([(186, 491), (208, 489), (198, 520), (182, 522)], .mid), // temple
    ([(208, 489), (232, 492), (232, 527), (198, 520)], .mid), // forehead
    ([(182, 522), (198, 520), (200, 530), (192, 552), (184, 530)], .left), // brow
    ([(198, 520), (232, 527), (222, 530), (214, 553), (200, 530)], .mid), // eye socket
    ([(184, 530), (192, 552), (214, 553), (210, 590), (205, 600), (194, 572)], .left), // cheek
    ([(232, 527), (232, 594), (220, 592), (214, 553), (222, 530)], .mid), // nose bridge
    ([(205, 600), (210, 590), (220, 592), (224, 606), (214, 614)], .left), // muzzle side
    ([(220, 592), (232, 594), (232, 606), (224, 606)], .mid), // upper lip
    ([(214, 614), (224, 606), (232, 606), (232, 624), (222, 622)], .right), // nose
]
let eye: [(Double, Double)] = [(186, 538), (200, 528), (212, 538), (200, 548)]
// Antler strokes: points, start width, end width. Wider than on the site so they survive at 48px.
let bold = 1.9
let antler: [([(Double, Double)], Double, Double, Tone)] = [
    ([(203, 489), (150, 456), (104, 424), (70, 382), (48, 330)], 12, 4, .left), // main beam
    ([(180, 474), (158, 430), (128, 376)], 7, 2, .mid), // inner tine
    ([(197, 486), (190, 452), (188, 424)], 6.5, 2, .mid), // brow tine
    ([(132, 444), (104, 432), (74, 414)], 6.5, 2, .left), // lower outer tine
    ([(96, 414), (96, 360), (106, 296)], 6.5, 2, .left), // tall tine
    ([(72, 386), (68, 350), (74, 312)], 6, 2, .left), // top tine
]
let gap = 4.6 // cut between head facets (3.2 on the site)

func mirrored(_ pts: [(Double, Double)]) -> [(Double, Double)] { pts.map { (2 * cx - $0.0, $0.1) } }
func polygon(_ pts: [(Double, Double)], _ map: (Double, Double) -> NSPoint) -> NSBezierPath {
    let p = NSBezierPath()
    for (i, pt) in pts.enumerated() {
        if i == 0 { p.move(to: map(pt.0, pt.1)) } else { p.line(to: map(pt.0, pt.1)) }
    }
    p.close()
    return p
}
/// A polyline as a filled sliver narrowing from w0 to w1 and ending in a point (as `taper` in deerMask.js).
func taper(_ pts: [(Double, Double)], _ w0: Double, _ w1: Double) -> [(Double, Double)] {
    var l: [(Double, Double)] = [], r: [(Double, Double)] = []
    let c = pts.count
    for (i, p) in pts.enumerated() {
        let a = pts[max(0, i - 1)], b = pts[min(c - 1, i + 1)]
        let len = max(hypot(b.0 - a.0, b.1 - a.1), 1)
        let nx = -(b.1 - a.1) / len, ny = (b.0 - a.0) / len
        let half = (w0 + (w1 - w0) * Double(i) / Double(c - 1)) / 2
        l.append((p.0 + nx * half, p.1 + ny * half))
        r.append((p.0 - nx * half, p.1 - ny * half))
    }
    let last = pts[c - 1], prev = pts[c - 2]
    let len = max(hypot(last.0 - prev.0, last.1 - prev.1), 1)
    let tip = (last.0 + (last.0 - prev.0) / len * w1 * 3, last.1 + (last.1 - prev.1) / len * w1 * 3)
    return l + [tip] + r.reversed()
}

/// The stag fitted (centred) in `rect`, with a soft teal glow. Drawn on its own layer first so the facet
/// gaps are cut out of the stag only, not out of whatever is behind it.
func drawStag(_ rect: NSRect, glow: Bool = true) {
    let bw = box.x1 - box.x0, bh = box.y1 - box.y0
    let k = min(Double(rect.width) / bw, Double(rect.height) / bh)
    let scale = 2.0 // the layer is drawn at 2× for clean edges
    let px = Int(ceil(Double(rect.width) * scale)), py = Int(ceil(Double(rect.height) * scale))
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: py, bitsPerSample: 8, samplesPerPixel: 4,
                               hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    let ox = (Double(rect.width) - bw * k) / 2, oy = (Double(rect.height) - bh * k) / 2
    // Drawing space (y down) → layer pixels (y up).
    let map: (Double, Double) -> NSPoint = { x, y in
        NSPoint(x: (ox + (x - box.x0) * k) * scale, y: (oy + (box.y1 - y) * k) * scale)
    }
    NSGraphicsContext.saveGraphicsState()
    let ctx = NSGraphicsContext(bitmapImageRep: rep)!
    NSGraphicsContext.current = ctx
    for right in [false, true] {
        let flip: ([(Double, Double)]) -> [(Double, Double)] = right ? mirrored : { $0 }
        let tone: (Tone) -> Tone = { right && $0 == .left ? .right : $0 }
        for (pts, w0, w1, t) in antler {
            tones[tone(t)]!.setFill()
            polygon(taper(flip(pts), w0 * bold, w1 * bold), map).fill()
        }
        for (pts, t) in headFacets {
            tones[tone(t)]!.setFill()
            polygon(flip(pts), map).fill()
        }
    }
    // Cut the gaps between facets, and the eyes.
    ctx.compositingOperation = .clear
    for right in [false, true] {
        let flip: ([(Double, Double)]) -> [(Double, Double)] = right ? mirrored : { $0 }
        for (pts, _) in headFacets {
            let p = polygon(flip(pts), map)
            p.lineWidth = CGFloat(gap * k * scale)
            p.lineJoinStyle = .round
            p.stroke()
        }
        polygon(flip(eye), map).fill()
    }
    NSGraphicsContext.restoreGraphicsState()

    let image = NSImage(size: rect.size)
    image.addRepresentation(rep)
    NSGraphicsContext.saveGraphicsState()
    if glow {
        let shadow = NSShadow()
        shadow.shadowColor = teal.withAlphaComponent(0.45)
        shadow.shadowBlurRadius = rect.width * 0.06
        shadow.shadowOffset = .zero
        shadow.set()
    }
    image.draw(in: rect)
    NSGraphicsContext.restoreGraphicsState()
}

// ---------------------------------------------------------------- rendering

enum Kind { case background, foreground, square, round }

func bitmap(_ w: Int, _ h: Int, _ draw: (NSRect) -> Void) -> Data {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
                               samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    draw(NSRect(x: 0, y: 0, width: w, height: h))
    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])!
}

/// The stag's box, `w` wide, centred in `full` (its height follows the drawing's proportions).
func stagBox(_ full: NSRect, width w: CGFloat) -> NSRect {
    let h = w * CGFloat((box.y1 - box.y0) / (box.x1 - box.x0))
    return NSRect(x: full.midX - w / 2, y: full.midY - h / 2, width: w, height: h)
}

func render(_ px: Int, _ kind: Kind) -> Data {
    bitmap(px, px) { full in
        let s = full.width
        switch kind {
        case .background:
            drawMatrix(full)
        case .foreground:
            // Adaptive layers are 108dp; launchers show the central ~72dp and only a 66dp circle is guaranteed,
            // and the launch screen crops to a circle two thirds wide. 0.5 keeps the antler tips inside it.
            drawStag(stagBox(full, width: s * 0.5))
        case .square, .round:
            let clip = kind == .square ? NSBezierPath(roundedRect: full, xRadius: s * 0.22, yRadius: s * 0.22) : NSBezierPath(ovalIn: full)
            clip.addClip()
            // Legacy icons show the whole thing, so zoom the 108dp layer to its visible 72dp centre.
            drawMatrix(full.insetBy(dx: -s * 0.25, dy: -s * 0.25))
            drawStag(stagBox(full, width: s * (kind == .round ? 0.72 : 0.78)))
        }
    }
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

// Launch images: the stag centred on the dark background, at the size of each existing splash.png.
let fm = FileManager.default
for folder in (try! fm.contentsOfDirectory(atPath: resDir)).filter({ $0.hasPrefix("drawable") }) {
    let path = "\(resDir)/\(folder)/splash.png"
    guard fm.fileExists(atPath: path), let old = NSImageRep(contentsOfFile: path) else { continue }
    try! bitmap(old.pixelsWide, old.pixelsHigh) { full in
        bg.setFill()
        full.fill()
        drawStag(stagBox(full, width: min(full.width, full.height) * 0.42))
    }.write(to: URL(fileURLWithPath: path))
}

try! render(512, .square).write(to: URL(fileURLWithPath: "\(previewDir)/icon-512.png"))
try! render(96, .round).write(to: URL(fileURLWithPath: "\(previewDir)/icon-96-round.png"))
try! render(48, .square).write(to: URL(fileURLWithPath: "\(previewDir)/icon-48.png"))
// What the Android 12+ launch screen shows: the foreground layer on the dark background, cropped to a circle.
try! bitmap(432, 432) { full in
    bg.setFill()
    full.fill()
    NSBezierPath(ovalIn: full.insetBy(dx: full.width / 6, dy: full.width / 6)).addClip()
    rgb(0x161A20).setFill()
    full.fill()
    drawStag(stagBox(full, width: full.width * 0.5))
}.write(to: URL(fileURLWithPath: "\(previewDir)/launch-screen.png"))
print("icons and launch images written")
