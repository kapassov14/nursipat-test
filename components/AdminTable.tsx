"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface AdminSessionRow {
  id: string
  name: string
  age: number
  phone: string
  gender: string
  createdAt: string
  top3Psychotypes: { name: string; percent: number }[]
  mainArchetype: string
}

interface AdminTableProps {
  sessions: AdminSessionRow[]
}

/** Таблица сессий в админ-панели */
export function AdminTable({ sessions }: AdminTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Возраст</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Пол</TableHead>
            <TableHead>Дата прохождения</TableHead>
            <TableHead>ТОП-3 психотипа + архетип</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs">{s.id.slice(0, 8)}…</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.age}</TableCell>
              <TableCell>{s.phone}</TableCell>
              <TableCell>{s.gender === "male" ? "Мужской" : "Женский"}</TableCell>
              <TableCell>{new Date(s.createdAt).toLocaleString("ru-RU")}</TableCell>
              <TableCell className="text-sm">
                {s.top3Psychotypes.map((p) => `${p.name} ${p.percent.toFixed(0)}%`).join(", ")}
                {s.mainArchetype !== "—" && ` • Архетип: ${s.mainArchetype}`}
              </TableCell>
              <TableCell>
                <Link href={`/admin/session/${s.id}`}>
                  <Button variant="ghost" size="sm">
                    Детали
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sessions.length === 0 && (
        <p className="p-6 text-center text-muted-foreground">Нет сессий</p>
      )}
    </div>
  )
}
