import { ProfileEntity } from '../account/Profile'
import { Workspace } from '../workspace/Workspace'

export interface LoginResponse {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
  date_of_birth: string
  gender: number
  mobile_phone: string
  address: string
  created_by: number
  updated_by: number
  deleted_by: number
  created_at: string
  updated_at: string
  entity_id: number
  role: number
  village_id: string
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

export interface LoginRequest {
  username: string
  password: string
  fcm_token?: string
}

export type AuthDetail = {
  access_token: string
  expires_in: number
  'not-before-policy': number
  refresh_expires_in: number
  refresh_token: string
  scope: string
  session_state: string
  token_type: string
}

export type RequestLoginV2Response = {
  authDetails: AuthDetail
}
