import axios from '@/config/axios'
import type { AxiosRequestConfig, Method } from 'axios'
type ApiConfig = AxiosRequestConfig & { quiet?: boolean } // 👈 新增 quiet
interface CallApiOptions {
  method: Method
  url: string
  data?: any // （可選）
  params?: any // （可選）
  headers?: Record<string, string> // 額外 headers（可選）
  responseType?: AxiosRequestConfig['responseType']
}

const baseCallApi = <T = any>(options: CallApiOptions): Promise<T> => {
  const { method, url, data, params, headers, responseType } = options
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData

  const finalHeaders: Record<string, string> = {
    ...headers
  }

  if (isFormData) {
    // 讓瀏覽器自動補 multipart/form-data，自己指定 Content-Type 會漏掉 boundary
    delete finalHeaders['Content-Type']
  } else {
    // 預設是 JSON，如果沒帶 Content-Type
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json'
  }

  return axios
    .request<T>({
      method,
      url,
      data,
      params,
      headers,
      responseType
    })
    .then((res) => res.data) // 只回傳資料本體
}

const callApi = <T = any>(options: CallApiOptions): Promise<T> => {
  const token = localStorage.getItem('token') || ''
  const authHeader: Record<string, string> = {}
  if (token) {
    authHeader['Authorization'] = `Bearer ${token}`
  }

  return baseCallApi<T>({
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeader
    }
  })
}

export { baseCallApi, callApi }
