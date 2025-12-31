import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { t } from 'i18next'
import { ReasonOption } from '@/models/Common'
import { ORDER_REASON_TYPE } from '@/utils/Constants'
import { orderApi } from '../apis/order.api'

type OrderReasonType =
  (typeof ORDER_REASON_TYPE)[keyof typeof ORDER_REASON_TYPE]

interface ReasonOrderState {
  reasonOptions: {
    [key in OrderReasonType]: ReasonOption[]
  }
}

const initialState: ReasonOrderState = {
  reasonOptions: {
    [ORDER_REASON_TYPE.REQUEST]:
      t('order.order_reasons', { returnObjects: true }) || [],
    [ORDER_REASON_TYPE.RELOCATION]: [],
    [ORDER_REASON_TYPE.SIHA]: [],
  },
}

export const reasonOrderSlice = createSlice({
  name: 'reasonOrder',
  initialState,
  reducers: {
    // Untuk set reason options berdasarkan order_type
    setReasonOptions: (
      state,
      action: PayloadAction<{
        orderType: OrderReasonType
        reasons: ReasonOption[]
      }>
    ) => {
      const { orderType, reasons } = action.payload
      state.reasonOptions[orderType] = reasons
    },
    // Untuk set semua reason options sekaligus
    setAllReasonOptions: (
      state,
      action: PayloadAction<{ [key in OrderReasonType]: ReasonOption[] }>
    ) => {
      state.reasonOptions = action.payload
    },
    // Untuk clear reason options berdasarkan order_type
    clearReasonOptions: (state, action: PayloadAction<OrderReasonType>) => {
      state.reasonOptions[action.payload] = []
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      orderApi.endpoints.getOrderReasons.matchFulfilled,
      (state, { payload, meta }) => {
        // Ambil order_type dari parameter yang dikirim
        const orderType =
          meta.arg.originalArgs?.order_type || ORDER_REASON_TYPE.REQUEST

        // Simpan ke state berdasarkan order_type
        state.reasonOptions[orderType] = payload.data.map((item) => ({
          reason_id: item.id,
          value: item.name,
        }))
      }
    )
  },
})

export const { setReasonOptions, setAllReasonOptions, clearReasonOptions } =
  reasonOrderSlice.actions
export const reasonOrderReducer = reasonOrderSlice.reducer
