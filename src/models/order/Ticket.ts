export interface TicketBatch {
  batch_code: string | null
  expired_date: string
  qty: number
  reason: string
  detail_reason: string
}

export interface TicketMaterial {
  id: number
  name: string
  custom_material?: string
  material_name?: string
  is_managed_in_batch?: boolean
  qty?: number
  batches?: TicketBatch[]
  doNumber?: string
  arrivalDate?: string
  isSubmitted: number | undefined
  reason?: string
  detail_reason?: string
  child_reason?: string
  updatedAt?: string
  batch_code?: string
}
