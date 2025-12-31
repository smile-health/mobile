import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { StockItem } from '@/models/shared/Material'
import { StockTakingMaterialDetail } from '@/models/stock-taking/CreateStockTaking'
import { Period as StockTakingPeriod } from '@/models/stock-taking/StockTakingPeriod'

export interface StockTakingState {
  detail: StockTakingMaterialDetail
  parentMaterial?: StockItem
  period?: StockTakingPeriod
}

const initialState: StockTakingState = {
  detail: {} as StockTakingMaterialDetail,
}

export const stockTakingSlice = createSlice({
  name: 'stockTaking',
  initialState,
  reducers: {
    setPeriod: (
      state,
      { payload }: PayloadAction<StockTakingPeriod | undefined>
    ) => {
      state.period = payload
    },
    setParentMaterial: (state, { payload }: PayloadAction<StockItem>) => {
      state.parentMaterial = payload
    },
    setMaterialDetail: (
      state,
      { payload }: PayloadAction<StockTakingMaterialDetail>
    ) => {
      state.detail = payload
    },
  },
})

export const { setPeriod, setMaterialDetail, setParentMaterial } =
  stockTakingSlice.actions
export const stockTakingReducer = stockTakingSlice.reducer
