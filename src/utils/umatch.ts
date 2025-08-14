const DIGITS = '0123456789'
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

export const numeric = {
  base: (value: string | number) => {
    const str = value?.toString() ?? '' //強制轉成字串
    const chars = str.split('') //將字串拆分成字元陣列
    const temps: string[] = [] //儲存處理後的字元陣列
    let hasDigit = false //判別是否有數字
    let hasDot = false //判別是否有小數點
    chars.forEach((c, index) => {
      if (index === 0 && c === '-') {
        temps.push(c) //只有開頭的負號能保留
      } else if (DIGITS.includes(c)) {
        temps.push(c) //數字 0-9 都保留
        if (!hasDigit) hasDigit = true
      } else if (hasDigit && !hasDot && c === '.') {
        temps.push(c) //只保留一次小數點
        hasDot = true
      }
    })
    if (temps.length == 0) return ''
    if (temps[0] === '-' && temps.length == 1) {
      return '' //如果只有負號，回傳空字串
    }
    if (temps[0] === '-' && temps[1] === '0' && temps.length == 2) {
      temps.splice(0, 1) //移除開頭負號，-0 => 0
    }
    if (temps[0] === '0' && temps.length > 1 && temps[1] !== '.') {
      temps.splice(0, 1) //移除開頭0，012 => 12
    }
    if (temps[0] === '-' && temps[1] === '0' && temps[2] !== '.') {
      temps.splice(1, 1) //移除開頭0(負數)，-012 => -12
    }
    return temps.join('')
  },
  /**
   * 將數字字串中的負號去除。**建議先執行 numeric.base() 再傳入此函式。**
   */
  positive: (value: string | number) => {
    const str = value?.toString() ?? '' //強制轉成字串
    return str.replaceAll('-', '')
  },
  /**
   * 將數字字串轉成整數。**建議先執行 numeric.base() 再傳入此函式。**
   */
  integer: (value: string | number) => {
    const str = value?.toString() ?? '' //強制轉成字串
    const splitDot = str.split('.')
    return splitDot[0]
  },
  /**
   * 將數字字串中的小數保留到第n位。**建議先執行 numeric.base() 再傳入此函式。**
   */
  decimal: (value: string | number, n: number) => {
    const str = value?.toString() ?? '' //強制轉成字串
    const splitDot = str.split('.')
    if (splitDot.length === 1) return str
    if (splitDot[1].length > n) {
      splitDot[1] = splitDot[1].substring(0, n - 1)
    }
    return splitDot[0] + splitDot[1]
  }
}

export const digit = {
  base: (value: string | number) => {
    const str = value?.toString() ?? '' //強制轉成字串
    const chars = str.split('')
    const temps: string[] = []
    chars.forEach((c) => {
      if (DIGITS.includes(c)) temps.push(c)
    })
    return temps.join('')
  },
  /**
   * 將數字字串轉成民國年日期。**建議先執行 digit.base() 再傳入此函式。**
   */
  dateTW: (value: string | number, separate: string = '') => {
    const str = value?.toString() ?? '' //強制轉成字串
    const year = str.substring(0, 3)
    const month = str.substring(3, 5)
    const day = str.substring(5, 7)
    const sep1 = month ? separate : ''
    const sep2 = day ? separate : ''
    return year + sep1 + month + sep2 + day
  },
  /**
   * 將字串過濾到只剩數字、減號和左右括號。
   */
  phone: (value: string | number) => {
    const str = value?.toString() ?? '' //強制轉成字串
    const chars = str.split('')
    const temps: string[] = []
    chars.forEach((c) => {
      if (DIGITS.includes(c) || ['-', '(', ')'].includes(c)) temps.push(c)
    })
    return temps.join('')
  }
}

export const noChinese = {
  letter: (value: string | number, options?: { number?: boolean }) => {
    const str = value?.toString() ?? '' //強制轉成字串
    const chars = str.split('')
    const temps: string[] = []
    chars.forEach((c) => {
      if (LETTERS.includes(c?.toLowerCase())) temps.push(c)
      if (options?.number && DIGITS.includes(c)) temps.push(c)
    })
    return temps.join('')
  }
}
