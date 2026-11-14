import AppKit
import CoreImage
import CoreImage.CIFilterBuiltins
import Vision

// Usage: swift scripts/profile-art.swift design/profile-photo.jpg public/assets/profile-art.jpg
// (the original photo is kept in design/, which is not published with the site)
// Turns the profile photo into a flat, illustrated portrait: the person is cut out (on this Mac, with
// Apple's Vision framework; nothing is uploaded), smoothed into flat
// tones painted from the site's palette, and placed on a plain studio backdrop.
let input = CommandLine.arguments[1]
let output = CommandLine.arguments[2]
let levels = CommandLine.arguments.count > 3 ? Double(CommandLine.arguments[3])! : 6

guard let source = CIImage(contentsOf: URL(fileURLWithPath: input)) else { fatalError("Cannot read \(input)") }
let extent = source.extent
let context = CIContext()

// 1. Where the person is: a soft-edged mask.
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(ciImage: source).perform([request])
guard let buffer = request.results?.first?.pixelBuffer else { fatalError("No person found in the photo") }
var mask = CIImage(cvPixelBuffer: buffer)
mask = mask.transformed(by: CGAffineTransform(scaleX: extent.width / mask.extent.width, y: extent.height / mask.extent.height))
mask = mask.applyingGaussianBlur(sigma: 1.2).cropped(to: extent)

// 2. Flat tones: remove fine detail, turn the photo into a few steps of light and dark, then paint each
//    step with one colour from a small palette (ink, slate, teal, mint, paper). Mapping tones to a fixed
//    palette is what makes it read as a drawing; posterising the original colours looks garish instead.
var tones = source
    .applyingFilter("CIPhotoEffectMono")
    .applyingFilter("CIGammaAdjust", parameters: ["inputPower": 0.5])
    .applyingFilter("CIColorControls", parameters: [kCIInputContrastKey: 1.2, kCIInputBrightnessKey: 0.04])
for _ in 0..<5 { tones = tones.applyingFilter("CIMedianFilter") }
tones = tones.applyingGaussianBlur(sigma: 1.4).cropped(to: extent)
tones = tones.applyingFilter("CIColorPosterize", parameters: ["inputLevels": levels])
tones = tones.applyingGaussianBlur(sigma: 0.7).cropped(to: extent) // soften the stair-stepped edges

let palette: [(CGFloat, CGFloat, CGFloat)] = [
    (0.07, 0.09, 0.13), // ink
    (0.12, 0.23, 0.29), // deep slate
    (0.10, 0.42, 0.42), // dark teal
    (0.25, 0.64, 0.60), // teal
    (0.63, 0.86, 0.82), // mint
    (0.93, 0.97, 0.96), // paper
]
// A 256×1 strip that runs through the palette; CIColorMap looks each grey level up in it.
let strip = CGContext(data: nil, width: 256, height: 1, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
let colours = palette.map { CGColor(srgbRed: $0.0, green: $0.1, blue: $0.2, alpha: 1) } as CFArray
let ramp = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB)!, colors: colours, locations: nil)!
strip.drawLinearGradient(ramp, start: .zero, end: CGPoint(x: 256, y: 0), options: [])
var art = tones.applyingFilter("CIColorMap", parameters: ["inputGradientImage": CIImage(cgImage: strip.makeImage()!)]).cropped(to: extent)

// 4. A plain studio backdrop in the site's teal and indigo, lighter behind the head.
let backdrop = CIFilter.radialGradient()
backdrop.center = CGPoint(x: extent.width * 0.58, y: extent.height * 0.55)
backdrop.radius0 = Float(extent.width * 0.08)
backdrop.radius1 = Float(extent.width * 0.78)
backdrop.color0 = CIColor(red: 0.90, green: 0.92, blue: 0.98)
backdrop.color1 = CIColor(red: 0.60, green: 0.63, blue: 0.90)
let background = backdrop.outputImage!.cropped(to: extent)

// 5. Person over backdrop.
let blend = CIFilter.blendWithMask()
blend.inputImage = art
blend.backgroundImage = background
blend.maskImage = mask
var result = blend.outputImage!.cropped(to: extent)

// 6. Reframe on the head and shoulders: the person stands low and to the right in the photo.
let side = extent.width * 0.9
let frame = CGRect(x: extent.width - side, y: 0, width: side, height: side)
result = result.cropped(to: frame)
    .transformed(by: CGAffineTransform(translationX: -frame.minX, y: -frame.minY))
    .transformed(by: CGAffineTransform(scaleX: extent.width / side, y: extent.height / side))

let space = CGColorSpace(name: CGColorSpace.sRGB)!
try context.writeJPEGRepresentation(of: result, to: URL(fileURLWithPath: output), colorSpace: space, options: [kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: 0.9])
print("Wrote \(output) (\(Int(extent.width))×\(Int(extent.height)))")
