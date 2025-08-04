import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'

//bootstrap 的 class
import 'bootstrap/dist/css/bootstrap.min.css'

//vuetify
import { vuetify } from './plugins/vuetify'

//pinia
import { pinia } from './plugins/pinia'

//自己定義的 style
import '@/styles/scss/style.scss'
import '@/styles/css/style.css'

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.use(pinia)
app.mount('#app')

//代辦事項
/*
1.input框 number 千分符
2.select框 表格查詢版
3.textarea
4.checkbox
5.表格checkbox
6.radio
7.表格排序、表格輸入框
8.圖片上傳
9.列印功能
*/
