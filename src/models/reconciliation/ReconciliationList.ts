import { BaseUserDetail, CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface ReconciliationFilter {
  created_from?: string
  created_to?: string
  start_date?: string
  end_date?: string
}

export interface ReconciliationListParams
  extends PaginateParam,
    ReconciliationFilter {
  entity_id?: number
  activity_id?: number
  material_id?: number
}

export interface ReconciliationListResponse extends PaginateResponse {
  data: Reconciliation[]
}

export interface Reconciliation {
  activity: CommonObject
  activity_id: number
  created_at: string
  created_by: number
  deleted_at: string | null
  deleted_by?: number
  end_date: string
  entity: ReconciliationEntity
  entity_id: number
  id: number
  items: ReconciliationItem[]
  material: ReconciliationMaterial
  material_id: number
  material_parent?: ReconciliationMaterial
  start_date: string
  updated_at: string
  updated_by?: number
  user_created_by: BaseUserDetail
  user_updated_by?: BaseUserDetail
}

export interface ReconciliationEntity {
  entity: EntityEntity
  id: number
  name: string
}

export interface EntityEntity {
  id: string
  name: string
  province: CommonObject
  regency: CommonObject
}

export interface ReconciliationItem {
  actual_qty: number
  id: number
  reconciliation_category: number
  reconciliation_category_label: string
  reconciliation_id: number
  recorded_qty: number
}

export interface ReconciliationMaterial {
  code: string
  id: number
  name: string
}

export interface IActionReason {
  id: number
  title: string
}

export type ReconciliationDetailItem = ReconciliationItem & {
  actions: IActionReason[]
  reasons: IActionReason[]
}
export interface ReconciliationDetail extends Omit<Reconciliation, 'items'> {
  items: ReconciliationDetailItem[]
}
