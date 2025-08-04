import type { ComponentPublicInstance } from 'vue'
import type { BaseDialogOptions } from './type'

let msgInstance: ComponentPublicInstance<{ show: (opts: any) => void }> | null = null

//註冊
const register = (instance: typeof msgInstance) => {
  msgInstance = instance
}

//物件
const message = {
  alert: (options: BaseDialogOptions) => {
    msgInstance?.show({
      ...options,
      mode: 'alert'
    })
  },
  confirm: (options: BaseDialogOptions) => {
    msgInstance?.show({
      ...options,
      mode: 'confirm'
    })
  }
}

export { register, message }
