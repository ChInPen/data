import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

type MenuEntry = MenuGroup | MenuItem

interface MenuGroup {
  title: string
  children: MenuEntry[]
}

interface MenuItem {
  title: string
  name?: string
  path: string
  component?: Component
  meta?: Record<string, any>
}

type MenuMenu = MenuMenuGroup | MenuMenuItem

interface MenuMenuGroup {
  title: string
  children: MenuMenu[]
}

interface MenuMenuItem {
  title: string
  path: string
}

const menu: MenuEntry[] = [
  {
    title: '建檔設定',
    children: [
      {
        title: '工務',
        children: [
          {
            title: '工程資料',
            path: 'Construction',
            name: 'A13工程資料建檔',
            component: () => import('@/views/Base/WorkSetting/Construction.vue')
          },
          {
            title: '工程資料',
            path: 'ConstructionForm',
            component: () => import('@/views/Base/WorkSetting/ConstructionForm.vue'),
            meta: { from: ['/menu/Construction'] }
          },
          {
            title: '工料類別',
            path: 'Material',
            name: 'A05工料類別建檔',
            component: () => import('@/views/Base/WorkSetting/Material.vue')
          },
          {
            title: '工料資料',
            path: 'MaterialData',
            name: 'A11工料資料建檔',
            component: () => import('@/views/Base/WorkSetting/MaterialData.vue')
          },
          {
            title: '工料資料',
            path: 'MaterialDataForm',
            component: () => import('@/views/Base/WorkSetting/MaterialDataForm.vue'),
            meta: { from: ['/menu/MaterialData'] }
          },
          { title: '採購合約', path: '' },
          { title: '零用金存入', path: '' },
          { title: '完工日期批次異動', path: '' }
        ]
      },
      {
        title: '工地',
        children: [
          { title: '工作日誌', path: '' },
          { title: '工程日誌(Web)', path: '' },
          { title: '工程進度(Web)', path: '' },
          { title: '工種進度', path: '' }
        ]
      },
      {
        title: '廠商',
        children: [
          {
            title: '業主資料',
            path: 'OwnerData',
            name: 'A09業主資料建檔',
            component: () => import('@/views/Base/CompanySetting/OwnerData.vue')
          },
          {
            title: '業主資料',
            path: 'OwnerDataForm',
            component: () => import('@/views/Base/CompanySetting/OwnerDataForm.vue'),
            meta: { from: ['/menu/OwnerData'] }
          },
          {
            title: '業主類別',
            path: 'OwnerCategory',
            name: 'A03業主類別建檔',
            component: () => import('@/views/Base/CompanySetting/OwnerCategory.vue')
          },
          {
            title: '廠商資料',
            path: 'ManufacturerData',
            name: 'A10業主資料建檔',
            component: () => import('@/views/Base/CompanySetting/ManufacturerData.vue')
          },
          {
            title: '廠商資料',
            path: 'ManufacturerDataForm',
            component: () => import('@/views/Base/CompanySetting/ManufacturerDataForm.vue'),
            meta: { from: ['/menu/ManufacturerData'] }
          },
          {
            title: '廠商類別',
            path: 'ManufacturerCategory',
            name: 'A04廠商類別建檔',
            component: () => import('@/views/Base/CompanySetting/ManufacturerCategory.vue')
          }
        ]
      },
      {
        title: '人員',
        children: [
          {
            title: '人員設定',
            path: 'Employee',
            name: 'A07人員設定作業',
            component: () => import('@/views/Base/Staff/Employee.vue')
          },
          {
            title: '人員設定',
            path: 'EmployeeForm',
            component: () => import('@/views/Base/Staff/EmployeeForm.vue'),
            meta: { from: ['/menu/Employee'] }
          },
          {
            title: '部門資料',
            path: 'Department',
            name: 'A01部門類別建檔',
            component: () => import('@/views/Base/Staff/Department.vue')
          },
          {
            title: '工種資料',
            path: 'WorkType',
            name: 'A02工種資料建檔',
            component: () => import('@/views/Base/Staff/WorkType.vue')
          },
          { title: '假日匯入EXL', path: '' }
        ]
      },
      {
        title: '常用',
        children: [
          {
            title: '結帳方式',
            path: 'Payment',
            name: 'A06結帳方式建檔',
            component: () => import('@/views/Base/Common/Payment.vue')
          },
          { title: '郵遞區號', path: '' },
          { title: '常用片語', path: '' },
          { title: '表尾註腳', path: '' }
        ]
      },
      {
        title: '維護設定',
        children: [
          { title: '系統參數', path: '' },
          { title: '系統權限', path: '' },
          { title: '年度結轉', path: '' },
          { title: '電子發票', path: '' },
          { title: '資料重整', path: '' },
          { title: '系統備份', path: '' },
          { title: '版權註冊', path: '' }
        ]
      }
    ]
  },
  {
    title: '工務作業',
    children: [
      {
        title: '業主',
        children: [
          { title: '估算作業', path: '' },
          { title: '估算轉EXCEL', path: '' },
          { title: '報價作業', path: 'QuotationSearch' },
          { title: '報價請款作業', path: '' },
          { title: '工程請款明細', path: '' },
          { title: '工程請款作業', path: '' },
          { title: '應收工程款沖銷', path: '' },
          { title: '點工作業', path: '' },
          { title: '雜支作業', path: 'MiscExpense' },
          { title: '分攤比例', path: '' },
          { title: '工地耗轉作業', path: '' }
        ]
      },
      {
        title: '廠商',
        children: [
          { title: '銷貨作業', path: '' },
          { title: '折讓管理', path: '' },
          { title: '請購作業', path: '' },
          { title: '詢價作業', path: '' },
          { title: '採購作業', path: 'Purchase' },
          { title: '發包作業', path: '' },
          { title: '進貨作業', path: '' },
          { title: '詢價比價單', path: '' },
          { title: '採購估驗作業', path: '' },
          { title: '發包估驗作業', path: '' },
          { title: '應付工程款沖銷', path: '' },
          { title: '員工借支作業', path: '' },
          { title: '員工還款作業', path: '' },
          { title: '領料作業', path: '' },
          { title: '採購發票修改', path: '' }
        ]
      }
    ]
  },
  {
    title: '資料查詢',
    children: [
      {
        title: '建檔',
        children: [
          { title: '業主資料', path: '' },
          { title: '工程資料', path: '' },
          { title: '採購合約', path: '' },
          { title: '合約餘額', path: '' },
          { title: '廠商資料', path: '' },
          {
            title: '廠商保留款查詢',
            path: 'SupplierRetentionQuery',
            name: 'D01廠商保留款查詢',
            component: () => import('@/views/Report/CompanySetting/SupplierRetentionQuery.vue')
          },
          {
            title: '預付款作業查詢',
            path: 'VendorPrepaymentQuery',
            name: '預付款作業查詢',
            component: () => import('@/views/Report/CompanySetting/VendorPrepaymentQuery.vue')
          }
        ]
      },
      {
        title: '工務',
        children: [
          {
            title: '報價作業查詢',
            path: 'Quotation',
            name: 'C01報價作業查詢',
            component: () => import('@/views/Report/CompanySetting/Quotation.vue')
          },

          {
            title: '請款作業查詢',
            path: 'Billing',
            name: 'C02請款作業查詢',
            component: () => import('@/views/Report/CompanySetting/Billing.vue')
          },
          { title: '應收總表', path: '' },
          { title: '進貨資料', path: '' },
          { title: '銷貨資料', path: '' },
          {
            title: '日期別-已付帳款',
            path: 'DateAccount',
            name: '日期別-已付帳款查詢',
            component: () => import('@/views/Report/CompanySetting/DateAccountQuery.vue')
          },
          { title: '日期別-已收帳款', path: '' },
          { title: '詢價作業', path: '' },
          { title: '請購作業', path: '' },
          {
            title: '採購作業查詢',
            path: 'PordBrowQuery',
            name: '採購作業查詢',
            component: () => import('@/views/Report/CompanySetting/PordBrowQuery.vue')
          },
          {
            title: '採購估驗查詢',
            path: 'PurPordBrowQurey',
            name: '採購估驗查詢',
            component: () => import('@/views/Report/CompanySetting/PurPordBrowQurey.vue')
          },
          {
            title: '發包作業查詢',
            path: 'OutsourcingQuery',
            name: '發包作業查詢',
            component: () => import('@/views/Report/CompanySetting/outsourcingQuery.vue')
          },
          {
            title: '發包估驗查詢',
            path: 'OutsourcingValuation',
            name: '發包估驗查詢',
            component: () => import('@/views/Report/CompanySetting/OutsourcingValuationQurey.vue')
          },
          { title: '應付總表', path: '' },
          { title: '工作日誌', path: '' },
          { title: '點工作業', path: '' },
          { title: '工種進度', path: '' },
          { title: '雜支作業', path: '' },
          {
            title: '員工借支查詢',
            path: 'EmployeeAdvanceQuery',
            name: '員工借支查詢',
            component: () => import('@/views/Report/CompanySetting/EmployeeAdvanceQuery.vue')
          },
          { title: '零用金餘額', path: '' }
        ]
      }
    ]
  },
  {
    title: '統計報表',
    children: []
  },
  {
    title: '會計傳輸',
    children: []
  },
  {
    title: '票據開帳',
    children: []
  }
]

