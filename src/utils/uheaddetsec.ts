/**
 * 產生大項目中文編號: 需傳入數字，ex-> 1 => 壹。
 */
export const getHeadItemNo1 = (no: number) => {
  // if (no === 0) return '零'
  if (!no) return ''

  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '萬', '億', '兆']

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
  // if (no === 0) return '(〇)'
  if (!no) return ''

  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  const bigUnits = ['', '萬', '億', '兆']

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
  // if (no === 0) return '〇'
  if (!no) return ''

  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  const bigUnits = ['', '萬', '億', '兆']

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

/**
 * 排序項目資料: flag 參數控制要排序到哪一層(head/det/sec)。
 */
export const HDSsort = (list: any[], flag: 'head' | 'det' | 'sec') => {
  return [...list].sort((a, b) => {
    // 先比較 headitemno
    const h = Number(a.headitemno) - Number(b.headitemno)
    if (h !== 0) return h // 不同就回傳

    // 如果 headitemno 一樣，再看 detitemno
    if (flag === 'det' || flag === 'sec') {
      const d = Number(a.detitemno) - Number(b.detitemno)
      if (d !== 0) return d // 不同就回傳
    }

    // 如果 detitemno 也一樣，再看 secitemno
    if (flag === 'sec') {
      return Number(a.secitemno) - Number(b.secitemno)
    }

    return 0
  })
}

/**
 * 編項目資料的中文編號: flag 參數控制要編到哪一層(head/det/sec)。
 */
export const HDSno1 = (list: any[], flag: 'head' | 'det' | 'sec') => {
  return list.map((item) => {
    // 先編 headitemno1
    const base = {
      headitemno1: item.headitemno1 ?? getHeadItemNo1(Number(item.headitemno))
    }

    // 如果 flag 是 det 或 sec，加上 detitemno1
    if (flag === 'det' || flag === 'sec') {
      Object.assign(base, {
        detitemno1: item.detitemno1 ?? getDetItemNo1(Number(item.detitemno))
      })
    }

    // 如果 flag 是 sec，加上 secitemno1
    if (flag === 'sec') {
      Object.assign(base, {
        secitemno1: item.secitemno1 ?? getSecItemNo1(Number(item.secitemno))
      })
    }

    // 最後組合回傳
    return { ...item, ...base }
  })
}

/**
 * 排序大項目資料。
 */
export const headitemListSort = (headList: iHeadItem[]) => {
  return headList
    .map((head) => ({
      ...head,
      headitemno1: head?.headitemno1 || getHeadItemNo1(Number(head.headitemno))
    }))
    .sort((a, b) => Number(a.headitemno) - Number(b.headitemno))
}

/**
 * 排序中項目資料。
 */
export const detitemListSort = (detList: iDetItem[]) => {
  return detList
    .map((det) => ({
      ...det,
      headitemno1: det?.headitemno1 || getHeadItemNo1(Number(det.headitemno)),
      detitemno1: det?.detitemno1 || getDetItemNo1(Number(det.detitemno))
    }))
    .sort(
      (a, b) =>
        Number(a.headitemno) - Number(b.headitemno) || Number(a.detitemno) - Number(b.detitemno)
    )
}

/**
 * 排序細項目資料。
 */
export const secitemListSort = (secList: iSecItem[]) => {
  return secList
    .map((sec) => ({
      ...sec,
      headitemno1: sec?.headitemno1 || getHeadItemNo1(Number(sec.headitemno)),
      detitemno1: sec?.detitemno1 || getDetItemNo1(Number(sec.detitemno)),
      secitemno1: sec?.secitemno1 || getSecItemNo1(Number(sec.secitemno))
    }))
    .sort(
      (a, b) =>
        Number(a.headitemno) - Number(b.headitemno) ||
        Number(a.detitemno) - Number(b.detitemno) ||
        Number(a.secitemno) - Number(b.secitemno)
    )
}
