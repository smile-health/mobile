import { ORDER_REASON_TYPE } from '@/utils/Constants'
import { OrderComment, Vendor } from './Order'
import { OrderItem } from './OrderItem'
import { PaginateParam } from '../Paginate'

export interface OrderFormData {
  date: string
  comment: string
}

interface EditOrderData {
  order_comment?: OrderComment
  order_items?: OrderItem[]
  vendor?: Vendor
  required_date?: string
}

export interface EditOrderParams extends EditOrderData {
  activityName: string
  orderId: number
}

export interface EditOrderReviewParams extends OrderFormData {
  datas: EditOrderParams
  orderId: number
  activityName: string
  orderType: number
}

export interface CancelOrderPayload {
  id: number
  order_reason_id: number
  other_reason_text?: string
  comment: string
}

interface ConfirmOrderItem {
  id: number
  confirmed_qty: number
}

export interface ConfirmOrderPayload {
  id?: number
  order_items: ConfirmOrderItem[]
  comment: string
}

interface AllocateOrderItem {
  stock_id: number
  allocated_qty: number
  order_stock_status_id: number
}

export interface AllocateOrderPayload {
  id?: number
  order_items: {
    id: number
    allocations: AllocateOrderItem[]
  }[]
}

export interface ShipOrderPayload {
  id?: number
  sales_ref: string | null
  estimated_date: string | null
  taken_by_customer: number
  actual_shipment_date: string
  comment: string | null
}

export interface ReceiveOrderPayload {
  id?: number
  sales_ref: string
  estimated_date?: string
  taken_by_customer?: number
  actual_shipment_date: string
  comment?: string
}

interface Receive {
  stock_id: number
  received_qty: number
}

interface OrderItemPayload {
  id: number
  receives: Receive[]
}

export interface FulFilledOrderPayload {
  id?: number
  order_items: OrderItemPayload[]
  fulfilled_at: string
  comment: string
}

export interface ValidateOrderPayload {
  id?: number
  order_items: {
    id: number
    qty: number
  }[]
  letter_number: string
}

type OrderReasonType =
  (typeof ORDER_REASON_TYPE)[keyof typeof ORDER_REASON_TYPE]

export interface ReasonOrderParams extends PaginateParam {
  order_type: OrderReasonType
}
