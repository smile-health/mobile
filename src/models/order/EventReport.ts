import { PaginateResponse } from '../Paginate'

export interface EventReportStatusCountParams {
  entity_id?: string
  from_arrived_date?: string
  to_arrived_date?: string
}

export interface EventReportStatusItem {
  status_id: number | null
  count: number
  label: string
}

export interface EventReportTypeResponse {
  data: EventReportStatusItem[]
}

export interface EventReportItem {
  id: number
  status_id: number
  status: string
  name: string
  order_id: number
  packing_slip_no: string
  arrived_date: string
  created_at: string
  updated_at: string
  do_number: string
  entity_id: string
}

export interface EventReportResponse extends PaginateResponse {
  data: EventReportItem[]
}

export interface GetEventReportFilters {
  page?: string | number
  paginate?: string | number
  order_id?: string
  do_number?: string
  status?: string
  from_arrived_date?: string
  to_arrived_date?: string
  entity_id?: string
  order_id_do_number?: string
}

export interface TicketFilterFormValues {
  order_id: string
  do_number: string
  entity_id: string
  from_arrived_date: string
  to_arrived_date: string
}
