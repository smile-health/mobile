export interface IOptions {
  label: string
  value: number
}

export interface CommonObject {
  id: number
  name: string
}

export interface UserUpdatedBy {
  id: number
  firstname: string
  lastname: string
  username?: string
  email?: string
  updated_at?: string
}

export interface CustomerOrVendor {
  id: number
  name: string
  address: string
  type: number
  status: number
}

export interface BaseUserDetail {
  firstname: string
  fullname: string
  id: number
  lastname: string
  username: string
}

export interface ReasonOption {
  reason_id: number
  value: string
}
