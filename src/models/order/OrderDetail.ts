import { CommentData } from './OrderDetailSection'
import { OrderItem } from './OrderItem'
import { CommonObject, CustomerOrVendor, UserUpdatedBy } from '../Common'

export interface OrderDetailParams {
  id?: string | number
}

export interface OrderStocksDetailsParams {
  entity_id: string
  group_by: 'activity' | 'material' | 'activity_material'
  material_id?: string
  parent_material_id?: string
  batch_ids?: string
  activity_id?: string
  expired_start_date?: string
  expired_end_date?: string
  only_have_qty: string
}

export type IntegrationType = 'siha' | 'sitb'

export interface OrderDetailResponse {
  id: number
  device_type: number
  customer_id: number
  vendor_id: number
  status: number
  type: number
  required_date: string | null
  estimated_date: string
  actual_shipment: string
  purchase_ref: string
  sales_ref: string
  delivery_number: string
  confirmed_at: string
  shipped_at: string
  fulfilled_at: string
  cancelled_at: string
  allocated_at: string
  created_at: string
  updated_at: string
  taken_by_customer: number
  delivery_type: string
  doc_no: string | null
  notes: string
  po_no: string | null
  activity: CommonObject
  order_comments: CommentData[]
  customer: CustomerOrVendor
  vendor: CustomerOrVendor
  order_items: OrderItem[]
  user_confirmed_by: UserUpdatedBy | null
  user_shipped_by: UserUpdatedBy | null
  user_fulfilled_by: UserUpdatedBy | null
  user_cancelled_by: UserUpdatedBy | null
  user_allocated_by: UserUpdatedBy | null
  user_created_by: UserUpdatedBy | null
  user_updated_by: UserUpdatedBy | null
  user_deleted_by: UserUpdatedBy | null
  metadata: {
    client_key: IntegrationType
    key_ssl: string
    category: string
    total_patients: number
  }
}
