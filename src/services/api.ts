/* eslint-disable unicorn/numeric-separators-style */
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import axios, { AxiosRequestConfig } from 'axios'
import Config from '@/config'
import i18n from '@/i18n'
import { clearLocalData } from '@/storage'
import { showError } from '@/utils/CommonUtils'
import { navigateToLogin } from '@/utils/NavigationUtils'
import { handleError, checkNetworkStatus } from '@/utils/NetworkUtils'
import { API_HEADERS, API_TAG_TYPE, API_TIMEOUT_MS } from './api.constant'

const axiosInstance = axios.create({
  baseURL: Config.BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: API_HEADERS,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const { isConnected, isReachable } = await checkNetworkStatus()

    if (!isConnected) {
      throw new axios.Cancel(i18n.t('error.network_unavailable'))
    } else if (!isReachable) {
      throw new axios.Cancel(i18n.t('error.network_unstable'))
    }

    config.headers['timezone'] =
      Intl.DateTimeFormat().resolvedOptions().timeZone
    return config
  },
  (error) => Promise.reject(new Error(error))
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearLocalData()
      navigateToLogin()
      showError(i18n.t('error.session-ended'), 'snackbar-error-sessionended')
    }
    throw error
  }
)

export const setAuthToken = (authToken: string) => {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${authToken}`
}

export const removeAuthToken = () => {
  axiosInstance.defaults.headers.common.Authorization = null
}

export const setApiLanguage = (language: string) => {
  axiosInstance.defaults.headers.common['Accept-Language'] = language
}

export const setApiProgramId = (id: number | null) => {
  axiosInstance.defaults.headers.common['X-Program-Id'] = id
}

const axiosBaseQuery = (): BaseQueryFn<AxiosRequestConfig> => async (args) => {
  try {
    const result = await axiosInstance(args)
    return { data: result.data }
  } catch (axiosError) {
    const err = handleError(axiosError)
    return {
      error: err,
    }
  }
}

const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: Object.values(API_TAG_TYPE),
})

export const { resetApiState } = api.util

export default api
