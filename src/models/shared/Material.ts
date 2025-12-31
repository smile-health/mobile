import { SectionListData } from 'react-native'
import { ParseKeys } from 'i18next'
import { ActivityProtocol } from '../app-data/Materials'
import { CommonObject } from '../Common'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface GetStockParams extends PaginateParam {
  entity_id?: number
  activity_id?: number
  material_id?: number
  material_level_id?: number
  period_id?: number
  keyword?: string
  with_details?: number
  only_have_qty?: number
}

export interface GetStockResponse extends PaginateResponse {
  data: StockItem[]
}

interface StockBase {
  total_qty: number
  total_allocated_qty: number
  total_in_transit_qty: number
  total_available_qty: number
  total_open_vial_qty: number
  min: number
  max: number
  updated_at: string
  last_opname_date?: string | null
  material: StockMaterial
}

export interface StockMaterial {
  id: number
  name: string
  is_temperature_sensitive: number
  is_open_vial: number
  is_managed_in_batch: number
  is_stock_opname_mandatory?: number
  consumption_unit_per_distribution_unit: number
  unit_of_consumption: string
  material_level_id: number
  status: number
  companions: CommonObject[]
  activities: CommonObject[]
}

export interface StockAggregate {
  max: number
  min: number
  total_allocated_qty: number
  total_available_qty: number
  total_in_transit_qty: number
  total_open_vial_qty: number
  total_qty: number
  updated_at: string
}

export interface StockItem extends StockBase {
  entity: {
    id: number
    name: string
    type: number
    address: string
    tag: string | null
    location: string | null
  }
  protocol: ActivityProtocol
  details: StockDetail[]
  aggregate?: StockAggregate
}

export interface GetStockDetailParams {
  group_by: string
  entity_id?: number
  activity_id?: number
  material_id?: number
  parent_material_id?: number
  only_have_qty?: number
}

export interface StockDetail extends StockBase {
  activity: CommonObject
  stocks: Stock[]
}

export interface Stock {
  id: number
  batch: StockBatch | null
  budget_source: CommonObject | null
  qty: number
  allocated_qty: number
  available_qty: number
  open_vial_qty: number
  in_transit_qty: number
  unreceived_qty?: number
  price: number | null
  min: number
  max: number
  total_price: number | null
  year: number | null
  updated_at: string
  activity: CommonObject
}

export interface StockBatch {
  id: number
  code: string
  production_date: string | null
  expired_date: string
  manufacture: {
    id: number
    name: string
    address?: string | null
  }
}

export interface StockBatchSection {
  fieldname: string
  title: ParseKeys
  data: Stock[]
}

export interface StockBatchSectionHeader {
  section: SectionListData<Stock, StockBatchSection>
}
