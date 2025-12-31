import { Icons } from '@/assets/icons'
import { AppStackParamList } from '@/navigators'

export interface HomeMenuItem {
  name: string
  key: string
  childs?: HomeMenuChildItem[]
}

export interface HomeMenuChildItem {
  name: string
  key: keyof AppStackParamList
  iconName: keyof typeof Icons
  transactionType?: number
  type?: number
  orderType?: string | number
  role?: number[]
}
