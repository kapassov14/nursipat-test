import { z } from "zod"
import { isValidPhone } from "./phoneMask"
import { GENDERS } from "./constants"

// Схема формы перед тестом
export const preTestFormSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  age: z.number().min(18, "Возраст от 18").max(80, "Возраст до 80"),
  phone: z.string().refine(isValidPhone, "Введите 10 цифр после +7"),
  gender: z.enum(GENDERS, {
    errorMap: () => ({ message: "Выберите пол" }),
  }),
})

export type PreTestFormValues = z.infer<typeof preTestFormSchema>
