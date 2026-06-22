"use client"

import { useState, useEffect } from "react"

interface Props {
  onDismiss: () => void
}

export default function InstallModal({ onDismiss }: Props) {
  const [tab, setTab] = useState<"ios" | "android">("ios")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent
    if (/android/i.test(ua)) setTab("android")
    else setTab("ios")
    // Animate in
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  const IOS_STEPS = [
    { icon: "⬆️", text: 'לחץ על כפתור השיתוף בתחתית הדפדפן' },
    { icon: "📲", text: 'גלול מטה ובחר "הוסף למסך הבית"' },
    { icon: "✅", text: 'לחץ "הוסף" בחלון שנפתח' },
  ]

  const ANDROID_STEPS = [
    { icon: "⋮", text: 'לחץ על שלוש הנקודות (⋮) בפינה הימנית העליונה' },
    { icon: "📲", text: 'בחר "הוסף למסך הבית"' },
    { icon: "✅", text: 'לחץ "הוסף" לאישור' },
  ]

  const steps = tab === "ios" ? IOS_STEPS : ANDROID_STEPS

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        transition: "opacity 0.3s",
        opacity: visible ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(160deg, #0d1829 0%, #070d1a 100%)",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 40px",
          boxShadow: "0 -8px 60px rgba(56,189,248,0.15)",
          transform: visible ? "translateY(0)" : "translateY(80px)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 4, margin: "0 auto 24px" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-getready.png" alt="GetReady" style={{ height: 52, width: "auto", marginBottom: 12 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
            הוסף את GetReady למסך הבית
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 6 }}>
            גישה מהירה בלחיצה אחת, בדיוק כמו אפליקציה
          </p>
        </div>

        {/* OS Tabs */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          gap: 4,
        }}>
          {(["ios", "android"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background: tab === t ? "rgba(56,189,248,0.15)" : "transparent",
                color: tab === t ? "#38bdf8" : "rgba(255,255,255,0.4)",
                fontSize: 14,
                fontWeight: tab === t ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t === "ios" ? "🍎  iPhone / iPad" : "🤖  Android"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(56,189,248,0.12)",
                border: "1.5px solid rgba(56,189,248,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          style={{
            width: "100%",
            padding: "15px",
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(56,189,248,0.3)",
          }}
        >
          הבנתי, המשך להתחברות
        </button>
      </div>
    </div>
  )
}
