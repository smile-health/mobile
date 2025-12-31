export interface EventReportDetailItem {
  id: number
  material_name: string
  custom_material: string | null
  qty: number
  batch_code: string
  expired_date: string
  production_date: string
  reason: string
  child_reason: string
  created_at: string
  updated_at: string
}

export interface EventReportComment {
  id: number
  comment: string
  created_at: string
  user: {
    id: number
    firstname: string
    lastname: string
  }
}

export interface EventReportHistory {
  id: number
  status_id: number
  status_label: string
  created_at: string
  created_by: {
    id: number
    firstname: string
    lastname: string
  }
}

export interface EventReportFollowUpStatus {
  status_id: number
  status_label: string
}

export interface EventReportDetailResponse {
  id: number
  status_id: number
  status_label: string
  order_id: number
  do_number: string
  packing_slip_no: string | null
  has_order: number
  arrived_date: string
  slip_link: string | null
  entity: {
    id: number
    name: string
    address: string
    type: number
    status: number
  }
  items: EventReportDetailItem[]
  comments: EventReportComment[]
  history_change_status: EventReportHistory[]
  follow_up_status: EventReportFollowUpStatus[]
  created_at: string
  finished_at: string | null
  canceled_at: string | null
  updated_at: string
  user_created_by: {
    id: number
    firstname: string
    lastname: string
  }
  user_updated_by: {
    id: number
    firstname: string
    lastname: string
  }
  user_finished_by: {
    id: number
    firstname: string
    lastname: string
  } | null
}

export interface UpdateEventReportRequest {
  update_status_id: number
  comment?: string | null
}

export interface UpdateEventReportResponse {
  success: boolean
  message: string
  data?: EventReportDetailResponse
}
