import { Activity, GetEntityActivityParams } from '@/models/shared/Activity'
import {
  EntityUserResponse,
  GetEntityUserParams,
} from '@/models/shared/EntityUser'
import api from '../api'

export const entityApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEntityActivity: build.query<Activity[], GetEntityActivityParams>({
      query: ({ is_ongoing = 1, entityId }) => ({
        url: `main/entities/${entityId}/activities`,
        method: 'GET',
        params: { is_ongoing },
      }),
    }),
    getEntityUser: build.query<EntityUserResponse, GetEntityUserParams>({
      query: ({ entity_id, ...params }) => ({
        url: `main/entities/${entity_id}/users`,
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { keyword } = queryArgs
        return { keyword }
      },
      merge: ({ data: currentData }, newItems, { arg }) => {
        return arg.page === 1
          ? newItems
          : { ...newItems, data: [...currentData, ...newItems.data] }
      },
      forceRefetch({ currentArg, previousArg }) {
        if (!currentArg || !previousArg) return true
        const { page: currentPage, keyword: currentKeyword } = currentArg
        const { page: prevPage, keyword: prevKeyword } = previousArg

        const pageChanged = currentPage !== prevPage
        const paramChanged = currentKeyword !== prevKeyword
        return pageChanged || paramChanged
      },
    }),
  }),
})

export const { useGetEntityActivityQuery, useGetEntityUserQuery } = entityApi
