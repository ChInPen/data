import { numeric, digit, noChinese } from './umatch'

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
  if (options?.decimal === true && options?.decAfterN) {
    str = numeric.decimal(str, options.decAfterN)
  }
  // 加上千分符
  if (options?.thousands === true) {
    const minusMark = str.startsWith('-') ? '-' : ''
    const content = str.startsWith('-') ? str.substring(1) : str
    const parts = content.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    str = minusMark + parts.join('.')
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

export const digitFormat = (
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

export const digitFormatValue = (
  value: string | number,
  options?: {
    dateTW?: boolean
    phone?: boolean
    english?: boolean
  }
): string => {
  // 判斷電話
  if (options?.phone === true) {
    return digit.phone(value)
  }
  // 英文&數字
  if (options?.english === true) {
    return noChinese.letter(value, { number: true })
  }
  let str = digit.base(value)
  if (str === '') return ''
  // 判斷日期
  if (options?.dateTW === true) {
    str = digit.dateTW(str, '')
  }
  return str
}
