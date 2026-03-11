"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ProgressBar"
import { Question } from "@/components/Question"
import { useSessionStore } from "@/store/sessionStore"
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/questions"
import type { AnswerOption } from "@/lib/constants"
import { calculateResult, validateAnswersLength } from "@/lib/scoring"

const SAVE_EVERY_N = 10

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { sessionId: storeSessionId, answers, setAnswer, setAnswers, setSessionId } = useSessionStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Синхронизация сессии: подгрузить ответы с API и обновить store
  useEffect(() => {
    setSessionId(sessionId)
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.answers && Array.isArray(data.answers)) {
          setAnswers(data.answers as AnswerOption[])
        }
      })
      .finally(() => setLoading(false))
  }, [sessionId, setSessionId, setAnswers])

  const saveProgress = useCallback(
    async (newAnswers: AnswerOption[]) => {
      setSaving(true)
      try {
        await fetch(`/api/sessions/${sessionId}/answers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        })
      } finally {
        setSaving(false)
      }
    },
    [sessionId]
  )

  // Автосохранение каждые 10 вопросов и при нажатии «Назад»
  useEffect(() => {
    if (loading || answers.length === 0) return
    const filled = answers.filter((a) => a !== undefined).length
    if (filled > 0 && (filled % SAVE_EVERY_N === 0 || currentIndex < filled - 1)) {
      saveProgress(answers)
    }
  }, [currentIndex, answers, loading])

  const handleAnswer = (value: AnswerOption) => {
    setAnswer(currentIndex, value)
  }

  const handleNext = () => {
    if (currentIndex >= TOTAL_QUESTIONS - 1) {
      // Завершить: сохранить ответы, посчитать результат, сохранить result, редирект
      const finalAnswers = [...answers]
      while (finalAnswers.length < TOTAL_QUESTIONS) finalAnswers.push(0)
      const capped = finalAnswers.slice(0, TOTAL_QUESTIONS) as AnswerOption[]
      if (!validateAnswersLength(capped)) {
        alert("Ответьте на все вопросы.")
        return
      }
      setSaving(true)
      const result = calculateResult(capped)
      fetch(`/api/sessions/${sessionId}/answers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: capped }),
      })
        .then(() =>
          fetch(`/api/sessions/${sessionId}/result`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              result: {
                psychotypes: result.psychotypes,
                archetypes: result.archetypes,
              },
            }),
          })
        )
        .then(() => {
          setAnswers(capped)
          router.push(`/results/${sessionId}`)
        })
        .catch(() => alert("Ошибка сохранения"))
        .finally(() => setSaving(false))
    } else {
      setCurrentIndex((i) => i + 1)
      const nextAnswers = [...answers]
      while (nextAnswers.length <= currentIndex + 1) nextAnswers.push(0)
      if ((currentIndex + 2) % SAVE_EVERY_N === 0) {
        saveProgress(nextAnswers as AnswerOption[])
      }
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      saveProgress(answers)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </main>
    )
  }

  const question = QUESTIONS[currentIndex]
  const currentAnswer = answers[currentIndex]

  return (
    <main className="min-h-screen bg-muted/30 py-6 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Question
            questionNumber={currentIndex + 1}
            total={TOTAL_QUESTIONS}
            text={question.text}
            value={currentAnswer}
            onChange={handleAnswer}
          />
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0 || saving}
          >
            Назад
          </Button>
          <Button
            onClick={handleNext}
            disabled={saving}
          >
            {currentIndex >= TOTAL_QUESTIONS - 1 ? "Завершить" : "Далее"}
          </Button>
        </div>
        {saving && (
          <p className="text-center text-sm text-muted-foreground">Сохранение...</p>
        )}
      </div>
    </main>
  )
}
