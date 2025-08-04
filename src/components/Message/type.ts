export type DialogType = 'info' | 'error' | 'success' | 'warning' | 'question'
export type DialogMode = 'alert' | 'confirm'

export interface BaseDialogOptions {
  message: string
  type?: DialogType
  autoClose?: number
  onConfirm?: () => void
  onCancel?: () => void
}

export interface MsgDialogOptions extends BaseDialogOptions {
  mode?: DialogMode
}
