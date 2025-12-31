import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { VaccineType } from '@/models/transaction/VaccineSequence'
import { vaccineSequenceApi } from '../apis/vaccine-sequence.api'

interface VaccineSequenceState {
  rabiesSequences: VaccineType[]
}

const initialState: VaccineSequenceState = {
  rabiesSequences: [],
}

export const vaccineSequenceSlice = createSlice({
  name: 'vaccineSequence',
  initialState,
  reducers: {
    setRabiesSequences(
      state,
      { payload }: PayloadAction<VaccineType[] | undefined>
    ) {
      state.rabiesSequences = payload ?? []
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      vaccineSequenceApi.endpoints.getRabiesSequence.matchFulfilled,
      (state, { payload }) => {
        state.rabiesSequences = payload
      }
    )
  },
})

export const { setRabiesSequences } = vaccineSequenceSlice.actions

export const vaccineSequenceReducer = vaccineSequenceSlice.reducer
