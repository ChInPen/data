/**
 * 工料類別名稱 mkindno1。
 */
export const getMKindno1 = (mkindno: string) => {
  if (mkindno == '1') return '材料'
  if (mkindno == '2') return '工資'
  if (mkindno == '3') return '費用'
  if (mkindno == '4') return '外包'
  if (mkindno == '6') return '雜支'
  return ''
}
