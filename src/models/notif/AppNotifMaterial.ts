export interface AppNotifMaterialParams {
  programId: number
  entity_id?: number
}

export interface AppNotifMaterial {
  activities: AppNotifActivity[]
  expired: number
  expired_in_30_day: number
  id: number
  name: string
}

export interface AppNotifActivity {
  expired: number
  expired_in_30_day: number
  id: number
  name: string
  parent_materials?: AppNotifActivityParentMaterial[]
  materials?: AppNotifActivityParentMaterial[]
}

export interface AppNotifActivityParentMaterial {
  expired: number
  expired_in_30_day: number
  id: number
  name: string
  materials?: AppNotifActivityMaterial[]
}

export interface AppNotifActivityMaterial {
  expired: number
  expired_in_30_day: number
  id: number
  name: string
}
