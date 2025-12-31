import { BaseUserDetail } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface PeriodListParams extends PaginateParam {
  status?: number
  start_date?: string
  end_date?: string
}

export interface PeriodListResponse extends PaginateResponse {
  data: Period[]
}

export interface Period {
  id: number
  name: string
  month_period: number
  year_period: number
  start_date: string
  end_date: string
  status: number
  created_at: string
  updated_at?: string
  user_created_by: BaseUserDetail | null
  user_updated_by: BaseUserDetail | null
}
