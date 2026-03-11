// Zustand: состояние сессии (id, пол, ответы) для автосохранения
import { create } from "zustand"
import type { AnswerOption, Gender } from "@/lib/constants"

interface SessionState {
  sessionId: string | null
  gender: Gender | null
  answers: AnswerOption[]
  setSessionId: (id: string | null) => void
  setGender: (gender: Gender | null) => void
  setAnswer: (questionIndex: number, value: AnswerOption) => void
  setAnswers: (answers: AnswerOption[]) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  gender: null,
  answers: [],
  setSessionId: (sessionId) => set({ sessionId }),
  setGender: (gender) => set({ gender }),
  setAnswer: (questionIndex, value) =>
    set((state) => {
      const next = [...state.answers]
      next[questionIndex] = value
      return { answers: next }
    }),
  setAnswers: (answers) => set({ answers }),
  reset: () => set({ sessionId: null, gender: null, answers: [] }),
}))
