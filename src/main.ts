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
1.checkbox
2.表格checkbox
3.radio
4.表格排序、表格輸入框
5.圖片上傳
*/
