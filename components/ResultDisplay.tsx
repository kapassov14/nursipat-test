"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResultDisplayProps {
  name: string
  age: number
  phone: string
  topPsychotypes: { name: string; percent: number }[]
  mainArchetype: string
  archetypePercent: number
}

/** Блок отображения результатов: данные сессии, ТОП-3 психотипа, основной архетип */
export function ResultDisplay({
  name,
  age,
  phone,
  topPsychotypes,
  mainArchetype,
  archetypePercent,
}: ResultDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Имя:</span> {name}
          </p>
          <p>
            <span className="font-medium text-foreground">Возраст:</span> {age}
          </p>
          <p>
            <span className="font-medium text-foreground">Телефон:</span> {phone}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Психотипы</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1">
            {topPsychotypes.map((p) => (
              <li key={p.name}>
                <span className="font-medium">{p.name}:</span> {p.percent.toFixed(2)}%
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Архетип</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            <span className="font-medium text-primary">{mainArchetype}</span>
            <span className="text-muted-foreground"> — {archetypePercent.toFixed(2)}%</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
