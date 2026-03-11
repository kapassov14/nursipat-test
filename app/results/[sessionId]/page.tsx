"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ResultDisplay } from "@/components/ResultDisplay"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateResult, pickMainArchetypeByGender } from "@/lib/scoring"
import type { AnswerOption, Gender } from "@/lib/constants"
import { downloadResultsPdf } from "@/lib/pdf"
import Link from "next/link"

interface SessionData {
  id: string
  name: string
  age: number
  phone: string
  gender: Gender
  answers: AnswerOption[] | null
  result: { psychotypes?: Record<string, number>; archetypes?: Record<string, number> } | null
}

export default function ResultsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Сессия не найдена")
        return r.json()
      })
      .then((data) => setSession(data))
      .catch(() => setError("Сессия не найдена"))
  }, [sessionId])

  if (error || !session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">{error || "Загрузка..."}</p>
        <Link href="/">
          <Button variant="outline">На главную</Button>
        </Link>
      </main>
    )
  }

  // Результат: либо из БД (полный), либо пересчитать из answers для отображения ТОП-3 и архетипа
  let top3Psychotypes: { name: string; percent: number }[] = []
  let mainArchetype = "—"
  let mainArchetypePercent = 0

  if (session.answers && session.answers.length === 160) {
    const result = calculateResult(session.answers as AnswerOption[])
    top3Psychotypes = result.top3Psychotypes
    const picked = pickMainArchetypeByGender(result.archetypes, session.gender)
    mainArchetype = picked.name
    mainArchetypePercent = picked.percent
  } else if (session.result?.psychotypes && session.result?.archetypes) {
    const psych = session.result.psychotypes
    top3Psychotypes = Object.entries(psych)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, percent]) => ({ name, percent }))
    const arch = session.result.archetypes
    const picked = pickMainArchetypeByGender(arch, session.gender)
    mainArchetype = picked.name
    mainArchetypePercent = picked.percent
  }

  const handlePdf = () => {
    downloadResultsPdf({
      name: session.name,
      age: session.age,
      phone: session.phone,
      gender: session.gender,
      topPsychotypes: top3Psychotypes,
      mainArchetype,
      mainArchetypePercent,
    })
  }

  const shareText = `Психологический профайлинг — результаты\nИмя: ${session.name}\nПсихотипы: ${top3Psychotypes.map((p) => `${p.name} ${p.percent.toFixed(0)}%`).join(", ")}\nАрхетип: ${mainArchetype} (${mainArchetypePercent.toFixed(0)}%)`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <main className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-lg space-y-6">
        <ResultDisplay
          name={session.name}
          age={session.age}
          phone={session.phone}
          topPsychotypes={top3Psychotypes}
          mainArchetype={mainArchetype}
          archetypePercent={mainArchetypePercent}
        />
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={handlePdf} variant="outline" className="w-full">
              Скачать PDF
            </Button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                Поделиться в WhatsApp
              </Button>
            </a>
            <Link href="/">
              <Button variant="secondary" className="w-full">
                На главную
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
