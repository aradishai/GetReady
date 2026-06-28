import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "GetReady — תקופת בחינות? תגיעי ל-100 💯",
  description: "תרגול חכם, מבחנים אמיתיים ושאלות מכל הנושאים — פסיכולוגיה, ארגונים, חברה ועוד. קצר, ברור, ומסביר הכל.",
  openGraph: {
    title: "GetReady — תקופת בחינות? תגיעי ל-100 💯",
    description: "תרגול חכם, מבחנים אמיתיים ושאלות מכל הנושאים — פסיכולוגיה, ארגונים, חברה ועוד. קצר, ברור, ומסביר הכל.",
    url: "https://getready-production.up.railway.app/share",
    siteName: "GetReady",
    images: [
      {
        url: "https://getready-production.up.railway.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GetReady — A.Ishai Projects",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://getready-production.up.railway.app/og-image.jpg"],
  },
}

export default async function SharePage() {
  const session = await auth()
  redirect(session ? "/dashboard" : "/register")
}
