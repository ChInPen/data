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
import '@/styles/css/tabs.css'

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.use(pinia)
app.mount('#app')

//代辦事項
/*
1.圖片上傳
2.根據長度限制輸入框寬度
*/
