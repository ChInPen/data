/**
 * 自動產生編號: 預設 rec1 欄位，預設 3 碼，ex-> rec1: '001'。
 */
export const GenerateRec = (list: any[], key: string = 'rec1', len: number = 3) => {
  if (list && Array.isArray(list)) {
    list.forEach((item, index) => {
      if (key in item) {
        item[key] = (index + 1).toString().padStart(len, '0')
      }
    })
  }
}

/**
 * 用 JSON.parse(JSON.stringify()) 深拷貝
 * @param obj 要拷貝的物件或陣列
 * @returns T 型別的深拷貝
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * 產生大項目中文編號: 需傳入數字，ex-> 1 => 壹。
 */
export const getHeadItemNo1 = (no: number) => {
  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '萬', '億', '兆']
  if (no === 0) return '零'
  let str = ''
  let sectionIndex = 0
  while (no > 0) {
    let section = no % 10000
    let sectionStr = ''
    let zeroFlag = false
    for (let i = 0; i < 4 && section > 0; i++) {
      const digit = section % 10
      if (digit === 0) {
        if (!zeroFlag && sectionStr.length > 0) {
          sectionStr = '零' + sectionStr
          zeroFlag = true
        }
      } else {
        sectionStr = digits[digit] + units[i] + sectionStr
        zeroFlag = false
      }
      section = Math.floor(section / 10)
    }
    if (sectionStr !== '') {
      str = sectionStr + bigUnits[sectionIndex] + str
    }
    no = Math.floor(no / 10000)
    sectionIndex++
  }
  // 清除連續零
  return str.replace(/零+/g, '零').replace(/零$/g, '')
}

/**
 * 產生中項目中文編號: 需傳入數字，ex-> 1 => (一)。
 */
export const getDetItemNo1 = (no: number) => {
  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  const bigUnits = ['', '萬', '億', '兆']

  if (no === 0) return '(〇)'

  let str = ''
  let sectionIndex = 0

  while (no > 0) {
    let section = no % 10000
    let sectionStr = ''
    let zeroFlag = false

    for (let i = 0; i < 4 && section > 0; i++) {
      const digit = section % 10
      if (digit === 0) {
        if (!zeroFlag && sectionStr.length > 0) {
          sectionStr = '〇' + sectionStr
          zeroFlag = true
        }
      } else {
        sectionStr = digits[digit] + units[i] + sectionStr
        zeroFlag = false
      }
      section = Math.floor(section / 10)
    }

    if (sectionStr !== '') {
      str = sectionStr + bigUnits[sectionIndex] + str
    }

    no = Math.floor(no / 10000)
    sectionIndex++
  }

  // 清除連續零
  return '(' + str.replace(/〇+/g, '〇').replace(/〇$/g, '') + ')'
}

/**
 * 產生細項目中文編號: 需傳入數字，ex-> 1 => 一。
 */
export const getSecItemNo1 = (no: number) => {
  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  const bigUnits = ['', '萬', '億', '兆']
  if (no === 0) return '〇'
  let str = ''
  let sectionIndex = 0
  while (no > 0) {
    let section = no % 10000
    let sectionStr = ''
    let zeroFlag = false
    for (let i = 0; i < 4 && section > 0; i++) {
      const digit = section % 10
      if (digit === 0) {
        if (!zeroFlag && sectionStr.length > 0) {
          sectionStr = '〇' + sectionStr
          zeroFlag = true
        }
      } else {
        sectionStr = digits[digit] + units[i] + sectionStr
        zeroFlag = false
      }
      section = Math.floor(section / 10)
    }
    if (sectionStr !== '') {
      str = sectionStr + bigUnits[sectionIndex] + str
    }
    no = Math.floor(no / 10000)
    sectionIndex++
  }
  // 清除連續零
  return str.replace(/〇+/g, '〇').replace(/〇$/g, '')
}
