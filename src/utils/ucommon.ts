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
