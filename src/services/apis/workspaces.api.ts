import { Workspace, WorkspaceResponse } from '@/models'
import {
  GetEntityUserParams,
  UserGlobalResponse,
} from '@/models/shared/EntityUser'
import api from '../api'

export const workspaceApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWorkspaces: build.query<Workspace[], void>({
      query: () => ({
        url: 'core/account/workspaces',
        method: 'GET',
      }),
      transformResponse: (response: WorkspaceResponse) => {
        return response.workspaces || []
      },
    }),
    getUsers: build.query<UserGlobalResponse, GetEntityUserParams>({
      query: ({ entity_id, ...params }) => ({
        url: `core/users`,
        method: 'GET',
        params: { entity_id, ...params },
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { keyword } = queryArgs
        return { keyword }
      },
      merge: ({ data: currentData }, newItems, { arg }) => {
        if (arg.page === 1) return newItems

        return { ...newItems, data: [...currentData, ...newItems.data] }
      },
    }),
  }),
})

export const { useGetWorkspacesQuery, useGetUsersQuery } = workspaceApi
