import { NotifOrderNotReceivedResponse } from '@/models'
import api from '@/services/api'

export const notifMockApi = api.injectEndpoints({
  endpoints: (build) => ({
    fetchNotifMock: build.query<NotifOrderNotReceivedResponse, void>({
      query: () => ({
        url: 'https://mock.apidog.com/m1/661135-631964-default/app/notif',
        method: 'GET',
      }),
    }),
  }),
})

export const { useFetchNotifMockQuery } = notifMockApi
