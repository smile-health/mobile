import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Activity } from '@/models'
import { StockItem } from '@/models/shared/Material'

interface StockState {
  stockActivity: Activity
  stockMaterial: StockItem
}

const initialState: StockState = {
  stockActivity: {} as Activity,
  stockMaterial: {} as StockItem,
}

export const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setStockActivity(state, action: PayloadAction<Activity>) {
      state.stockActivity = action.payload
    },
    setStockMaterial(state, action: PayloadAction<StockItem>) {
      state.stockMaterial = action.payload
    },
  },
})

export const { setStockActivity, setStockMaterial } = stockSlice.actions
export const stockReducer = stockSlice.reducer
