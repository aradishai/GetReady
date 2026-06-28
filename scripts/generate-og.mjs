import sharp from "sharp"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, "..")

const W = 1200
const H = 630
const BG = { r: 2, g: 5, b: 9 }

const logoPath = join(root, "public", "logo-getready.png")

// Load logo, flatten transparency onto dark bg, resize
const logoFlat = await sharp(logoPath)
  .flatten({ background: BG })
  .resize(520, 260, { fit: "inside", withoutEnlargement: false })
  .png()
  .toBuffer()

const logoMeta = await sharp(logoFlat).metadata()
const logoLeft = Math.round((W - logoMeta.width) / 2)
const logoTop = 120

// SVG text overlay — "A.Ishai Projects" with A and I in teal
const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text
    x="${W / 2}" y="510"
    font-family="Arial, Helvetica, sans-serif"
    font-size="58"
    font-weight="bold"
    text-anchor="middle"
    letter-spacing="2"
  >
    <tspan fill="#38bdf8">A</tspan><tspan fill="#f5f0e8">.</tspan><tspan fill="#38bdf8">I</tspan><tspan fill="#f5f0e8">shai Projects</tspan>
  </text>
</svg>`)

// Build dark background and composite
const bg = await sharp({
  create: { width: W, height: H, channels: 3, background: BG },
}).png().toBuffer()

await sharp(bg)
  .composite([
    { input: logoFlat, top: logoTop, left: logoLeft },
    { input: svg, top: 0, left: 0 },
  ])
  .jpeg({ quality: 92 })
  .toFile(join(root, "public", "og-image.jpg"))

console.log("og-image.jpg generated successfully")
