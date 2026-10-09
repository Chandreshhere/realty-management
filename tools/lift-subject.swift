import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit

// Usage: liftsubject <input> <output.png>
// Lifts every foreground instance with Vision and writes a transparent PNG.
let args = CommandLine.arguments
guard args.count == 3 else { print("usage: liftsubject in out.png"); exit(1) }
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])

guard let ciImage = CIImage(contentsOf: inURL) else { print("cannot read"); exit(1) }
let handler = VNImageRequestHandler(ciImage: ciImage)
let request = VNGenerateForegroundInstanceMaskRequest()
do { try handler.perform([request]) } catch { print("vision error: \(error)"); exit(1) }
guard let result = request.results?.first else { print("no subject found"); exit(2) }

do {
    let buffer = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
    let masked = CIImage(cvPixelBuffer: buffer)
    let ctx = CIContext()
    guard let cs = CGColorSpace(name: CGColorSpace.sRGB) else { exit(1) }
    try ctx.writePNGRepresentation(of: masked, to: outURL, format: .RGBA8, colorSpace: cs)
    print("ok \(result.allInstances.count) instances")
} catch { print("mask error: \(error)"); exit(1) }
