//色碼轉 rgb 值
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // 移除開頭的 #
  hex = hex.replace(/^#/, '')

  // 支援 #abc 或 #aabbcc
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  if (hex.length !== 6) return null

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  return { r, g, b }
}

//rgb 值轉色碼
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16) // <-- 先四捨五入
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const calcBeforeOpacityColor = (
  parentHex: string,
  opacity: number,
  targetHex: string
): string | null => {
  const parent = hexToRgb(parentHex)
  const target = hexToRgb(targetHex)

  if (!parent || !target) return null

  // 反推公式：C_child = (C_target - (1-α)*C_parent)/α
  const childR = (target.r - (1 - opacity) * parent.r) / opacity
  const childG = (target.g - (1 - opacity) * parent.g) / opacity
  const childB = (target.b - (1 - opacity) * parent.b) / opacity

  // clamp 0~255
  const clamp = (v: number) => Math.min(255, Math.max(0, v))

  return rgbToHex(clamp(childR), clamp(childG), clamp(childB))
}
