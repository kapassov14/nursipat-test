import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateResult, pickMainArchetypeByGender } from "@/lib/scoring"
import type { AnswerOption } from "@/lib/constants"

function getAdminToken(request: NextRequest): string | null {
  return request.cookies.get("admin_token")?.value ?? null
}

function isAdmin(request: NextRequest): boolean {
  const token = getAdminToken(request)
  if (!token) return false
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    return decoded.startsWith("admin:")
  } catch {
    return false
  }
}

// GET: список сессий с фильтрами (dateFrom, dateTo, name, phone)
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const name = searchParams.get("name")
  const phone = searchParams.get("phone")

  const where: Record<string, unknown> = {}
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom)
    if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo)
  }
  if (name) {
    where.name = { contains: name, mode: "insensitive" }
  }
  if (phone) {
    where.phone = { contains: phone }
  }

  const sessions = await prisma.testSession.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Для каждой сессии вычислить ТОП-3 и архетип (из result или из answers)
  const list = sessions.map((s) => {
    let top3: { name: string; percent: number }[] = []
    let mainArchetype = "—"
    if (s.answers && Array.isArray(s.answers) && (s.answers as AnswerOption[]).length === 160) {
      const result = calculateResult(s.answers as AnswerOption[])
      top3 = result.top3Psychotypes
      const picked = pickMainArchetypeByGender(result.archetypes, s.gender as "male" | "female" | null)
      mainArchetype = picked.name
    } else if (s.result && typeof s.result === "object") {
      const r = s.result as { psychotypes?: Record<string, number>; archetypes?: Record<string, number> }
      if (r.psychotypes) {
        top3 = Object.entries(r.psychotypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, percent]) => ({ name, percent }))
      }
      if (r.archetypes) {
        const picked = pickMainArchetypeByGender(r.archetypes, s.gender as "male" | "female" | null)
        mainArchetype = picked.name
      }
    }
    return {
      id: s.id,
      name: s.name,
      age: s.age,
      phone: s.phone,
      gender: s.gender,
      createdAt: s.createdAt,
      top3Psychotypes: top3,
      mainArchetype,
    }
  })

  return NextResponse.json(list)
}
