import {
  EventReportStatusCountParams,
  EventReportStatusItem,
} from '@/models/order/EventReport'
import api from '../api'

export const eventReportCountApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEventReportStatusCount: build.query<
      EventReportStatusItem[],
      EventReportStatusCountParams
    >({
      query: (params) => ({
        url: 'main/event-report/status-count',
        params,
      }),
    }),
  }),
})

export const { useGetEventReportStatusCountQuery } = eventReportCountApi
