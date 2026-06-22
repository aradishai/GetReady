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
  description: "למד, תתחרה, תנצח",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GetReady",
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
