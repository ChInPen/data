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
