import {
  ChangeHistory,
  EditPasswordRequest,
  EditProfileRequest,
  ProfileResponse,
} from '@/models'
import api from '../api'

export const profileApi = api.injectEndpoints({
  endpoints: (build) => ({
    fetchProfile: build.query<ProfileResponse, void>({
      query: () => ({
        url: 'core/account/profile',
      }),
      providesTags: ['Profile'],
    }),
    editPassword: build.mutation<any, EditPasswordRequest>({
      query: (data) => ({
        url: 'core/account/update-password',
        method: 'POST',
        data,
      }),
    }),
    editProfile: build.mutation<any, EditProfileRequest>({
      query: ({ userId, ...data }) => ({
        url: `core/users/${userId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, error) => (error ? [] : ['Profile']),
    }),
    getChangeHistory: build.query<ChangeHistory[], number>({
      query: (userId) => ({
        url: `core/users/${userId}/chg_history`,
      }),
    }),
  }),
})

export const {
  useFetchProfileQuery,
  useLazyFetchProfileQuery,
  useEditPasswordMutation,
  useEditProfileMutation,
  useGetChangeHistoryQuery,
} = profileApi
