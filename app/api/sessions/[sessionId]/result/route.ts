import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH: сохранить результат (полный JSON: psychotypes, archetypes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const body = await request.json()
  const result = body.result
  if (!result || typeof result !== "object") {
    return NextResponse.json({ error: "Нужен объект result" }, { status: 400 })
  }
  await prisma.testSession.update({
    where: { id: sessionId },
    data: { result },
  })
  return NextResponse.json({ ok: true })
}
