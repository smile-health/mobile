import {
  EventReportResponse,
  GetEventReportFilters,
} from '@/models/order/EventReport'
import api from '../api'
import { API_CONFIG } from '../api.constant'
import { setTicketList, setTicketLoading } from '../features/ticket.slice'

export const eventReportApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEventReportList: build.query<EventReportResponse, GetEventReportFilters>(
      {
        query: (params) => ({
          url: 'main/event-report',
          params,
        }),
        keepUnusedDataFor: API_CONFIG.CACHE_TIME.DEFAULT,
        extraOptions: {
          maxRetries: API_CONFIG.RETRY.MAX_RETRIES,
        },
        merge: (currentCache, newItems, { arg }) => {
          if (arg.page === 1) {
            return newItems
          }

          return { ...newItems, data: [...currentCache.data, ...newItems.data] }
        },
        transformResponse: (response: EventReportResponse) => {
          const uniqueData = response.data.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          )

          return { ...response, data: uniqueData }
        },
        onQueryStarted: async (params, { dispatch, queryFulfilled }) => {
          dispatch(setTicketLoading(true))

          try {
            const { data } = await queryFulfilled
            dispatch(setTicketList(data))
          } catch (error) {
            console.error('Error fetching ticket list:', error)
          } finally {
            dispatch(setTicketLoading(false))
          }
        },
      }
    ),
  }),
})

export const { useGetEventReportListQuery } = eventReportApi
