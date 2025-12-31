interface EntityTag {
  id: number
  title: string
  is_open_vial: number
}

export interface BaseEntity {
  id: number
  name: string
  address: string
  code: string
  status: number
  entity_tag: EntityTag
  activities: number[]
}
