import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST: создать сессию (имя, возраст, телефон, пол)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, age, phone, gender } = body
    if (!name || typeof age !== "number" || !phone || !gender) {
      return NextResponse.json(
        { error: "Нужны name, age, phone, gender" },
        { status: 400 }
      )
    }
    const session = await prisma.testSession.create({
      data: {
        name: String(name),
        age: Number(age),
        phone: String(phone),
        gender: String(gender),
      },
    })
    return NextResponse.json({ id: session.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Ошибка создания сессии" }, { status: 500 })
  }
}
