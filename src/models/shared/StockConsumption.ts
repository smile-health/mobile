import { StockBatch, StockMaterial } from './Material'
import { ProfileEntity } from '../account/Profile'
import { CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface GetStockConsumptionParams extends PaginateParam {
  activity_id: number
  vendor_id?: number
  customer_id?: number
}

export interface StockConsumptionResponse extends PaginateResponse {
  data: StockConsumption[]
}

export interface StockConsumption {
  details: StockConsumptionDetail[]
  entity: ProfileEntity
  material: StockMaterial
  total_qty: number
  updated_at: string
}

export interface GetStockConsumptionDetailParams {
  material_id: number
  vendor_id?: number
  customer_id?: number
}

export interface StockConsumptionDetail {
  activity: CommonObject
  material: StockMaterial
  stock_consumptions: ConsumptionStock[]
  total_qty: number
  updated_at: string
}

export interface ConsumptionStock {
  activity: CommonObject
  batch: StockBatch | null
  id: number
  qty: number
  updated_at: string
}
