export interface ErrorResponse {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  type?: string
  path?: string
  version?: string
  errors?: Record<string, any>
}

export interface ErrorItem {
  field: string
  message: string
}
