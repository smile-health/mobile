import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { HomeMenuChildItem } from '@/models'

interface HomeState {
  activeMenu: HomeMenuChildItem | null
}

const initialState: HomeState = {
  activeMenu: null,
}

export const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setActiveMenu(state, action: PayloadAction<HomeMenuChildItem | null>) {
      state.activeMenu = action.payload
    },
  },
})

export const { setActiveMenu } = homeSlice.actions
export const homeReducer = homeSlice.reducer
