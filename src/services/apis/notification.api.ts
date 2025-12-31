import { NotifResponse } from '@/models'
import {
  AppNotifMaterial,
  AppNotifMaterialParams,
} from '@/models/notif/AppNotifMaterial'
import { NotifOrderNotReceivedResponse } from '@/models/notif/Notif'
import {
  NotificationCountResponse,
  NotificationListFilter,
  NotificationListResponse,
} from '@/models/notif/NotificationList'
import { PaginateParam } from '@/models/Paginate'
import { DATE_CREATED_FORMAT } from '@/utils/Constants'
import { getStringUTC } from '@/utils/DateFormatUtils'
import api from '../api'
import { initialPageParam } from '../api.constant'
import { getNextPageParam } from '../helper/api-helper'

export const notificationApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAppNotif: build.query<NotifResponse, void>({
      query: () => ({
        url: 'core/app/notif',
        method: 'GET',
      }),
    }),
    getOrderNotif: build.query<
      NotifOrderNotReceivedResponse,
      number | undefined
    >({
      query: (entityId) => ({
        url: 'main/app/notif/order',
        method: 'GET',
        params: entityId ? { entity_id: entityId } : undefined,
      }),
    }),
    getAppNotifMaterial: build.query<AppNotifMaterial, AppNotifMaterialParams>({
      query: (params) => ({
        url: 'main/app/notif/material',
        params,
      }),
    }),
    getNotificationCount: build.query<NotificationCountResponse, any>({
      query: () => ({
        url: 'core/notifications/count',
      }),
      providesTags: ['NotificationCount'],
    }),
    getNotifications: build.infiniteQuery<
      NotificationListResponse,
      NotificationListFilter,
      PaginateParam
    >({
      infiniteQueryOptions: { initialPageParam, getNextPageParam },
      query: (params) => ({
        url: 'core/notifications',
        params: {
          ...params.pageParam,
          ...params.queryArg,
        },
      }),
      providesTags: ['Notification'],
    }),
    readSingleNotification: build.mutation<any, number>({
      query: (notificationId) => ({
        url: `core/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      onQueryStarted: async (
        notificationId,
        { dispatch, queryFulfilled, getState }
      ) => {
        const patches: any[] = []
        // use Optimistic update notification read status
        try {
          const state = getState()
          const queries = state.api?.queries

          //early return
          if (!queries) {
            await queryFulfilled
            return
          }

          const relevantQueries = Object.entries(queries).filter(
            ([key, value]) => key.startsWith('getNotifications(') && value?.data
          )

          for (const [, queryValue] of relevantQueries) {
            const patch = dispatch(
              notificationApi.util.updateQueryData(
                'getNotifications',
                queryValue?.originalArgs as NotificationListFilter,
                (draft) => {
                  const pageLength = draft?.pages?.length
                  if (!pageLength) return

                  for (let pageIndex = 0; pageIndex < pageLength; pageIndex++) {
                    const page = draft.pages[pageIndex]
                    if (!page?.data || !Array.isArray(page.data)) continue

                    const notificationIndex = page.data.findIndex(
                      (n) => n.id === notificationId
                    )

                    if (notificationIndex !== -1) {
                      const notification = page.data[notificationIndex]

                      // Only update if not already read
                      if (!notification.read_at) {
                        page.data[notificationIndex] = {
                          ...notification,
                          read_at: getStringUTC(DATE_CREATED_FORMAT),
                        }
                        break // Exit loop once found and updated
                      }
                    }
                  }
                }
              )
            )
            patches.push(patch)
          }
          await queryFulfilled
        } catch (error) {
          // Rollback all patches on error
          for (const patch of patches) patch.undo()
          throw error
        }
      },
      invalidatesTags: () => ['NotificationCount'],
    }),
    readAllNotification: build.mutation<any, void>({
      query: () => ({
        url: `core/notifications/read`,
        method: 'PUT',
      }),
      invalidatesTags: () => ['NotificationCount', 'Notification'],
    }),
  }),
})

export const {
  useGetAppNotifQuery,
  useGetOrderNotifQuery,
  useGetNotificationCountQuery,
  useGetAppNotifMaterialQuery,
  useReadSingleNotificationMutation,
  useReadAllNotificationMutation,
  useGetNotificationsInfiniteQuery,
  useLazyGetNotificationCountQuery,
} = notificationApi
