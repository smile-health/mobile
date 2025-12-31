import { ParseKeys } from 'i18next'
import { OrderStocks } from './Order'

interface Material {
  id: number
  name: string
  code: string
  type: string
  kfa_level_id: number
  kfa_level_name: string
  unit_of_consumption: string
  unit_of_distribution: string
  consumption_unit_per_distribution_unit: number
  is_managed_in_batch: number
  is_temperature_sensitive: number
}

export type ShipmentData = {
  id: number
  status: number
  shippedAt: string
  fulfilledAt: string
}

export interface OrderItemData {
  name: string
  ordered_qty: number
  confirmed_qty: number
  allocated_qty?: number
  created_at: string
  id: number
  material: Material
  order_id: number
  order_item_kfa_id: string
  order_stocks: OrderStocks[]
  other_reason: string
  qty: number
  reason_id: number
  recommended_stock: number
  children: OrderItemData[]
  shipped_qty: number
  fulfilled_qty: number
}

export type CommentData = {
  id: string
  comment: string
  created_at: string
  order_status: string | number
  user: {
    firstname: string
    lastname: string
    id: number
  }
}
export type DetailOrderSectionItem = OrderItemData | ShipmentData | CommentData

export type DetailOrderSection =
  | { key: 'items'; title: ParseKeys; data: OrderItemData[] }
  | { key: 'shipment'; title: ParseKeys; data: ShipmentData[] }
  | { key: 'comment'; title: ParseKeys; data: CommentData[] }
