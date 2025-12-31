import { Reason } from '@/models/order/Reason'
import api from '../api'

export const reasonApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReasons: build.query<Reason[], void>({
      query: () => ({
        url: 'main/event-report/reasons',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetReasonsQuery } = reasonApi
