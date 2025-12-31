interface TransactionReason {
  id: number
  title: string
  title_en: string
  is_other: number
  is_purchase: number
}

export interface TransactionTypesResponse {
  id: number
  title: string
  title_en: string
  transaction_reasons: TransactionReason[]
}
