// Маска телефона +7 (___) ___-__-__
const PREFIX = "+7 "
const LENGTH = 10 // цифр после +7

/**
 * Форматирует ввод в вид +7 (XXX) XXX-XX-XX без дублирования цифр.
 * Работает только с локальной частью (10 цифр после кода страны).
 */
export function formatPhone(value: string): string {
  // Оставляем только цифры
  const onlyDigits = value.replace(/\D/g, "")
  if (!onlyDigits) return ""

  // Убираем ведущую 7 или 8 (код страны), чтобы не дублировать семёрку из префикса "+7 "
  const withoutCountryCode =
    onlyDigits.startsWith("7") || onlyDigits.startsWith("8")
      ? onlyDigits.slice(1)
      : onlyDigits

  // Максимум 10 цифр — локальная часть номера
  const digits =
    withoutCountryCode.length > LENGTH
      ? withoutCountryCode.slice(-LENGTH)
      : withoutCountryCode

  const len = Math.min(digits.length, LENGTH)
  const res: string[] = []

  res.push(PREFIX)

  // Код города / первые 3 цифры: (XXX
  if (len >= 1) {
    res.push("(")
    res.push(digits.slice(0, Math.min(3, len)))
  }
  if (len >= 3) {
    res.push(") ")
  }

  // Следующие 3 цифры: XXX
  if (len > 3) {
    res.push(digits.slice(3, Math.min(6, len)))
  }

  // Первые 2 цифры после дефиса: -XX
  if (len > 6) {
    res.push("-")
    res.push(digits.slice(6, Math.min(8, len)))
  }

  // Последние 2 цифры: -XX
  if (len > 8) {
    res.push("-")
    res.push(digits.slice(8, len))
  }

  return res.join("")
}

/** Возвращает только локальные 10 цифр (без кода страны 7/8). */
export function parsePhone(masked: string): string {
  let digits = masked.replace(/\D/g, "")
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1)
  return digits.slice(0, LENGTH)
}

export function getPhoneDigitsOnly(masked: string): string {
  return parsePhone(masked)
}

export function isValidPhone(masked: string): boolean {
  return getPhoneDigitsOnly(masked).length === LENGTH
}