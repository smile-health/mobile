import { BaseEntity } from './BaseEntity'

export interface Activity {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_patient_id: number
  entity_activity_id: number
}

export interface CustomerVendorActivityResponse {
  customer_consumptions: BaseEntity[]
  customers: BaseEntity[]
  vendors: BaseEntity[]
  origin_activities: Activity[]
  activities: Activity[]
}

export const ENTITY_TYPE = {
  VENDOR: 'vendors',
  CUSTOMER: 'customers',
  CUSTOMER_CONSUMPTION: 'customer_consumptions',
} as const

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE]

export const ENTITY_LIST_TYPE = {
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
} as const

export type EntityListType =
  (typeof ENTITY_LIST_TYPE)[keyof typeof ENTITY_LIST_TYPE]

export const ACTIVITY_TYPE = {
  ORIGIN: 'origin_activities',
  ACTIVE: 'activities',
} as const

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE]
