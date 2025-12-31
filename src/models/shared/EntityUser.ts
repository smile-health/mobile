import { PaginateParam, PaginateResponse } from '../Paginate'

export interface GetEntityUserParams extends PaginateParam {
  entity_id: number
  keyword?: string
}

export interface EntityUser {
  username: string
  full_name: string
  role: string
  phone_number: string | null
}

export interface EntityUserResponse extends PaginateResponse {
  data: EntityUser[]
}

export interface UserGlobal {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
  mobile_phone: string
  address: string
  role_label: string
}

export interface UserGlobalResponse extends PaginateResponse {
  data: UserGlobal[]
}
