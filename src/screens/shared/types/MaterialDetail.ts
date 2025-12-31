import { Material } from '@/models/app-data/Materials'
import { MaterialCompanion } from '@/models/order/AddOrderItem'
import { StockData } from '@/screens/order/types/order'

export interface MaterialData extends Material {
  ordered_qty: number
  reason_id: number
  order_other_reason?: string
  recommended_stock: number
  is_managed_in_batch: number
}

export interface StockSection {
  title: string
  data: StockData[]
}

export interface DispatchActionData {
  material_id: number
  material_name: string
  reason_id: number
  other_reason?: string
  recommended_stock: number
  ordered_qty: number
  material_companion?: MaterialCompanion[]
}

export type OrderData = {
  data: MaterialData
  recommendation: number
  quantity: string
  reason: string
  other_reason?: string
}
