"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { AdminTable, type AdminSessionRow } from "@/components/AdminTable"

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<AdminSessionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/sessions", { credentials: "include" })
    if (res.ok) {
      setLoggedIn(true)
      const data = await res.json()
      setSessions(data)
    } else {
      setLoggedIn(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setLoggedIn(true)
        checkAuth()
      } else {
        setError(data.error || "Ошибка входа")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (nameFilter) params.set("name", nameFilter)
      if (phoneFilter) params.set("phone", phoneFilter)
      const res = await fetch(`/api/admin/sessions?${params}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const params = new URLSearchParams()
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    if (nameFilter) params.set("name", nameFilter)
    if (phoneFilter) params.set("phone", phoneFilter)
    window.open(`/api/admin/export?${params}`, "_blank")
  }

  if (loggedIn === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Проверка доступа...</p>
      </main>
    )
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Вход в админ-панель</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">{error}</Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Логин (email)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Админ-панель — Сессии</h1>
          <Link href="/">
            <Button variant="outline">На главную</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label>Дата от</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Дата до</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Имя</Label>
              <Input
                placeholder="Поиск по имени"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Телефон</Label>
              <Input
                placeholder="Поиск по телефону"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} disabled={loading}>
                Применить
              </Button>
              <Button variant="outline" onClick={exportCsv}>
                Экспорт CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <AdminTable sessions={sessions} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
