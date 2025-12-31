export interface PaginateResponse {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
}

export interface PaginateParam {
  page?: number
  paginate?: number
}
