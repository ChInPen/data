import { numeric, digit, noChinese } from './umatch'

export const thousandsMark = (text: string) => {
  // 加上千分符
  const minusMark = text.startsWith('-') ? '-' : ''
  const content = text.startsWith('-') ? text.substring(1) : text
  const parts = content.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return minusMark + parts.join('.')
}

export const numberFormat = (
  value: string | number,
  options?: {
    minus?: boolean
    decimal?: boolean
    decAfterN?: number
    thousands?: boolean
  }
): string => {
  let str = numeric.base(value)
  if (str === '') return ''
  // 判斷負數
  if (options?.minus !== true) {
    str = numeric.positive(str)
  }
  // 判斷整數
  if (options?.decimal !== true) {
    str = numeric.integer(str)
  }
  // 判斷小數
  if (options?.decimal === true) {
    if (options?.decAfterN) {
      str = numeric.decimal(str, options.decAfterN)
    } else {
      str = numeric.decimal(str)
    }
  }
  // 加上千分符
  if (options?.thousands === true) {
    str = thousandsMark(str)
  }
  return str
}

export const numberFormatValue = (
  value: string | number,
  options?: {
    minus?: boolean
    decimal?: boolean
    decAfterN?: number
  }
): '' | number => {
  let str = numeric.base(value)
  if (str === '') return ''
  // 判斷負數
  if (options?.minus !== true) {
    str = numeric.positive(str)
  }
  // 判斷整數
  if (options?.decimal !== true) {
    str = numeric.integer(str)
  }
  // 判斷小數
  if (options?.decimal === true && options?.decAfterN) {
    str = numeric.decimal(str, options.decAfterN)
  }
  return Number(str)
}

export const dateFormat = (
  value: string | number,
  options?: {
    dateTW?: boolean
  }
): string => {
  let str = digit.base(value)
  if (str === '') return ''
  // 判斷日期
  if (options?.dateTW === true) {
    str = digit.dateTW(str, '/')
  }
  return str
}

export const dateFormatValue = (
  value: string | number,
  options?: {
    dateTW?: boolean
  }
): string => {
  let str = digit.base(value)
  if (str === '') return ''
  // 判斷日期
  if (options?.dateTW === true) {
    str = digit.dateTW(str, '')
  }
  return str
}

export const Format = (
  value: string | number,
  options?: {
    digit?: boolean
    english?: boolean
    phone?: boolean
  }
): string | number => {
  if (value === '') return ''
  if (options?.english === true) {
    // 英文&數字
    return noChinese.letter(value, { number: options?.digit === true })
  } else if (options?.phone === true) {
    // 電話
    return digit.phone(value)
  } else if (options?.digit === true) {
    // 純數字
    return digit.base(value)
  }
  return value
}

export const dateMonthFormat = (
  value: string | number,
  options?: {
    dateTW?: boolean
    sep?: string
  }
): string => {
  let str = digit.base(value)
  if (str === '') return ''
  str = str.slice(0, 5)

  if (options?.dateTW === true) {
    const sep = options?.sep ?? '/'
    if (str.length <= 3) return str
    return `${str.slice(0, 3)}${sep}${str.slice(3)}`
  }

  return str
}

export const dateMonthValue = (
  value: string | number,
  _options?: {
    dateTW?: boolean
  }
): string => {
  let str = digit.base(value)
  if (str === '') return ''
  return str.slice(0, 5)
}
