import { CommonObject } from '../Common'

interface Manufacture {
  id: number
  name: string
  description: string
}

interface MaterialCompanion {
  id: number
  name: string
  code: string
}

export interface ActivityMinMax {
  activity_id: number
  min: number
  max: number
}

interface ManufactureDetail {
  id: number
  name: string
  address: string | null
  production_year: number | null
  production_date: string | null
}

interface MaterialBatch {
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_id: number
  manufacture: ManufactureDetail
}

export interface MaterialStock {
  stock_id: number
  batch_id: number
  created_by: number
  updated_by: number
  activity_id: number
  open_vial: number
  year: number | null
  price: number | null
  total_price: number | null
  budget_source: CommonObject | null
  budget_source_id: number | null
  batch: MaterialBatch
  qty: number
  in_transit: number
  allocated: number
  available: number
  created_at: string
  updated_at: string
}

export interface ActivityProtocol {
  key: string
  material_id: number
  activity_id: number
  is_sequence: number
  is_patient_needed: number
}

export interface Material {
  id: number
  program_id: number
  name: string
  description: string
  unit_of_distribution: string
  unit_of_consumption: string
  unit_of_consumption_id: number
  consumption_unit_per_distribution_unit: number
  hierarchy_code: string | null
  code: string
  pieces_per_unit: number
  unit: string
  min_temperature: number
  max_temperature: number
  is_managed_in_batch: number
  status: number
  is_stockcount: number
  is_addremove: number
  is_temperature_sensitive: number
  is_open_vial: number
  material_type_id: number
  material_type: string
  material_level_id: number
  parent_id: number
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
  manufactures: Manufacture[]
  material_companion: MaterialCompanion[]
  total_qty: number
  total_in_transit_qty: number
  total_allocated_qty: number
  total_open_vial_qty: number
  total_exterminated_qty: number
  total_available_qty: number
  min: number
  max: number
  activities: number[]
  activityMinMax: ActivityMinMax[]
  activity_protocols: ActivityProtocol[]
  stocks: MaterialStock[]
  material_hierarchy: Material[] | null
}

export type AppDataMaterialResponse = Material[]
