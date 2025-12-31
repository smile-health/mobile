import {
  TicketMaterialRequest,
  TicketMaterialResponse,
} from '@/models/order/TicketMaterial'
import api from '../api'

export const ticketMaterialApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendTicketMaterial: build.mutation<
      TicketMaterialResponse,
      TicketMaterialRequest
    >({
      query: (body) => ({
        url: 'main/event-report',
        method: 'POST',
        data: body,
      }),
    }),
  }),
})

export const { useSendTicketMaterialMutation } = ticketMaterialApi
