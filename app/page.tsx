"use client"

import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/PhoneInput"
import { useSessionStore } from "@/store/sessionStore"
import { preTestFormSchema, type PreTestFormValues } from "@/lib/validations"
import { getPhoneDigitsOnly } from "@/lib/phoneMask"
import { GENDERS } from "@/lib/constants"

export default function HomePage() {
  const router = useRouter()
  const setSessionId = useSessionStore((s) => s.setSessionId)
  const setGenderStore = useSessionStore((s) => s.setGender)
  const setAnswers = useSessionStore((s) => s.setAnswers)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<PreTestFormValues>({
    resolver: zodResolver(preTestFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      age: undefined as unknown as number,
      phone: "+7 ",
      gender: undefined,
    },
  })

  const onSubmit = async (data: PreTestFormValues) => {
    const phoneForDb = "+7" + getPhoneDigitsOnly(data.phone)
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        age: data.age,
        phone: phoneForDb,
        gender: data.gender,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err.error || "Ошибка создания сессии")
      return
    }
    const { id } = await res.json()
    setSessionId(id)
    setGenderStore(data.gender)
    setAnswers([]) // сброс ответов для новой сессии
    router.push(`/test/${id}`)
  }

  return (
    <main className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Психологический профайлинг</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Заполните данные перед началом теста
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  placeholder="Минимум 2 символа"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Возраст</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={80}
                  placeholder="18–80"
                  {...register("age", { valueAsNumber: true })}
                  className={errors.age ? "border-red-500" : ""}
                />
                {errors.age && (
                  <p className="text-sm text-red-600">{errors.age.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="phone"
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Пол</Label>
                <select
                  id="gender"
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.gender ? "border-red-500" : "border-input"
                  }`}
                  {...register("gender")}
                >
                  <option value="">Выберите пол</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!isValid}
              >
                Начать тест
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
