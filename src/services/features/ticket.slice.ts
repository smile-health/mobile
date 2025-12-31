import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  EventReportResponse,
  GetEventReportFilters,
} from '@/models/order/EventReport'
import { PAGE_SIZE } from '@/utils/Constants'

interface TicketState {
  filter: GetEventReportFilters
  ticketList: EventReportResponse | null
  isLoading: boolean
}

const initialState: TicketState = {
  filter: {
    page: 1,
    paginate: PAGE_SIZE,
    order_id: undefined,
    do_number: undefined,
    status: undefined,
    from_arrived_date: undefined,
    to_arrived_date: undefined,
    entity_id: undefined,
    order_id_do_number: undefined,
  },
  ticketList: null,
  isLoading: false,
}

export const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    setTicketFilter: (
      state,
      action: PayloadAction<Partial<GetEventReportFilters>>
    ) => {
      state.filter = {
        ...state.filter,
        ...action.payload,
      }
    },
    resetTicketFilter: (state) => {
      state.filter = {
        ...initialState.filter,
      }
    },
    setTicketList: (state, action: PayloadAction<EventReportResponse>) => {
      state.ticketList = action.payload
    },
    setTicketLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    resetTicketList: (state) => {
      state.ticketList = null
    },
  },
})

export const {
  setTicketFilter,
  resetTicketFilter,
  setTicketList,
  setTicketLoading,
  resetTicketList,
} = ticketSlice.actions

export default ticketSlice.reducer
