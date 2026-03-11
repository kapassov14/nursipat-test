import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: получить сессию по id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
  })
  if (!session) {
    return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 })
  }
  return NextResponse.json({
    id: session.id,
    name: session.name,
    age: session.age,
    phone: session.phone,
    gender: session.gender,
    answers: session.answers,
    result: session.result,
    createdAt: session.createdAt,
  })
}
