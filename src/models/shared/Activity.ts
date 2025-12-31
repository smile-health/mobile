export interface Activity {
  id: number
  name: string
  join_date: string
  end_date: string
}

export interface GetEntityActivityParams {
  entityId?: number
  is_ongoing?: number
}