export const getMenuRouter = () => {
  const router: RouteRecordRaw[] = []

  const pickItem = (items: MenuEntry[], parents: string[] = []) => {
    items.forEach((item) => {
      const bread = [...parents, item.title]

      if ('children' in item) {
        if (Array.isArray(item.children) && item.children.length > 0) {
          //遞迴
          pickItem(item.children, bread)
        }
      } else {
        if (item.path && item.component) {
          router.push({
            path: item.path,
            name: item?.name ?? '',
            component: item.component,
            meta: {
              ...(item?.meta ?? {}),
              bread: bread.join(' > ')
            }
          })
        }
      }
    })
  }

  pickItem(menu)

  return router
}

export const getMenuGroup = () => {
  const getGroup = (items: MenuEntry[]): MenuMenu[] => {
    const list: MenuMenu[] = []
    items.forEach((entry) => {
      if ('children' in entry) {
        if (Array.isArray(entry.children) && entry.children.length > 0) {
          // MenuGroup: 遞迴處理 children
          list.push({
            title: entry.title,
            children: getGroup(entry.children)
          })
        }
      } else {
        if (!(entry.meta && 'from' in entry.meta)) {
          // MenuItem: 只保留 title 和 path
          list.push({
            title: entry.title,
            path: entry.path
          })
        }
      }
    })
    return list
  }

  const group: MenuMenu[] = getGroup(menu)
  return group
}
