import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const logoPath = path.join(process.cwd(), "public", "logo-getready.png")
  const logoBase64 = fs.readFileSync(logoPath).toString("base64")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#020509"/>
  <image href="data:image/png;base64,${logoBase64}" x="56" y="56" width="400" height="400" preserveAspectRatio="xMidYMid meet"/>
</svg>`

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
