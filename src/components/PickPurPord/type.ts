export type SearchData = {
  ono: string // 採購估驗單號
  date1: string // 採購估驗日期 (估驗日)
  suppno: string // 廠商編號
  suppabbr: string // 廠商簡稱
  tax: number // 營業稅
  amount: number // 採購總額 (含稅)
  empno: string // 採購人員編號
  empname: string // 採購人員姓名

  taxkind: string // 稅別代碼 (0=免稅,1=外加稅,2=內加稅)
  taxflag: string // 稅別旗標 (V=有稅, Z=零稅率, E=免稅)

  [key: string]: any // 允許額外欄位
}
