import { CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface NotificationListFilter {
  program_ids?: string
}

export interface NotificationListParams
  extends PaginateParam,
    NotificationListFilter {}

export interface NotificationListResponse extends PaginateResponse {
  data: NotificationData[]
}

export interface NotificationData {
  id: number
  user_id: number
  message: string
  province_id: number
  regency_id: number
  entity_id: number
  type: NotificationTypeData
  program?: NotificationProgram | null
  media: string
  title: string
  read_at: string | null
  mobile_phone: string | null
  action_url: string | null
  download_url: string | null
  patient_id: null
  created_at: string
  updated_at: string
  user: NotificationUser
  entity: CommonObject
  patient: null
}

interface NotificationUser {
  id: number
  username: string
  firstname: string
  lastname: null
  role: number
  entity_id: number
}

interface NotificationProgram {
  id: number
  name: string
  key: string
  config: {
    color: string
  }
}

interface NotificationTypeData {
  type: string
  title: string
}

export interface NotificationCountResponse {
  all: number
  unread: number
  read: number
}
