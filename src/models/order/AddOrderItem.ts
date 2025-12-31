import { OrderDetailResponse } from './OrderDetail'
import { Material } from '../app-data/Materials'

interface MaterialData {
  name: string
  code: string
  id: number
  is_managed_in_batch?: boolean
}

interface ActivityData {
  name?: string
}

interface StockData {
  available_qty?: number
  allocated_qty?: number
  qty?: number
  activity_name?: string
  activity?: ActivityData
}

interface StockCustomer {
  total_qty: number
  min: number
  max: number
  updated_at: string
  total_available_qty: number
}

export interface OrderData {
  id: number
  material: MaterialData
  confirmed_qty?: number
  allocated_qty: number
  ordered_qty?: number
  qty: number
  recommended_stock?: number
  stock?: StockData
  stock_customer: StockCustomer
  children: OrderData[]
}

export interface MaterialCompanion {
  id: number
  name: string
  code: string
}

interface OrderItemData extends Material {
  ordered_qty: number
  reason_id: number
  recommended_stock: number
}

export interface AddOrderParams {
  name: string
  available: number
  min: number
  max: number
  updated_at: string
  qty?: number
}

export interface OrderMaterialDetailParams {
  orderId?: number
  activityName?: string
  data: OrderItemData
  parentMaterial?: OrderItemData
  editableQty?: boolean
  orderType?: number
}

export interface ShipOrderParams {
  data: OrderDetailResponse
}

export interface AllocatedOrderParams {
  data: OrderDetailResponse
  comment?: string
}

export interface AllocatedDetailParams {
  data: OrderData
  detail: OrderDetailResponse
}
