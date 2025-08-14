import axios from 'axios'
// 使用 import type 導入相關類型
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosRequestHeaders
} from 'axios'
import config from '../config'
import { logout } from '@/utils/auth'
import { message } from '@/components/Message/service'
// import { useRouter } from 'vue-router'
// const router = useRouter()

interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders
}

const createAxiosInstance = (): AxiosInstance => {
  const baseURL = config.apiUri as string
  const instance = axios.create({
    baseURL: baseURL, // 設定 API 的基本 URL
    timeout: 5000, // 設定超時時間為 5 秒
    headers: {
      'Content-Type': 'application/json' // 設定請求頭的 Content-Type
    }
  })
  // 增加請求攔截器
  instance.interceptors.request.use(
    (config: AdaptAxiosRequestConfig) => {
      // 在發送請求之前做些什麼，例如增加身份驗證信息等
      return config
    },
    (error: AxiosError) => {
      // 錯誤處理
      return Promise.reject(error)
    }
  )
  // 增加回應攔截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 在收到回應後做些什麼，例如處理回應資料等
      const data = response?.data
      if (data && (data.status === 400 || data.status === 500)) {
        message.alert({
          type: 'error',
          message: data?.message ?? ''
        })
      }
      return response
    },
    (error: AxiosError) => {
      // 錯誤處理
      if (error.status === 401) {
        //token逾期
        logout()
        message.alert({
          type: 'error',
          message: '連限逾時，請重新登入',
          autoClose: 2,
          onConfirm: () => {
            location.reload()
          }
        })
      } else if (error.status === 404) {
        message.alert({
          type: 'error',
          message: '找不到應用程式'
        })
      } else if (error.status === 400) {
        message.alert({
          type: 'error',
          message: error.message
        })
      }
      return Promise.reject(error)
    }
  )
  return instance
}

const axiosInstance = createAxiosInstance()

export default axiosInstance
