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

// GET: экспорт сессий в CSV с фильтрами
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
  if (name) where.name = { contains: name, mode: "insensitive" }
  if (phone) where.phone = { contains: phone }

  const sessions = await prisma.testSession.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  const rows: string[][] = [
    [
      "ID",
      "Имя",
      "Возраст",
      "Телефон",
      "Дата",
      "Пол",
      "Психотип 1",
      "%1",
      "Психотип 2",
      "%2",
      "Психотип 3",
      "%3",
      "Архетип",
    ],
  ]

  for (const s of sessions) {
    let p1 = "",
      p2 = "",
      p3 = "",
      pc1 = "",
      pc2 = "",
      pc3 = "",
      arch = "—"
    if (s.answers && Array.isArray(s.answers) && (s.answers as AnswerOption[]).length === 160) {
      const result = calculateResult(s.answers as AnswerOption[])
      const [a, b, c] = result.top3Psychotypes
      p1 = a?.name ?? ""
      pc1 = a?.percent.toFixed(2) ?? ""
      p2 = b?.name ?? ""
      pc2 = b?.percent.toFixed(2) ?? ""
      p3 = c?.name ?? ""
      pc3 = c?.percent.toFixed(2) ?? ""
      const picked = pickMainArchetypeByGender(result.archetypes, s.gender as "male" | "female" | null)
      arch = picked.name
    } else if (s.result && typeof s.result === "object") {
      const r = s.result as { psychotypes?: Record<string, number>; archetypes?: Record<string, number> }
      const top3 = r.psychotypes
        ? Object.entries(r.psychotypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
        : []
      const [a, b, c] = top3
      p1 = a?.[0] ?? ""
      pc1 = a?.[1].toFixed(2) ?? ""
      p2 = b?.[0] ?? ""
      pc2 = b?.[1].toFixed(2) ?? ""
      p3 = c?.[0] ?? ""
      pc3 = c?.[1].toFixed(2) ?? ""
      if (r.archetypes) {
        const picked = pickMainArchetypeByGender(r.archetypes, s.gender as "male" | "female" | null)
        arch = picked.name
      }
    }
    rows.push([
      s.id,
      s.name,
      String(s.age),
      s.phone,
      s.createdAt.toISOString(),
      s.gender,
      p1,
      pc1,
      p2,
      pc2,
      p3,
      pc3,
      arch,
    ])
  }

  const BOM = "\uFEFF"
  const csv = BOM + rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sessions-${Date.now()}.csv"`,
    },
  })
}
