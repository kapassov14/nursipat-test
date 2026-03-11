import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface PdfData {
  name: string
  age: number
  phone: string
  gender: "male" | "female"
  topPsychotypes: { name: string; percent: number }[]
  mainArchetype: string
  mainArchetypePercent: number
}

/** Генерация и скачивание PDF с результатами (шаблон с логотипом и оформлением) */
export function downloadResultsPdf(data: PdfData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  // Заголовок / логотип
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Психологический профайлинг", pageWidth / 2, 25, { align: "center" })
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.text("Результаты тестирования", pageWidth / 2, 32, { align: "center" })
  doc.setTextColor(0, 0, 0)

  // Линия под заголовком
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, 38, pageWidth - margin, 38)

  let y = 48

  // Данные
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Данные", margin, y)
  y += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Имя: ${data.name}`, margin, y)
  y += 6
  doc.text(`Возраст: ${data.age}`, margin, y)
  y += 6
  doc.text(`Телефон: ${data.phone}`, margin, y)
  y += 6
  doc.text(`Пол: ${data.gender === "male" ? "Мужской" : "Женский"}`, margin, y)
  y += 14

  // Психотипы
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Психотипы (ТОП-3)", margin, y)
  y += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const psychRows = data.topPsychotypes.map((p) => [p.name, `${p.percent.toFixed(2)}%`])
  autoTable(doc, {
    startY: y,
    head: [["Психотип", "Процент"]],
    body: psychRows,
    margin: { left: margin },
    theme: "plain",
    headStyles: { fontStyle: "bold" },
  })
  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } }
  y = (docWithTable.lastAutoTable?.finalY ?? y) + 14

  // Архетип
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Основной архетип", margin, y)
  y += 8
  doc.setFont("helvetica", "normal")
  doc.text(`${data.mainArchetype} — ${data.mainArchetypePercent.toFixed(2)}%`, margin, y)

  // Футер
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Сформировано: ${new Date().toLocaleString("ru-RU")}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  )

  doc.save(`results-${data.name.replace(/\s/g, "-")}-${Date.now()}.pdf`)
}