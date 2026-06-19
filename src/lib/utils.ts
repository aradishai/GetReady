import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLevelName(level: number): string {
  if (level <= 2) return "מתחיל"
  if (level <= 5) return "בינוני"
  if (level <= 10) return "מתקדם"
  if (level <= 20) return "מומחה"
  return "אגדה"
}

export function getXpForNextLevel(level: number): number {
  return level * 500
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("he-IL")
}
