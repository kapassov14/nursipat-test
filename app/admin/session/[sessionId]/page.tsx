"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateResult } from "@/lib/scoring"
import type { AnswerOption, Gender } from "@/lib/constants"

interface SessionDetail {
  id: string
  name: string
  age: number
  phone: string
  gender: Gender
  answers: AnswerOption[] | null
  result: { psychotypes?: Record<string, number>; archetypes?: Record<string, number> } | null
  createdAt: string
}

export default function AdminSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Не найдено")
        return r.json()
      })
      .then(setSession)
      .catch(() => setError("Сессия не найдена"))
  }, [sessionId])

  if (error || (!session && session !== undefined)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">{error || "Загрузка..."}</p>
        <Link href="/admin">
          <Button variant="outline">К списку</Button>
        </Link>
      </main>
    )
  }

  if (!session) return null

  let psychotypes: Record<string, number> = {}
  let archetypes: Record<string, number> = {}
  if (session.answers && session.answers.length === 160) {
    const result = calculateResult(session.answers)
    psychotypes = result.psychotypes
    archetypes = result.archetypes
  } else if (session.result?.psychotypes && session.result?.archetypes) {
    psychotypes = session.result.psychotypes
    archetypes = session.result.archetypes
  }

  const psychEntries = Object.entries(psychotypes).sort((a, b) => b[1] - a[1])
  const archEntries = Object.entries(archetypes).sort((a, b) => b[1] - a[1])

  return (
    <main className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline">← К списку</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Данные сессии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="font-medium">ID:</span> {session.id}</p>
            <p><span className="font-medium">Имя:</span> {session.name}</p>
            <p><span className="font-medium">Возраст:</span> {session.age}</p>
            <p><span className="font-medium">Телефон:</span> {session.phone}</p>
            <p><span className="font-medium">Пол:</span> {session.gender === "male" ? "Мужской" : "Женский"}</p>
            <p><span className="font-medium">Дата:</span> {new Date(session.createdAt).toLocaleString("ru-RU")}</p>
            <p><span className="font-medium">Ответов:</span> {session.answers?.length ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Полный результат — все психотипы (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {psychEntries.map(([name, percent]) => (
                <li key={name}>
                  <span className="font-medium">{name}:</span> {percent.toFixed(2)}%
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Полный результат — все архетипы (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {archEntries.map(([name, percent]) => (
                <li key={name}>
                  <span className="font-medium">{name}:</span> {percent.toFixed(2)}%
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
