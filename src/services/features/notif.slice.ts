import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { NotifResponse } from '@/models'
import { AppNotifMaterial } from '@/models/notif/AppNotifMaterial'
import { notifMockApi } from '@/temporary/mock-endpoint'
import { notificationApi } from '../apis/notification.api'
import { RootState } from '../store'

interface NotifState {
  notif: Record<string, NotifResponse>
  notifMaterial: Record<number, AppNotifMaterial | undefined>
}

const initialState: NotifState = {
  notif: {},
  notifMaterial: {},
}

export const notifSlice = createSlice({
  name: 'notif',
  initialState,
  reducers: {
    setNotifData(
      state,
      action: PayloadAction<{ key: string; data: NotifResponse }>
    ) {
      const { key, data } = action.payload
      state.notif[key] = data
    },
    clearNotifData(state, action: PayloadAction<string | undefined>) {
      if (action.payload) {
        delete state.notif[action.payload]
      } else {
        state.notif = {}
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      notifMockApi.endpoints.fetchNotifMock.matchFulfilled,
      (state, { payload }) => {
        for (const [key, value] of Object.entries(payload)) {
          state.notif[key] = value
        }
      }
    )
    builder.addMatcher(
      notificationApi.endpoints.getAppNotifMaterial.matchFulfilled,
      (state, { payload, meta: { arg } }) => {
        state.notifMaterial[arg.originalArgs.programId] = payload
      }
    )
    builder.addMatcher(
      notificationApi.endpoints.getOrderNotif.matchFulfilled,
      (state, { payload }) => {
        if (payload?.order_not_received) {
          state.notif['order_not_received'] = payload.order_not_received
        }
      }
    )
  },
})

export const getAppNotifMaterial = createSelector(
  [
    (state: RootState) => state.workspace.selectedWorkspace?.id ?? 0,
    (state: RootState) => state.notif.notifMaterial,
  ],
  (programId, notifMaterial) => {
    return notifMaterial[programId]
  }
)

export const { setNotifData, clearNotifData } = notifSlice.actions
export const notifReducer = notifSlice.reducer
