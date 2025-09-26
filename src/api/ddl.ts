import api from '@/api' //api路徑設定檔
import { callApi } from '@/utils/uapi' //呼叫api的方法

/**
 * 取得單位下拉選單。
 */
export const getUnitDDL = async () => {
  let unitDDL: { content1: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Phr.UnitBrow,
    params: { indexValue: '' }
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data
      if (data && Array.isArray(data)) {
        unitDDL = data
      }
    }
  })
  return unitDDL
}

/**
 * 取得人員下拉選單。
 */
export const getEmpDDL = async () => {
  let empDDL: { empno: string; empname: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Emp.Emp_ListSimple
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data as any[] | undefined
      if (data && Array.isArray(data)) {
        empDDL = data.map(({ empno, empname }) => ({ empno, empname }))
      }
    }
  })
  return empDDL
}

/**
 * 取得部門下拉選單。
 */
export const getDepartDDL = async () => {
  let departDDL: { deparno: string; deparname: string }[] = []
  await callApi({
    method: 'GET',
    url: api.Depar.GetAllDep
  }).then((res: any) => {
    if (res?.status == 200) {
      const { data } = res?.data
      if (Array.isArray(data)) {
        departDDL = data.map(({ deparno, deparname }) => ({ deparno, deparname }))
      }
    }
  })
  return departDDL
}

/**
 * 取得工種下拉選單。
 */
export const getSkillDDL = async () => {
  let skillDDL: { skillno: string; skillname: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Skill.Skilllist,
    data: {}
  }).then((res: any) => {
    if (res?.status == 200) {
      const { _Lists } = res?.data
      if (Array.isArray(_Lists)) {
        skillDDL = _Lists.map(({ skillno, skillname }) => ({ skillno, skillname }))
      }
    }
  })
  return skillDDL
}

/**
 * 取得營業稅別下拉選單。
 */
export const getTaxkindDDL = async () => {
  let taxkindDDL: { taxkind: string; taxkindc: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Taxkind.Taxkind_List,
    params: { indexValue: '' }
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data as any[] | undefined
      if (data && Array.isArray(data)) {
        taxkindDDL = data.map(({ taxkind, taxkindc }) => ({ taxkind, taxkindc }))
      }
    }
  })
  return taxkindDDL
}

/**
 * 取得發票種類下拉選單。
 */
export const getInvokindDDL = async () => {
  let invokindDDL: { invokindno: string; invokindna: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Invokind.Invokind_List,
    params: { indexValue: '' }
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data as any[] | undefined
      if (data && Array.isArray(data)) {
        invokindDDL = data.map(({ invokindno, invokindna }) => ({ invokindno, invokindna }))
      }
    }
  })
  return invokindDDL
}

/**
 * 取得結帳類別下拉選單。
 */
export const getAkindDDL = async () => {
  let akindDDL: { akindno: string; akindname: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Akind.Akind_List,
    data: {
      akindno: '',
      akindname: ''
    }
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data as any[] | undefined
      if (data && Array.isArray(data)) {
        akindDDL = data.map(({ akindno, akindname }) => ({ akindno, akindname }))
      }
    }
  })
  return akindDDL
}

/**
 * 取得業主類別下拉選單。
 */
export const getCkindDDL = async () => {
  let ckindDDL: { ckindno: string; ckindname: string }[] = []
  await callApi({
    method: 'POST',
    url: api.CKind.CKindlist,
    data: {
      ckindno: '',
      ckindname: ''
    }
  }).then((res: any) => {
    if (res?.status == 200) {
      const { _Lists } = res?.data
      if (_Lists && Array.isArray(_Lists)) {
        ckindDDL = _Lists.map(({ ckindno, ckindname }) => ({ ckindno, ckindname }))
      }
    }
  })
  return ckindDDL
}

/**
 * 取得廠商類別下拉選單。
 */
export const getSkindDDL = async () => {
  let skindDDL: { skindno: string; skindname: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Skind.Skind_List,
    data: {
      skindno: '',
      skindname: ''
    }
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data as any[] | undefined
      if (data && Array.isArray(data)) {
        skindDDL = data.map(({ skindno, skindname }) => ({ skindno, skindname }))
      }
    }
  })
  return skindDDL
}

/**
 * 取得工料類別下拉選單。
 */
export const getIkindDDL = async () => {
  let ikindDDL: { ikindno: string; ikindname: string }[] = []
  await callApi({
    method: 'POST',
    url: api.Ikind.Ikind_List,
    data: {
      ikindno: '',
      ikindname: ''
    }
  }).then((res: any) => {
    if (res?.status == 200) {
      const data = res?.data
      if (data && Array.isArray(data)) {
        ikindDDL = data.map(({ ikindno, ikindname }) => ({ ikindno, ikindname }))
      }
    }
  })
  return ikindDDL
}

/**
 * 包含所有取得下拉選單函式的物件。
 */
export const DDL = {
  getUnitDDL,
  getEmpDDL,
  getDepartDDL,
  getSkillDDL,
  getTaxkindDDL,
  getInvokindDDL,
  getAkindDDL,
  getCkindDDL,
  getSkindDDL,
  getIkindDDL
}
