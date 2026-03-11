import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH: сохранить ответы (массив 0|1|2)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const body = await request.json()
  const answers = body.answers
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "Нужен массив answers" }, { status: 400 })
  }
  const session = await prisma.testSession.update({
    where: { id: sessionId },
    data: { answers },
  })
  return NextResponse.json({ ok: true, answers: session.answers })
}
