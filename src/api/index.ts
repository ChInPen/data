import config from '@/config/config'
const apiuridoc = config.apiInvUri as string

// api 清單
export default {
  //登入
  Login: {
    VerifyAccount: 'api/Login/VerifyAccount',
    GetValidateCode: 'api/Login/GetValidateCode/get'
  },
  //業主類別
  CKind: {
    CKindlist: 'api/CKind/CKindlist',
    CKind_Add: 'api/CKind/CKind_Add',
    CKind_Upd: 'api/CKind/CKind_Upd',
    CKind_Del: 'api/CKind/CKind_Del',
    CKind_ReNew: 'api/CKind/CKind_ReNew'
  },
  //業主資料
  Cust: {
    Custlist: 'api/Cust/Cust_List',
    Cust_Add: 'api/Cust/Cust_ADD',
    Cust_Upd: 'api/Cust/Cust_EDIT',
    Cust_Del: 'api/Cust/Cust_Dele',
    Cust_Data: 'api/Cust/Cust_GetSingle',
    Cust_Renew: 'api/Cust/Cust_Renew/renew',
    Cust_Print: 'api/Cust/Cust_Print'
  },
  Con: {
    Conlist: 'api/Con/Con_list'
  },
  //部門類別
  Depar: {
    Deparlist: 'api/Depar/Deparlist',
    Department_Add: 'api/Depar/Department_Add',
    Department_Upd: 'api/Depar/Department_Upd',
    Department_Del: 'api/Depar/Department_Del',
    GetAllDep: 'api/Depar/GetAllDep',
    Department_Renew: 'api/Depar/Depar_ReNew'
  },
  //工種資料
  Skill: {
    Skilllist: 'api/Skill/Skilllist',
    Skill_Add: 'api/Skill/Skill_Add',
    Skill_Upd: 'api/Skill/Skill_Upd',
    Skill_Del: 'api/Skill/Skill_Del',
    Skill_ReNew: 'api/Skill/Skill_ReNew'
  },
  //廠商類別
  Skind: {
    Skind_List: 'api/Skind/Skind_List',
    Skind_Create: 'api/Skind/Skind_Create',
    Skind_EDIT: 'api/Skind/Skind_EDIT',
    Skind_DEL: 'api/Skind/Skind_DEL',
    Skind_ReNew: 'api/Skind/Skind_ReNew'
  },
  //廠商資料
  Supp: {
    Supp_List: 'api/Supp/Supplist',
    Supp_Create: 'api/Supp/Supp_Add',
    Supp_EDIT: 'api/Supp/Supp_Upd',
    Supp_DEL: 'api/Supp/Supp_Del',
    Supp_Data: 'api/Supp/Supp_Data',
    Supp_ReNew: 'api/Supp/Supp_ReNew',
    Supp_Brow: 'api/Supp/SuppBrowWin',
    Supp_Print: 'api/Supp/Supp_Print'
  },
  //工程資料
  Project: {
    Project_List: 'api/Project/Project_List',
    Projectlist: 'api/Project/Projectlist',
    Project_Create: 'api/Project/Project_Add',
    Project_EDIT: 'api/Project/Project_EDIT',
    Project_DEL: 'api/Project/Project_DeleAll',
    Project_Data: 'api/Project/Project_GetSingleAll',
    Project_ReNew: 'api/Project/Renew',
    Project_Print: 'api/Project/Project_Print',
    Project_HeadDetSec: 'api/Project/Project_GetHeadDetSec'
  },
  //工料類別
  Ikind: {
    Ikind_List: 'api/Ikind/Ikind_List',
    Ikind_Create: 'api/Ikind/Ikind_Create',
    Ikind_EDIT: 'api/Ikind/Ikind_EDIT',
    Ikind_DEL: 'api/Ikind/Ikind_DEL',
    Ikind_ReNew: 'api/Ikind/Ikind_ReNew'
  },
  //工料資料
  Item: {
    Item_List: 'api/Item/Itemlist',
    Item_Create: 'api/Item/Item_Add',
    Item_EDIT: 'api/Item/Item_Upd',
    Item_DEL: 'api/Item/Item_Del',
    Item_Data: 'api/Item/Item_Data',
    Item_ReNew: 'api/Item/Item_ReNew',
    ItemNo_Data: 'api/Item/ItemNo_Data',
    Item_Print: 'api/Item/Item_Print'
  },
  //報價單
  Sqte: {
    Sqte_List: `${apiuridoc}/api/Sqte/Sqte_List`,
    Sqte_Create: `${apiuridoc}/api/Sqte/Sqte_Insert`,
    Sqte_EDIT: `${apiuridoc}/api/Sqte/Sqte_update`,
    Sqte_DEL: `${apiuridoc}/api/Sqte/Sqte_delete`,
    Sqte_Data: `${apiuridoc}/api/Sqte/Sqte_Load`,
    Sqte_Item: `${apiuridoc}/api/Sqte/Sqte_Item`,
    Sqte_Renew: `${apiuridoc}/api/Sqte/Renew`,
    Sqte_ExecChk: `${apiuridoc}/api/Sqte/ExecChk`,
    DescriptBrow: `${apiuridoc}/api/Sqte/descript`,
    Sqte_Print: `${apiuridoc}/api/Sqte/_Print`
  },
  //報價請款
  Bill2: {
    Bill2_List: `${apiuridoc}/api/Bill2/Bill2_List`,
    // Sqte_Create: `${apiuridoc}/api/Sqte/Sqte_Insert`,
    // Sqte_EDIT: `${apiuridoc}/api/Sqte/Sqte_update`,
    // Sqte_DEL: `${apiuridoc}/api/Sqte/Sqte_delete`,
    Bill2_Data: `${apiuridoc}/api/Bill2/Bill2_Load`
    // Sqte_Item: `${apiuridoc}/api/Sqte/Sqte_Item`,
    // Sqte_Renew: `${apiuridoc}/api/Sqte/Renew`,
    // Sqte_ExecChk: `${apiuridoc}/api/Sqte/ExecChk`,
    // DescriptBrow: `${apiuridoc}/api/Sqte/descript`,
    // Sqte_Print: `${apiuridoc}/api/Sqte/_Print`
  },
  //採購
  Pord: {
    Pord_List: `${apiuridoc}/api/Pord/Pordlist`,
    Pord_Data: `${apiuridoc}/api/Pord/Load`,
    Pord_Create: `${apiuridoc}/api/Pord/Save_Insert`,
    Pord_EDIT: `${apiuridoc}/api/Pord/Save_Update`,
    Pord_DEL: `${apiuridoc}/api/Pord/Dele`,
    Pord_Supp: `${apiuridoc}/api/Pord/Historical_transactions`,
    Pord_Supp_All: `${apiuridoc}/api/Pord/Historical_transactions_All`,
    Pord_ReNew: `${apiuridoc}/api/Pord/Renew`,
    Pord_ExecChk: `${apiuridoc}/api/Pord/ExecChk`,
    Call_Appbuy: `${apiuridoc}/api/Pord/Call_Appbuy`,
    Call_Appbuydet: `${apiuridoc}/api/Pord/Call_Appbuydet`,
    Call_Ask: `${apiuridoc}/api/Pord/Call_Ask`,
    Call_Askdet: `${apiuridoc}/api/Pord/Call_Askdet`
  },
  //結帳方式
  Akind: {
    Akind_List: 'api/Akind/Akind_List',
    Akind_Create: 'api/Akind/Akind_Create',
    Akind_EDIT: 'api/Akind/Akind_EDIT',
    Akind_DEL: 'api/Akind/Akind_DEL',
    Akind_ReNew: 'api/Akind/Akind_ReNew'
  },
  //人員設定
  Emp: {
    Emp_Search: 'api/Emp/Emp_Search',
    Emp_ADD: 'api/Emp/Emp_ADD',
    Emp_EDIT: 'api/Emp/Emp_EDIT',
    Emp_DEL: 'api/Emp/Emp_DEL',
    Emp_GetSingle: 'api/Emp/Emp_GetSingle',
    Emp_ListSimple: 'api/Emp/Emp_ListSimple',
    EmpSkill_List: 'api/EmpSkill/EmpSkill_List',
    Emp_PhotoUpload: 'api/Emp/Emp_PhotoUpload',
    Emp_PhotoGet: 'api/Emp/Emp_PhotoGet',
    Emp_Print: 'api/Emp/Emp_Print',
    Emp_ReNew: 'api/Emp/Emp_Renew',
    Emp_Search2: 'api/Emp/Emplist2',
    EmpWebPar_List: 'api/EmpWebPar/Emp_WebParlist'
  },
  //郵遞區號
  Zip: {
    Ziplist: 'api/Zip/Ziplist', //取得所有Zip的簡易資料
    GetAllZip: 'api/Zip/GetAllZip', //取得所有Zip
    Load: 'api/Zip/Load', //取得單筆的所有資料
    Dele: 'api/Zip/Dele', //刪除單筆的資料
    Save: 'api/Zip/Save', //新增儲存資料
    GetZipCity: 'api/Zip/GetZipCity', //取得縣市名稱
    GetZipTown: 'api/Zip/GetZipTown', //取得鄉鎮市區
    GetZipRoad: 'api/Zip/GetZipRoad', //取得路名
    GetZipBrow: 'api/Zip/GetZipBrow' //取得搜尋結果
  },
  //常用片語
  Phr: {
    UnitBrow: 'api/Phr/UnitBrow',
    PaytermsBrow: 'api/Phr/PaytermsBrow',
    HavedateBrow: 'api/Phr/HavedateBrow',
    Comptitle: 'api/Phr/list_Comptitle'
  },
  //Upload: {
  //    UploadImage: 'api/Upload/UploadImage',
  //},
  Invokind: {
    Invokind_List: '/api/Invokind/InvokindBrow'
  },
  Taxkind: {
    Taxkind_List: '/api/Tax/TaxBrow'
  },
  //雜支作業
  Exes: {
    Exes_Save: '/api/Exes/Exes_Save',
    Exes_Del: '/api/Exes/Exes_Del',
    Exeslist: '/api/Exes/Exeslist',
    Exes_Data: '/api/Exes/Exes_Data',
    Exes_Renew: '/api/Exes/Exes_ReNew',
    Exes_Print: '/api/Exes/Exes_Print',
    Exes_FootNote: '/api/Exes/Exes_FootNote',
    Exes_PettyCash: '/api/Exes/Exes_PettyCash'
  },
  //圖檔
  Photo: {
    GetPhoto2: `${apiuridoc}/api/Photo/GetPhoto2`
  },
  // 員工借支作業
  EmpLoan: {
    Search: '/api/Emborr/Emborr_List',
    SearchOen: '/api/Emborr/Emborr_GetSingle',
    Add: '/api/Emborr/Emborr_ADD',
    UPDATE: '/api/Emborr/Emborr_EDIT',
    Delete: '/api/Emborr/Emborr_DEL'
  },
  // 員工還款作業
  EmpRepayLoan: {
    Search: '/api/Emporr/Emporr_List',
    SearchOen: '/api/Emporr/Emporr_GetSingle',
    Add: '/api/Emporr/Emporr_ADD',
    UPDATE: '/api/Emporr/Emporr_EDIT',
    Delete: '/api/Emporr/Emporr_DEL'
  },
  // 報價作業查詢
  QuotationQuery: {
    Search: '/api/SqteBrow/SqteBrow_Search',
    Print: '/api/SqteBrow/SqteBrow_Print',
    Excel: '/api/SqteBrow/SqteBrow_Excel'
  },
  // 請款作業查詢
  BillingQuery: {
    Search: '/api/Billbrow/Billbrow_Search',
    Print: '/api/Billbrow/Billbrow_Search_Print',
    Excel: '/api/Billbrow/Billbrow_Search_Excel'
  },
  // 採購作業查詢
  PordBrowQuery: {
    Search: '/api/PordBrow/PordBrow_Search',
    Print: '/api/PordBrow/PordBrow_Print',
    Excel: '/api/PordBrow/PordBrow_Excel'
  },
  // 採購估驗查詢
  PurPordBrowQurey: {
    Search: '/api/PurPordBrow/PurPordBrow_Search',
    Print: '/api/PurPordBrow/PurPordBrow_Print',
    Excel: '/api/PurPordBrow/PurPordBrow_Excel',
    List: '/api/Purpord/PurPordlist'
  },
  // 發包作業查詢
  OutsourcingQuery: {
    Search: '/api/EmitBrow/EmitBrow_Search',
    Print: '/api/EmitBrow/EmitBrow_Print',
    Excel: '/api/EmitBrow/EmitBrow_Excel'
  },
  // 發包估驗查詢
  PurEmitQuery: {
    Searchone: '/api/Puremit/Puremit_Search',
    Search: '/api/PuremitBrow/PuremitBrow_Search',
    Print: '/api/PuremitBrow/PuremitBrow_Print',
    Excel: '/api/PuremitBrow/PuremitBrow_Excel'
  },
  // 日期別-已付帳款查詢
  ApPaidByDateQuery: {
    Search: '/api/HSAPDate/HSAPDate_Search',
    Print: '/api/HSAPDate/HSAPDate_Print'
  },
  // 日期別-已收帳款查詢
  ArReceivedByDateQuery: {
    Search: '/api/HSARDate/HSARDate_Print',
    Print: '/api/HSARDate/HSARDate_Print'
  },
  // 員工借支查詢
  EmployeeAdvanceQuery: {
    Search: '/api/EmborrBrow/EmborrBrow_List',
    Print: '/api/EmborrBrow/EmborrBrow_Print',
    Excel: '/api/EmborrBrow/EmborrBrow_Excel'
  },
  // 廠商保留款查詢
  SupplierRetentionQuery: {
    Print: '/api/Retainage_Balance/Retainage_Balance_Print'
  },
  // 預付款作業查詢
  VendorPrepaymentQuery: {
    Print: '/api/AP_Query/AP_Query_Print'
  },
  //雜支作業查詢
  MiscPaymentQuery: {
    Search: '/api/Exes_Query/Exes_Querylist',
    Print: '/api/Exes_Query/Exes_Query_Print'
  },
  //零用金查詢
  PettyCashQuery: {
    Search: '/api/Pecash_Balance/Pecash_Balancelist',
    Print: '/api/Pecash_Balance/Pecash_Balance_Print',
    Excel: '/api/Pecash_Balance/Pecash_Balance_Excel'
  },
  //進項發票明細表
  InputVatDetails: {
    Print: '/api/Input_Invoice_Detail/Input_Invoice_Detail_Print',
    Excel: '/api/Input_Invoice_Detail/Input_Invoice_Detail_Excel'
  },
  //銷項發票明細表
  OutputVatDetails: {
    Print: '/api/Sales_Invoice_Detail/Sales_Invoice_Detail_Print',
    Excel: '/api/Sales_Invoice_Detail/Sales_Invoice_Detail_Excel'
  },
  //工程工資彙總表
  ProjectWageSummary: {
    SummaryPrint: '/api/EngineerWage/EngineerWageSummary_Print',
    DetailPrint: '/api/EngineerWage/EngineerWageDetail_Print'
  },
  //請購作業查詢
  ApplyBuyBrowQuery: {
    Print: '/api/ApplyBuyBrow/ApplyBuyBrow_Print',
    Excel: '/api/ApplyBuyBrow/ApplyBuyBrow_Excel'
  }, //工程日誌報表
  EngLog: {
    Excel: '/api/JournalExcel/JournalExcel_Print'
  },
  //工程費用彙總/明細表
  EngCostSum: {
    SummaryPrint: '/api/ProjectCost/ProjectCostSummary_Print',
    DetailPrint: '/api/ProjectCost/ProjectCostDetails_Print'
  },
  //工程材料彙總/明細表
  EngMatSum: {
    SummaryPrint: '/api/ProjectItem/ProjectItemSummary_Print',
    SummaryExcel: '/api/ProjectItem/ProjectItemSummary_Excel',
    DetailPrint: '/api/ProjectItem/ProjectItemDetail_Print',
    DetailExcel: '/api/ProjectItem/ProjectItemDetail_Print'
  },
  //工程庫存表
  EngStock: {
    Print: '/api/ProjectInventory/ProjectInventory_Print'
  },
  //工料庫存表
  EngMatStock: {
    Print: '/api/ItemInventory/ItemInventory_Print'
  },
  //工人月份統計表
  WorkerMonthlySummary: {
    Print: '/api/WorkerMonthly/WorkerMonthly_Print',
    Excel: '/api/WorkerMonthly/WorkerMonthly_Excel'
  },
  //工人出勤明細表
  WorkerAttendanceDetail: {
    Print: '/api/WorkerAttendanceDetail/WorkerAttendanceDetail_Print',
    Excel: '/api/WorkerAttendanceDetail/WorkerAttendanceDetail_Excel'
  },
  //工地工人出勤表
  SiteWorkerAttendance: {
    Print: '/api/WorkerAttendance/WorkerAttendance_Print'
  },
  //零用金存入
  PettyCashDeposit: {
    Search: '/api/Pecash/Pecashlist',
    Save: '/api/Pecash/Pecash_Save',
    Data: '/api/Pecash/Pecash_Data'
  },
  //工作日誌建檔
  WorkLogEntry: {
    Search: '/api/Diary/Diary_Search',
    SearchOne: '/api/Diary/Diary_Get',
    Set: '/api/Diary/Diary_Set',
    Add: '/api/Diary/Diary_Add',
    Print: '/api/Diary/Diary_Print',
    Delete: '/api/Diary/Diary_Del_WithPhoto'
  }
}
