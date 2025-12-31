import { CreateTransaction } from '../transaction/TransactionCreate'

interface Stock {
  stock_id: number
  activity_id: number
  allocated_qty: number
  order_stock_status_id: number | null
}

export interface CreateOrderStock extends CreateTransaction {
  qty: number
  allocated: number
  available: number
  min: number
  max: number
  updated_at: string
  activity_name: string
}

export interface DistributionItem {
  material_id: number
  stocks: Stock[]
}

export interface CreateDistributionResponse {
  id: number
}

export interface CreateDistributionPayload {
  vendor_id: number
  customer_id: number
  activity_id: number
  order_comment?: string
  required_date?: string
  order_items: DistributionItem[]
}
