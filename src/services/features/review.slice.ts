import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface ReviewItem {
  code: string
  production_date: string
  manufacture_name: string
  expired_date: string
  qty: number
}

interface ReviewState {
  review: ReviewItem[]
}

const initialState: ReviewState = {
  review: [],
}

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    setReview(state, action: PayloadAction<any>) {
      state.review = [...state.review, ...action.payload]
    },
    clearReview(state) {
      state.review = []
    },
  },
})

export const { setReview, clearReview } = reviewSlice.actions
export const reviewReducer = reviewSlice.reducer
