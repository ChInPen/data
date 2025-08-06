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
    Cust_Data: 'api/Cust/Cust_GetSingle'
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
    Supp_Brow: 'api/Supp/SuppBrowWin'
  },
  //工程資料
  Project: {
    Project_List: 'api/Project/Project_List',
    Projectlist: 'api/Project/Projectlist',
    Project_Create: 'api/Project/Project_Add',
    Project_EDIT: 'api/Project/Project_EDIT',
    Project_DEL: 'api/Project/Project_DeleAll',
    Project_Data: 'api/Project/Project_GetSingleAll',
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
    ItemNo_Data: 'api/Item/ItemNo_Data'
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
    Emp_PhotoGet: 'api/Emp/Emp_PhotoGet'
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
    HavedateBrow: 'api/Phr/HavedateBrow'
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
    Exes_Add: `${apiuridoc}/api/Exes/Exes_Add`,
    Exes_Upd: `${apiuridoc}/api/Exes/Exes_Upd`,
    Exes_Del: `${apiuridoc}/api/Exes/Exes_Del`,
    Exeslist: `${apiuridoc}/api/Exes/Exeslist`,
    Exes_Data: `${apiuridoc}/api/Exes/Exes_Data`
  },
  //圖檔
  Photo: {
    GetPhoto2: `${apiuridoc}/api/Photo/GetPhoto2`
  }
}
