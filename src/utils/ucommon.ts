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
 * 將物件陣列過濾重複元素(依據屬性)
 * @param arr 目標陣列
 * @param keySelector 判斷規則
 * @returns 過濾後陣列
 */
export const distinctBy = <T, K>(arr: T[], keySelector: (item: T) => K): T[] => {
  const seen = new Set<K>()
  return arr.filter((item) => {
    const key = keySelector(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * 將物件陣列過濾重複元素(全屬性)
 * @param arr 目標陣列
 * @returns 過濾後陣列
 */
export const distinctByAll = <T>(arr: T[]): T[] => {
  const seen = new Set<string>()
  return arr.filter((item) => {
    const key = JSON.stringify(item) // 序列化整個物件
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
