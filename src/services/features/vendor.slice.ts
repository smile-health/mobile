import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { BaseEntity } from '@/models'

interface VendorState {
  vendor: BaseEntity | null
}

const initialState: VendorState = {
  vendor: null,
}

export const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setSelectedVendor(state, action: PayloadAction<BaseEntity>) {
      state.vendor = action.payload
    },
  },
})

export const { setSelectedVendor } = vendorSlice.actions
export const vendorReducer = vendorSlice.reducer
