import type { Metadata } from "next"
import { Varela_Round } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"
import Navbar from "@/components/Navbar"

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Study Arena | זירת המבחן",
  description: "למד, תתחרה, תנצח",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={varelaRound.className}>
      <body>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
