import type { Metadata, Viewport } from "next"
import { Varela_Round } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"
import Navbar from "@/components/Navbar"
import PageTransition from "@/components/PageTransition"
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "GetReady",
  description: "תקופת בחינות? GetReady תכין אותך לכל שאלה. תרגול חכם, מבחנים אמיתיים ושאלות מכל הנושאים כדי שתגיעי ל-100.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GetReady",
  },
  openGraph: {
    title: "GetReady — תקופת בחינות? תגיעי ל-100 💯",
    description: "תרגול חכם, מבחנים אמיתיים ושאלות מכל הנושאים — פסיכולוגיה, ארגונים, חברה ועוד. קצר, ברור, ומסביר הכל.",
    url: "https://getready-production.up.railway.app",
    siteName: "GetReady",
    images: [
      {
        url: "https://getready-production.up.railway.app/og-image.webp",
        width: 1200,
        height: 630,
        alt: "GetReady — A.Ishai Projects",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetReady — תקופת בחינות? תגיעי ל-100 💯",
    description: "תרגול חכם, מבחנים אמיתיים ושאלות מכל הנושאים — פסיכולוגיה, ארגונים, חברה ועוד. קצר, ברור, ומסביר הכל.",
    images: ["https://getready-production.up.railway.app/og-image.webp"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#020509",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={varelaRound.className}>
      <head>
        <link rel="apple-touch-icon" href="/api/pwa-icon" />
      </head>
      <body>
        <SessionProvider>
          <ServiceWorkerRegister />
          <Navbar />
          <main style={{ paddingBottom: 16 }}>
            <PageTransition>{children}</PageTransition>
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
