"use client"

import { usePathname } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} style={{ animation: "pageEnter 0.35s ease forwards" }}>
      {children}
    </div>
  )
}
