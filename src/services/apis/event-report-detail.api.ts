import {
  EventReportDetailResponse,
  UpdateEventReportRequest,
  UpdateEventReportResponse,
} from '@/models/order/EventReportDetail'
import api from '../api'

export const eventReportDetailApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEventReportDetail: build.query<EventReportDetailResponse, number>({
      query: (id) => ({
        url: `main/event-report/${id}`,
        method: 'GET',
      }),
    }),
    updateEventReport: build.mutation<
      UpdateEventReportResponse,
      { id: number; data: UpdateEventReportRequest }
    >({
      query: ({ id, data }) => ({
        url: `main/event-report/${id}`,
        method: 'PUT',
        data,
      }),
    }),
  }),
})

export const { useGetEventReportDetailQuery, useUpdateEventReportMutation } =
  eventReportDetailApi
