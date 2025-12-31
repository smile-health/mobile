import { Workspace } from '../workspace/Workspace'

export interface ProfileResponse {
  id: number
  username: string
  email: string
  firstname: string
  lastname: any
  date_of_birth: string | null
  gender: number
  mobile_phone: string
  address: string
  created_by: number
  updated_by: number
  deleted_by: number
  created_at: string
  updated_at: string
  role: number
  role_label: string
  village_id: string
  entity_id: number
  timezone_id: any
  token_login: string
  status: number
  last_login: string
  last_device: number
  mobile_phone_2: any
  mobile_phone_brand: any
  mobile_phone_model: any
  imei_number: any
  sim_provider: any
  sim_id: any
  iota_app_gui_theme: string
  permission: string
  application_version: any
  last_mobile_access: any
  view_only: number
  change_password: number
  manufacture_id: number
  fcm_token: string
  entity: ProfileEntity
  programs: Workspace[]
}

export interface ProfileEntity {
  id: number
  name: string
  address: string
  tag: string
  type: number
  location: string
  province_id: number
  regency_id: number
  sub_district_id: number
}

export interface EditPasswordRequest {
  password: string
  new_password: string
  password_confirmation: string
}

export interface EditProfileRequest {
  userId: number
  mobile_phone: string | null
  email: string
  entity_id: number
  firstname: string
  gender?: number
  lastname: string | null
  role: number
  date_of_birth?: string
  program_ids: number[]
  address?: string | null
  username: string
  view_only: number
}

export interface ChangeHistory {
  id: number
  user_id: number
  field: string
  old_value: ChangeHistoryValues
  new_value: ChangeHistoryValues
  updated_by: string
  created_at: string
  updated_at: string
}

export interface ChangeHistoryValues {
  firstname?: string
  lastname?: string
  gender?: number
  mobile_phone?: string | null
  email?: string
  password?: number
}
