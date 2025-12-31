import { LoginRequest, RequestLoginV2Response } from '@/models'
import api from '../api'

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    loginUser: build.mutation<RequestLoginV2Response, LoginRequest>({
      query: (data) => ({
        url: 'auth/login',
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data,
      }),
    }),
    logout: build.mutation<unknown, void>({
      query: () => ({
        url: 'core/account/logout',
        method: 'POST',
      }),
    }),
  }),
})

export const { useLoginUserMutation, useLogoutMutation } = authApi
