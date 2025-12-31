export interface BaseFormFields {
  qty?: number
  reason?: string
  detail_reason?: string
}

export interface BatchFormFields extends BaseFormFields {
  batch_code: string
  expired_date: string
}

export interface AddMaterialFormFields extends BaseFormFields {
  materialName: string
  isBatch: number
}
