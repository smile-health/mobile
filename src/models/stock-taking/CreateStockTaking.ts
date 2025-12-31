import { StockTakingFormItem } from '@/screens/stock-taking/schema/CreateStockTakingSchema'
import { CommonObject } from '../Common'

export interface StockTakingCreateResponse {
  data: string
}

export interface StockTakingPayload {
  entity_id: number
  period_id: number
  items: StockTakingItem[]
}

export interface StockTakingItem {
  material_id: number
  stocks: StockTakingItemStock[]
}

export interface StockTakingItemStock {
  stock_id: number | null
  activity_id: number
  batch_code?: string
  expired_date?: string
  manufacture_id?: number
  production_date?: string
  in_transit_qty: number
  actual_qty: number
  recorded_qty: number
}

export interface StockTakingMaterialDetail {
  entityId: number
  materialId: number
  materialName: string
  remainingQty: number
  lastStockOpname: string | null
  isBatch: boolean
  isHierarchy: boolean
  isMandatory?: boolean
  activities: CommonObject[]
  stocks: StockTakingFormItem[]
}
