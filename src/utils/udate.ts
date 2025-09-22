/**
 * datetime 轉民國年日期字串
 */
export const transTWdate = (d: Date) => {
  const year = (d.getFullYear() - 1911).toString().padStart(3, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0') // 月份從 0 開始，要 +1
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

/**
 * 民國年日期字串轉 datetime
 */
export const twdateTransDate = (twdate: string) => {
  const year = Number(twdate.substring(0, 3)) + 1911
  const month = Number(twdate.substring(3, 5)) - 1
  const day = Number(twdate.substring(5, 7))

  return new Date(year, month, day)
}
