function pad2(n) {
  return String(n).padStart(2, '0')
}

export function formatSlotLabel(hour) {
  const h = Number(hour)
  if (!Number.isInteger(h) || h < 0 || h > 23) return ''
  const next = (h + 1) % 24
  return `${pad2(h)}:00 - ${pad2(next)}:00`
}

export const SLOT_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  value: String(h),
  label: formatSlotLabel(h),
}))
