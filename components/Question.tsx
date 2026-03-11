"use client"

import { cn } from "@/lib/utils"
import type { AnswerOption } from "@/lib/constants"

const OPTIONS: { value: AnswerOption; label: string }[] = [
  { value: 0, label: "Нет, не согласен" },
  { value: 1, label: "Возможно" },
  { value: 2, label: "Да, согласен" },
]

interface QuestionProps {
  text: string
  value: AnswerOption | undefined
  onChange: (value: AnswerOption) => void
  questionNumber: number
  total: number
}

/** Один вопрос с тремя вариантами ответа в виде карточек */
export function Question({
  text,
  value,
  onChange,
  questionNumber,
  total,
}: QuestionProps) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-medium text-foreground">
        {questionNumber}. {text}
      </p>
      <div className="grid gap-3 sm:grid-cols-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md",
              value === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
