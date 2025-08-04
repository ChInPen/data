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
      return response
    },
    (error: AxiosError) => {
      // 錯誤處理
      return Promise.reject(error)
    }
  )
  return instance
}

const axiosInstance = createAxiosInstance()

export default axiosInstance
