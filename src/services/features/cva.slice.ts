import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  ActivityType,
  BaseEntity,
  CustomerVendorActivityResponse,
  EntityType,
} from '@/models'
import { saveLocalData } from '@/storage'
import { cvaApi } from '../apis/cva.api'
import { RootState } from '../store'

export interface CVAState {
  lastUpdated: number | null
  cva: CustomerVendorActivityResponse
}

const initialState: CVAState = {
  lastUpdated: null,
  cva: {
    customer_consumptions: [],
    customers: [],
    vendors: [],
    origin_activities: [],
    activities: [],
  },
}

export const cvaSlice = createSlice({
  name: 'cva',
  initialState,
  reducers: {
    setCVA(state, { payload }: PayloadAction<CVAState>) {
      state.lastUpdated = payload.lastUpdated
      state.cva = payload.cva
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      cvaApi.endpoints.getCVA.matchFulfilled,
      (state, { payload, meta: { arg } }) => {
        state.cva = payload
        state.lastUpdated = Date.now()
        saveLocalData(`cva-${arg.originalArgs}`, state)
      }
    )
  },
})

export const { setCVA } = cvaSlice.actions
export const cvaReducer = cvaSlice.reducer

export const getActivities = createSelector(
  [(state: RootState) => state.cva.cva, (_state, type: ActivityType) => type],
  (cva, type) => {
    return cva[type]
  }
)

export const getEntities = createSelector(
  [(state: RootState) => state.cva.cva, (_state, type: EntityType) => type],
  (cva, type) => {
    return cva[type]
  }
)

export const getEntityActivity = createSelector(
  [(state: RootState) => state.cva.cva],
  (cva) => (filter: { type: EntityType; activityId: number }) => {
    return (cva[filter.type] as BaseEntity[]).filter((ac) =>
      ac.activities.includes(filter.activityId)
    )
  }
)

export const getActivityOption = createSelector(
  [(state: RootState) => state.cva.cva],
  (cva) => {
    return cva.origin_activities.map((ac) => ({
      label: ac.name,
      value: ac.id,
    }))
  }
)

const mapEntityToOption = (entities: BaseEntity[]) => {
  return entities.map((entity) => ({
    label: entity.name,
    value: entity.id,
  }))
}

export const getEntityOption = createSelector(
  [(state: RootState) => state.cva.cva],
  ({ customers, vendors }) => {
    return {
      customers: mapEntityToOption(customers),
      vendors: mapEntityToOption(vendors),
    }
  }
)
