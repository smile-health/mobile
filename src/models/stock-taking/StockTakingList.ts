import { BaseUserDetail, CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface StockTakingFilter {
  created_from?: string
  created_to?: string
  expired_end_date?: string
  expired_start_date?: string
  only_have_qty?: number
}

export interface StockTakingListParam extends PaginateParam, StockTakingFilter {
  entity_id?: number
  material_id?: number
  parent_material_id?: number
  period_id?: number
}

export interface StockTakingListResponse extends PaginateResponse {
  data: StockTaking[]
}

export interface StockTaking {
  activity: CommonObject
  actual_qty: number
  batch?: StockTakingBatch
  created_at: string
  entity?: StockTakingEntity
  id: number
  in_transit_qty: number
  is_within_period?: number
  manufacture?: CommonObject
  material?: CommonObject
  parent_material?: CommonObject
  period?: CommonObject
  recorded_qty: number
  updated_at?: string
  user_created_by?: BaseUserDetail
}

export interface StockTakingBatch {
  code: string
  expired_date: string
  production_date: null
}

export interface StockTakingEntity {
  address: string
  id: number
  location: string
  name: string
  tag: string
  type: number
  updated_at: string
}
