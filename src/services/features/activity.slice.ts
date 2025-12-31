import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Activity } from '@/models/'

interface HomeState {
  activeActivity: Activity | null
}

const initialState: HomeState = {
  activeActivity: null,
}

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActiveActivity(state, action: PayloadAction<Activity>) {
      state.activeActivity = action.payload
    },
  },
})

export const { setActiveActivity } = activitySlice.actions
export const activityReducer = activitySlice.reducer
