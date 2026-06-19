import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const { fullName, email, lastFourDigits, note, courseId } = await req.json()

    if (!fullName || !email || !lastFourDigits) {
      return NextResponse.json({ error: "כל השדות חובה" }, { status: 400 })
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: session.user.id,
        courseId: courseId || null,
        fullName,
        email,
        lastFourDigits,
        note: note || null,
        status: "pending",
      },
    })

    // Send email notification
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `אישור תשלום חדש - Study Arena`,
        html: `
          <div dir="rtl" style="font-family: Arial; padding: 20px;">
            <h2>בקשת אישור תשלום חדשה</h2>
            <p><strong>שם:</strong> ${fullName}</p>
            <p><strong>מייל:</strong> ${email}</p>
            <p><strong>4 ספרות אחרונות:</strong> ${lastFourDigits}</p>
            <p><strong>הערה:</strong> ${note || "אין"}</p>
            <p><strong>User ID:</strong> ${session.user.id}</p>
            <hr/>
            <p>כדי לאשר את המשתמש, היכנס לאדמין פאנל ואשר אותו.</p>
          </div>
        `,
      })
    } catch {
      // Email failed silently - request still saved
    }

    return NextResponse.json({ success: true, requestId: paymentRequest.id })
  } catch {
    return NextResponse.json({ error: "שגיאה בשליחת הבקשה" }, { status: 500 })
  }
}
