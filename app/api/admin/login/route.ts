import { NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123"

// POST: проверка логина/пароля, возврат токена (простой base64 для cookie)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { email, password } = body
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`admin:${ADMIN_EMAIL}`).toString("base64")
    const res = NextResponse.json({ ok: true, token })
    res.cookies.set("admin_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 })
    return res
  }
  return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 })
}
