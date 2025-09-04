<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTextarea,
    cTable,
    cBread,
    cRadioGroup,
    cDataTable
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法

  const store = ref({ isDetail: false })
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤

  const protdetList = ref<any[]>([])
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <c-button kind="record" icon="fa-solid fa-angles-left">首筆</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="record" icon="fa-solid fa-angle-left">上一筆</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="record" icon="fa-solid fa-angle-right">下一筆</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="record" icon="fa-solid fa-angles-right">尾筆</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="print" icon="fa-solid fa-print">列印</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="browse" icon="fa-solid fa-eye">瀏覽</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="search" icon="fa-solid fa-magnifying-glass">查詢</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="copy" icon="fa-solid fa-copy">複製</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="delete" icon="fa-solid fa-trash">刪除</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="edit" icon="fa-solid fa-pen-to-square">編輯</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle">新增</c-button>
    </div>

    <!-- <div class="col-auto" v-if="!store.isDetail">
      <c-button kind="cancel" icon="mdi-close-circle" @click="handleCancel">取消</c-button>
    </div>
    <div class="col-auto" v-if="!store.isDetail">
      <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSave">確認送出</c-button>
    </div>
    <div class="col-auto" v-else>
      <c-button kind="goback" icon="fa-solid fa-circle-left" @click="handleCancel">返回</c-button>
    </div> -->
  </c-bread>

  <v-card class="mt-2">
    <v-tabs v-model="tabpage" class="c-tabs">
      <v-tab value="normal">雜支資料一</v-tab>
      <v-tab value="other">雜支資料二</v-tab>
      <v-tab value="image">圖片檔案</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <v-row dense :align="'center'">
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.ono"
                label="雜支單號"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.date1"
                label="雜支日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.datea"
                label="帳款日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.protno"
                label="工程編號"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :readonly="!store.isDetail"
                @button=""
              />
            </v-col>
            <v-col :cols="8" class="px-2">
              <c-input
                v-model="formData.protabbr"
                label="工程名稱"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.con1"
                label="工地主任"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-select
                v-model="formData.empaccno"
                label="付款人員"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.con1"
                label="零用金"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.con1"
                label="零用金餘額"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.sum1"
                label="稅前合計"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.tax"
                label="營業稅額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.amount"
                label="雜支總額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="other">
          <v-row dense :align="'center'">
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.exesud1"
                label="雜支自定一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.exesud2"
                label="雜支自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="12" class="px-2">
              <c-textarea
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
          </v-row>
          <!-- <v-row dense :align="'center'">
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.consT_NO"
                label="建造執照"
                icon="fa-solid fa-id-card"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.consT_BY"
                label="起造人"
                icon="fa-solid fa-person-digging"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.consT_MGR"
                label="承造人"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.dsgN_BY"
                label="設計人"
                icon="fa-solid fa-brush"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.dsgN_CNO"
                label="設計人開業證書字號"
                icon="fa-solid fa-certificate"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.insP_MGR"
                label="監造人"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.insP_NO"
                label="監造人開業證書字號"
                icon="fa-solid fa-certificate"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.enG_EMP"
                label="專任工程人員"
                icon="fa-solid fa-user-tie"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.insP_TEL"
                label="監造人電話"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.usE_PART"
                label="使用分區"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.consT_TEL"
                label="服務電話"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.ctrL_NO"
                label="管制編號"
                icon="fa-solid fa-hashtag"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.pnP_TEL"
                label="公害陳情專線"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.enG_DESC"
                label="工程概要"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
              />
            </v-col>
          </v-row> -->
        </v-tabs-window-item>
        <v-tabs-window-item value="image">
          <!-- <v-row dense class="w-75 mx-auto">
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="protIKindAdd">新增</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="protIKindDel">刪除</c-button>
            </v-col>
            <v-col cols="12">
              <c-data-table
                ref="protIKindTable"
                v-model="protIKindList"
                :headers="protIKindHeaders"
                striped="even"
                hover
                :header-props="{ align: 'center' }"
                selectable
              >
                <template v-slot:item.ikindno="{ scope, index }">
                  <c-input
                    v-model="scope.ikindno"
                    :disabled="store.isDetail"
                    @button="protIKindPick(index)"
                    @keydown="(e: any) => protIKindKeydown(e, index)"
                  />
                </template>
                <template v-slot:item.ikindname="{ scope }">
                  <c-input v-model="scope.ikindname" :disabled="store.isDetail" />
                </template>
                <template v-slot:item.pimoney="{ scope }">
                  <c-input
                    type="number"
                    v-model="scope.pimoney"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                  />
                </template>
              </c-data-table>
            </v-col>
          </v-row> -->
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <v-card color="#1b2b36" rounded="3" class="mt-2">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="create" icon="mdi-plus-circle">新增</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="insert" icon="mdi-arrow-down-circle">插入</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="delete" icon="fa-solid fa-trash">刪除</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="protype" icon="fa-solid fa-clipboard-list">規格說明</c-button>
        </v-col>
      </v-row>
      <c-table
        class="mt-2"
        ref="protdetTable"
        v-model="protdetList"
        striped="even"
        hover
        height="340"
        fixed-header
        selectable
        layout="fixed"
        header-align="center"
      >
        <template v-slot:head>
          <th width="80">序號</th>
          <th width="260">雜項編號</th>
          <th width="600">雜項名稱</th>
          <th width="150">工程編號</th>
          <th width="155">工程簡稱</th>
          <th width="155">數量</th>
          <th width="155">單位</th>
          <th width="200">單價</th>
          <th width="200">稅額</th>
          <th width="200">金額</th>
          <th width="125">類別</th>
          <th width="125">發票號碼</th>
          <th width="200">說明</th>
          <th width="200">說明自定一</th>
        </template>
        <template v-slot:body="{ scope, index }"></template>
      </c-table>
    </v-card-text>
  </v-card>
</template>
