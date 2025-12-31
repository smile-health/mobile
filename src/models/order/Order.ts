import { OrderMaterialsData, StockData } from '@/screens/order/types/order'
import { IntegrationType } from './OrderDetail'
import { OrderItem } from './OrderItem'
import { BaseEntity } from '../app-data/BaseEntity'
import { Activity } from '../app-data/Cva'
import { Material } from '../app-data/Materials'
import { CommonObject, CustomerOrVendor, UserUpdatedBy } from '../Common'
import { PaginateResponse } from '../Paginate'

export interface Batch {
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_name: string
}

export interface Vendor {
  address: string
  id: number
  name: string
  created_at?: string
  status: number
  type: number
}

export interface OrderDraft {
  orderDraft?: OrderItem[]
  regular?: OrderItem[]
  distribution?: OrderItem[]
  return?: OrderItem[]
  distributionDraft?: OrderItem[]
}

export interface OrderComment {
  id?: number
  comment: string
  created_at?: string
  order_status?: number
  user?: UserUpdatedBy
}

export interface OrderStatusData {
  index: number
  order_status_id: number
  total: number
}

export interface OrderStatusResponse {
  data: OrderStatusData[]
}

export interface OrderStatusCountParams {
  purpose?: 'purchase' | 'sales'
  type: number | null
  order_id: string | null
  activity_id: number | null
  vendor_id: string | null
  customer_id: string | null
  from_date: string | null
  to_date: string | null
}

export interface GetOrderFilters {
  purpose: 'purchase' | 'sales'
  type: number | null
  order_number: string | null
  order_id: string | null
  status: number | null
  customer_id: string | null
  vendor_id: string | null
  activity_id: number | null
  from_date: string | null
  to_date: string | null
  page?: number | string
  paginate?: number | string
  integration?: number | null
}

export type OrderType = 1 | 2 | 3 | null

export interface OrderStocks {
  activity_id: number
  activity_name: string
  allocated_qty: number
  shipped_qty: number
  batch: Batch
  batch_id: number
  confirmed_qty: number
  id: number
  order_item_id: number
  ordered_qty: number
  received_qty: number
  status: number
  stock_id: number
  is_temperature_sensitive: number
}

export interface OrderResponse {
  id: number
  device_type: number
  status: number
  type: number
  customer: CustomerOrVendor
  vendor: CustomerOrVendor
  activity: CommonObject
  user_created_by: UserUpdatedBy
  user_confirmed_by: UserUpdatedBy
  user_allocated_by: UserUpdatedBy
  user_shipped_by: UserUpdatedBy
  user_fulfilled_by: UserUpdatedBy
  user_cancelled_by: UserUpdatedBy
  created_at: string | null
  confirmed_at: string | null
  allocated_at: string | null
  shipped_at: string | null
  fulfilled_at: string | null
  cancelled_at: string | null
  total_order_item: number
  metadata: {
    client_key: IntegrationType
    key_ssl: string
    category: string
    total_patients: number
  }
}

export interface OrderAllResponse extends PaginateResponse {
  data: OrderResponse[]
}

export interface OrderRegularItemRequest {
  material_id: number
  order_reason_id: number
  order_stock_status_id?: number
  ordered_qty: number
  other_reason?: string
  recommended_stock: number
  example_array_property?: number[]
  order_type_id?: number
  children?: {
    material_id: number
    ordered_qty: number
  }[]
}

export interface CreateOrderRequest {
  customer_id: number
  vendor_id: number
  activity_id: number
  required_date: string
  order_comment?: string
  order_items: OrderRegularItemRequest[]
}

export interface CreateOrderResponse {
  createdOrderId: number
}

export interface BaseOrderParams {
  orderId?: number
  activityName?: string
}

export interface DraftOrderDetail {
  orderDraftTypeId?: number
  orderCustomer?: BaseEntity
  orderActivity: Activity
  orderMaterial: StockData
  orderMaterials: OrderMaterialsData[]
  orders: OrderItem[]
}

export interface OrderWithEntityResponse {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: OrderResponse[]
}

export interface OrderWithEntityParams {
  page?: number
  paginate?: number
  customer_id?: number
}

export interface OrderReasonOptionResponse extends PaginateResponse {
  data: CommonObject[]
}

export interface RelocationOrderItem {
  ordered_qty: number
  recommended_stock: number
  material_id: number
  order_reason_id: number
  other_reason?: string | null
  children?: {
    material_id: number
    ordered_qty: number
  }[]
}

export interface CreateRelocationRequest {
  is_hierarchy?: boolean
  customer_id: number
  vendor_id: number
  activity_id: number
  required_date?: string
  order_comment: string
  order_items: RelocationOrderItem[]
}

export interface RelocationDraft {
  activity: Activity
  vendor: BaseEntity
  relocations: OrderItem[]
  parentMaterial: Material
}

export interface OrderItemReview extends BaseOrderParams {
  orderType: number
}
