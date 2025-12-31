import { AssetFormData } from '@/screens/asset/schema/AssetInventorySchema'
import { PaginateParam, PaginateResponse } from '../Paginate'

export interface AssetModel {
  id: number
  name: string
  net_capacity: number
  gross_capacity: number
}

export interface AssetType {
  id: number
  name: string
  min_temperature: number
  max_temperature: number
}

export interface BorrowedFrom {
  id: number
  name: string
}

export interface BudgetSource {
  id: number
  name: string
  year: number
}

export interface AssetCalibration {
  asset_vendor_id: number
  asset_vendor_name: string
  last_date: string
  schedule_id: number
  name: string
}

interface Contact {
  id: number
  name: string
  number: string
}

export interface ContactPerson {
  first: Contact
  second: Contact
  third: Contact
}

export interface Entity {
  id: number
  name: string
  is_puskesmas: number
}

export interface EntityTag {
  id: number
  title: string
}

export interface Programs {
  id: number
  key: string
  name: string
  config: Config
}

export interface Config {
  material: Material
  color: string
}

export interface Material {
  is_hierarchy_enabled: boolean
  is_batch_enabled: boolean
}
export interface IdNamePair {
  id: number
  name: string
}

export interface UserAtedBy {
  id: number
  username: string
  firstname: string
  lastname: null
}

export interface Warranty {
  asset_vendor_id: number
  asset_vendor_name: string
  start_date: string
  end_date: string
}

export interface Ownership {
  qty: number
  id: number
  name: string
}

// Main Asset Inventory interface
export interface AssetInventory {
  id: number
  serial_number: string
  production_year: number
  other_asset_model_name: string
  other_net_capacity: number
  other_gross_capacity: number
  other_asset_type_name: string
  other_min_temperature: number
  other_max_temperature: number
  other_manufacture_name: string
  other_budget_source_name: string
  other_borrowed_from_entity_name: string
  created_at: string
  updated_at: string
  asset_model: AssetModel
  asset_type: AssetType
  manufacture: BorrowedFrom
  working_status: IdNamePair
  entity: Entity
  entity_tag: EntityTag
  province: IdNamePair
  regency: IdNamePair
  sub_district: IdNamePair
  village: IdNamePair
  contact_person: ContactPerson
  ownership: Ownership
  borrowed_from: BorrowedFrom
  budget_source: BudgetSource
  electricity: BorrowedFrom
  warranty: Warranty
  calibration: AssetCalibration
  maintenance: AssetCalibration
  status: BorrowedFrom
  programs: Programs
  user_created_by: UserAtedBy
  user_updated_by: UserAtedBy
}

// Response interface
export interface AssetInventoryResponse extends PaginateResponse {
  data: AssetInventory[]
}

// Query parameters for API
export interface AssetInventoryQueryParams extends PaginateParam {
  keyword: string
  asset_type_ids?: string
  manufacture_ids?: string
  working_status_id?: string
}

// Filter parameters
export interface AssetInventoryFilterParams {
  entity_id?: number
  type_id?: number
  model_id?: number
  manufacture_id?: number
  status?: number
  working_status_id?: number
  search?: string
  page?: number
  perPage?: number
}

export interface AssetOptionResponse extends PaginateResponse {
  data: IdNamePair[]
}

export interface AssetUser {
  id: number
  global_id: number
  username: string
  email: string
  firstname: string
  lastname: string
}

export interface AssetUserOptionResponse extends PaginateResponse {
  data: AssetUser[]
}

interface EntityVendor {
  id: number
  name: string
  location: string
  entity_tag_name: string
  is_open_vial: number
  code: string
  status: number
}

export interface EntityVendorOptionResponse extends PaginateResponse {
  data: EntityVendor[]
}

export interface EditAssetInventoryPayload {
  id: number
  data: AssetFormData
}
