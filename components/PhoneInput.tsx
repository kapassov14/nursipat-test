"use client"

import { Input } from "@/components/ui/input"
import { formatPhone } from "@/lib/phoneMask"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value: string
  onChange: (value: string) => void
}

/** Поле телефона с маской +7 (___) ___-__-__ */
export function PhoneInput({ value, onChange, className, ...props }: PhoneInputProps) {
  return (
    <Input
      {...props}
      className={cn(className)}
      type="tel"
      placeholder="+7 (___) ___-__-__"
      value={value}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      maxLength={18}
    />
  )
}
