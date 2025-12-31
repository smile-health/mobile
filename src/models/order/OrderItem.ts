import { MaterialCompanion } from './AddOrderItem'
import { Activity } from '../shared/Activity'
import { StockBatch } from '../shared/Material'

interface StockItem {
  stock_id: string
  activity_id: string
  allocated: number
  order_stock_status_id?: number
  stock_quality_id?: number
}

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
}

export interface OrderItem {
  id?: number
  material_id: number
  material_name: string
  recommended_stock: number
  ordered_qty: number | string
  reason_id?: number
  order_reason_id?: number
  other_reason?: string
  qty?: number | string
  parent_id?: number
  material?: Material
  material_companion?: MaterialCompanion[]
  data?: StockItem[]
  material_hierarchy?: OrderItem[]
  children: {
    id: number
    confirmed_qty: number
    ordered_qty: number
    qty: number
    material_name: string
    material: Material
  }[]
}

export interface OrderDetailStock {
  activity_id: number
  activity_name: string
  allocated_qty: number | null
  batch: OrderDetailStockBatch
  batch_id: number
  confirmed_qty: number
  id: number
  order_item_id: number
  ordered_qty: number
  received_qty: number | null
  status: number // depend on is_temperature_sensitive, ex; VVMA, VVMB, VVMC, VVMD
  stock_id: number
}

export interface OrderDetailStockBatch {
  code: string
  expired_date: string
  id: number
  manufacture_name: string
  production_date: string
}

interface OrderItemStock {
  id: number
  ordered_qty: number
  recommended_stock: number
  order_reason_id: number
  other_reason?: string
  children?: {
    material_id: number
    material_name: number
    ordered_qty: number
  }[]
}

export interface OrderItemStocksRequest {
  order_items: OrderItemStock[]
  id?: number
}

export interface OrderAllocationChild {
  draft_allocated_qty: string
  draft_order_stock_status: string
  total_allocated_qty: number
  stock_id: number
  material_child_id: number
  material_parent_id: number
  material: {
    id: number
    name: string
  }
  stock: {
    stock_id: number
    draft_allocated_qty: number
    stock: {
      id: number
      name: string
      batch: {
        code: number
      }
      activity: {
        name: string
      }
    }
  }[]
}

export interface OrderAllocateItem {
  order_id: number
  material_id: number
  material_name: string
  is_managed_in_batch: number
  total_draft_allocated_qty: number
  qty: number
  recommended_stock: number
  total_allocated_qty: number
  children: OrderAllocationChild[]
}

interface BudgetSource {
  id: string
  name: string
}

export interface StockAllocateItem {
  id: number
  batch: StockBatch | null
  budget_source: BudgetSource
  qty: number
  allocated_qty: number
  in_transit_qty: number
  unreceived_qty: number
  open_vial_qty: number
  available_qty: number
  price: number | null
  min: number
  max: number
  total_price: number | null
  year: number | null
  updated_at: string
  activity: Activity | null
}
