import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Study Arena | זירת המבחן",
  description: "למד, תתחרה, תנצח",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
