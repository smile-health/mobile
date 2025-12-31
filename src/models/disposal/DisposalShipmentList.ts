import { ParseKeys } from 'i18next'
import { DisposalPurpose } from '@/screens/disposal/disposal-constant'
import { Activity } from '../app-data/Cva'
import { CommonObject, UserUpdatedBy } from '../Common'
import { PaginateResponse } from '../Paginate'

export interface IDisposalShipment {
  id: number
  device_type: number
  customer_id: number
  vendor_id: number
  status: number
  type: number
  required_date: string | null
  estimated_date: string | null
  actual_shipment: string | null
  purchase_ref: any
  sales_ref: any
  reason: null
  cancel_reason: number
  delivery_number: string | null
  confirmed_at: string | null
  shipped_at: string
  fulfilled_at: string | null
  cancelled_at: string | null
  allocated_at: null
  created_at: string
  updated_at: string
  is_allocated: number
  taken_by_customer: number
  other_reason: null
  is_kpcpen: null
  qty_kpcpen: null
  master_order_id: null
  easygo_no_do: null
  biofarma_changed: null
  service_type: null
  no_document: string
  released_date: null
  notes: null
  activity_id: number
  is_manual: null
  no_po: null
  created_by: number
  validated_by: null
  validated_at: null
  customer: IDisposalShipmentEntity
  vendor: IDisposalShipmentEntity
  activity: CommonObject
  order_tags: any[]
  user_confirmed_by: null
  user_shipped_by: UserUpdatedBy
  user_fulfilled_by: UserUpdatedBy | null
  user_cancelled_by: UserUpdatedBy | null
  user_allocated_by: null
  user_created_by: UserUpdatedBy
  user_updated_by: UserUpdatedBy
  user_deleted_by: null
  user_validated_by: null
  disposal_items: IDisposalShipmentOrderItem[]
}

export interface IDisposalShipmentOrderItem {
  id: number
  disposal_shipment_id: number
  qty: number
  master_material_id: number
  material_id: number
  recommended_stock: null
}

export interface IDisposalShipmentEntity {
  type_label: string
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  created_at: string
  updated_at: string
  deleted_at: null
  province_id: string
  regency_id: string
  village_id: string
  sub_district_id: string
  lat: string
  lng: string
  postal_code: string
  is_vendor: number
  bpom_key: null
  is_puskesmas: number
  rutin_join_date: string
  is_ayosehat: number
}

export interface IDisposalShipmentFilter {
  purpose?: DisposalPurpose
  activity_id?: number
  status?: number
  from_date?: string
  to_date?: string
  customer_id?: number
  vendor_id?: number
  is_vendor?: number
  shipped_number?: string
}

export interface IDisposalShipmentListResponse extends PaginateResponse {
  data: IDisposalShipment[]
}

export interface IDisposalShipmentDetail {
  id: number
  activity_id: number
  actual_shipment: null
  allocated_at: null
  cancel_reason: null
  cancelled_at: string | null
  confirmed_at: null
  created_at: string
  created_by: number
  customer_id: number
  delivery_number: null
  device_type: null
  estimated_date: null
  fulfilled_at: string | null
  is_allocated: null
  is_manual: null
  master_order_id: null
  no_document: string
  notes: null
  other_reason: null
  purchase_ref: null
  reason: null
  released_date: null
  required_date: null
  sales_ref: null
  service_type: null
  shipped_at: string
  status: number
  status_label: string
  taken_by_customer: null
  type: number
  updated_at: string
  user_allocated_by: UserUpdatedBy | null
  user_cancelled_by: UserUpdatedBy | null
  user_confirmed_by: UserUpdatedBy | null
  user_deleted_by: UserUpdatedBy | null
  user_fulfilled_by: UserUpdatedBy | null
  user_validated_by: UserUpdatedBy | null
  validated_at: null
  validated_by: null
  vendor_id: number
  customer: IDisposalShipmentDetailEntity
  vendor: IDisposalShipmentDetailEntity
  activity: Activity
  user_created_by: UserUpdatedBy
  user_shipped_by: UserUpdatedBy
  user_updated_by: UserUpdatedBy
  disposal_items: IDisposalShipmentDetailItem[]
  disposal_comments: IDisposalShipmentComment[]
}

export interface IDisposalShipmentDetailEntity extends IDisposalShipmentEntity {
  mapping_entity: MappingEntity
}

export interface IDisposalShipmentComment {
  id: number
  comment: string | null
  created_at: string
  disposal_shipment_status: number
  user_id: number
  username: string
  email: string
  firstname: string
  lastname: string | null
  user: UserUpdatedBy
}

export interface IDisposalShipmentDetailItem {
  id: number
  confirmed_qty: number | null
  created_at: string
  disposal_shipment_id: number
  master_material_id: number
  material_id: number
  other_reason: null
  qty: number
  reason_id: number | null
  shipped_qty: number
  master_material: MasterMaterial
  user_created_by: UserUpdatedBy
  user_updated_by: UserUpdatedBy
  disposal_shipment_stocks: IDisposalShipmentStock[]
}

export interface IDisposalShipmentStock {
  disposal_discard_qty: number | null
  disposal_item_id: number
  disposal_received_qty: number | null
  id: number
  stock_id: number
  transaction_reasons: {
    id: number
    title: string
  }
  stock: IStockDisposalShipmentStock
}

export interface IStockDisposalShipmentStock {
  activity: Activity
  activity_id: number
  allocated: number
  available: number
  batch: Batch | null
  batch_id: number
  budget_source: CommonObject | null
  created_by: number
  createdAt: string
  id: number
  material_entity_id: null
  open_vial: number
  qty: number
  status: number | null
  stock_id: number
  updated_by: number
  updatedAt: string
  year: string | null
}

interface Batch {
  code: string
  expired_date: string
  id: number
  manufacture: { name: string | null }
  manufacture_id: number
  manufacture_name: string | null
  production_date: string
  status: number
}

interface MasterMaterial {
  code: string
  description: string
  id: number
  is_addremove: number
  is_openvial: number
  is_stockcount: number
  is_vaccine: number
  kfa_code: string
  kfa_level_id: number
  managed_in_batch: number
  name: string
  need_sequence: number
  parent_id: number
  pieces_per_unit: number
  status: number
  temperature_max: number
  temperature_min: number
  temperature_sensitive: number
  unit: string
  unit_of_distribution: string
  updated_at: string
}

interface MappingEntity {
  id: number
  id_bpjs: number | null
  id_entitas_smile: number
  id_pusdatin: number | null
  id_satu_sehat: number
}

export type DisposalShipmentDetailSection =
  | { key: 'items'; title: ParseKeys; data: IDisposalShipmentDetailItem[] }
  | { key: 'comments'; title: ParseKeys; data: IDisposalShipmentComment[] }
