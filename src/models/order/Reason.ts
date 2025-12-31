export type ReasonApiChild = { id: number; name?: string; title?: string }

export type ReasonApiResponse = {
  id: number | string
  name?: string
  title?: string
  child?: ReasonApiChild[]
}

export interface ReasonChild {
  label: string
  value: string
}
export interface Reason {
  label: string
  value: string
  children: ReasonChild[]
}
export interface ReasonResponse {
  data: Reason[]
}
export interface CancelReason {
  id: number
  name: string
}

export interface TransformCancelReason {
  reason_id: number
  value: string
}

export interface OrderCancelReasonsResponse {
  data: CancelReason[]
}
