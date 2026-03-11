/**
 * Подсчёт баллов по ответам и нормализация в проценты (0–100%).
 * Возвращает:
 * - полные проценты по психотипам и архетипам,
 * - ТОП-3 психотипа,
 * - а также вспомогательную функцию выбора основного архетипа по полу.
 */
import { QUESTIONS } from "./questions"
import {
  PSYCHOTYPES,
  ARCHETYPES as ARCHETYPES_RAW,
  type AnswerOption,
  type Gender,
  MALE_ARCHETYPES as MALE_RAW,
  FEMALE_ARCHETYPES as FEMALE_RAW,
} from "./constants"

const TOTAL_QUESTIONS = QUESTIONS.length

function sumScores(
  answers: AnswerOption[],
  weightKey: "psychotypeWeights" | "archetypeWeights"
): Record<string, number> {
  const sums: Record<string, number> = {}
  QUESTIONS.forEach((q, i) => {
    const ans = answers[i]
    if (ans === undefined) return
    const weights = q[weightKey]
    Object.keys(weights).forEach((name) => {
      if (!sums[name]) sums[name] = 0
      const w = weights[name][ans]
      sums[name] += w
    })
  })
  return sums
}

/** Нормализация в 0–100% (линейная: min -> 0, max -> 100) */
function normalizeToPercent(scores: Record<string, number>): Record<string, number> {
  const values = Object.values(scores)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const out: Record<string, number> = {}
  Object.entries(scores).forEach(([k, v]) => {
    out[k] = ((v - min) / range) * 100
  })
  return out
}

export interface FullResult {
  psychotypes: Record<string, number>
  archetypes: Record<string, number>
  top3Psychotypes: { name: string; percent: number }[]
}

export function calculateResult(answers: AnswerOption[]): FullResult {
  const psychoScores = sumScores(answers, "psychotypeWeights")
  const archetypeScores = sumScores(answers, "archetypeWeights")
  const psychPercent = normalizeToPercent(psychoScores)
  const archetypePercent = normalizeToPercent(archetypeScores)

  const top3 = (Object.entries(psychPercent) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, percent]) => ({ name, percent }))

  return {
    psychotypes: psychPercent,
    archetypes: archetypePercent,
    top3Psychotypes: top3,
  }
}

/** Сделаем массивы архетипов литеральными для TypeScript */
const MALE_ARCHETYPES = MALE_RAW as readonly (typeof MALE_RAW[number])[]
const FEMALE_ARCHETYPES = FEMALE_RAW as readonly (typeof FEMALE_RAW[number])[]
const ARCHETYPES = ARCHETYPES_RAW as readonly (typeof ARCHETYPES_RAW[number])[]

/** Выбор основного архетипа по полу пользователя (из заданных списков). */
export function pickMainArchetypeByGender(
  archetypePercent: Record<string, number>,
  gender: Gender | null | undefined
): { name: string; percent: number } {
  const list =
    gender === "male"
      ? MALE_ARCHETYPES
      : gender === "female"
      ? FEMALE_ARCHETYPES
      : ARCHETYPES

  const candidates = Object.entries(archetypePercent).filter(([name]) =>
    list.includes(name as (typeof list)[number])
  )

  if (candidates.length === 0) {
    const [fallbackName, fallbackPercent] =
      (Object.entries(archetypePercent) as [string, number][]).sort((a, b) => b[1] - a[1])[0] ??
      ["—", 0]
    return { name: fallbackName, percent: fallbackPercent }
  }

  const [name, percent] = candidates.sort((a, b) => b[1] - a[1])[0]
  return { name, percent }
}

export function validateAnswersLength(answers: AnswerOption[]): boolean {
  return answers.length === TOTAL_QUESTIONS && answers.every((a) => [0, 1, 2].includes(a))
}