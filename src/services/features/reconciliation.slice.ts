import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity } from '@/models'
import { Material } from '@/models/app-data/Materials'

export interface ReconciliationState {
  activity: Activity
  material: Material
}

const initialState: ReconciliationState = {
  activity: {} as Activity,
  material: {} as Material,
}

export const reconciliationSlice = createSlice({
  name: 'reconciliation',
  initialState,
  reducers: {
    setActivity: (state, { payload }: PayloadAction<Activity>) => {
      state.activity = payload
    },
    setMaterial: (state, { payload }: PayloadAction<Material>) => {
      state.material = payload
    },
  },
})

export const { setActivity, setMaterial } = reconciliationSlice.actions
export const reconciliationReducer = reconciliationSlice.reducer
