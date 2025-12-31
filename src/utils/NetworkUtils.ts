import NetInfo from '@react-native-community/netinfo'
import axios from 'axios'
import i18n from '@/i18n'
import { ErrorResponse } from '@/models'
import { showError } from './CommonUtils'

export async function isNetworkAvailable() {
  const response = await NetInfo.fetch()
  return response.isConnected
}

export async function isNetworkReachable() {
  const response = await NetInfo.fetch()
  return response.isInternetReachable
}

export async function checkNetworkStatus() {
  const response = await NetInfo.fetch()
  return {
    isConnected: response.isConnected,
    isReachable: response.isInternetReachable ?? response.isConnected,
  }
}

const generateError = (message: string, status?: number): ErrorResponse => {
  return {
    message,
    status,
  }
}

export function handleError(error: unknown): ErrorResponse {
  if (!axios.isAxiosError(error)) {
    return generateError(i18n.t('error.network_response'))
  }
  if (!error.request) {
    return generateError(error.message ?? i18n.t('error.network_request'))
  }
  if (!error.response) {
    return generateError(i18n.t('error.network_timeout'))
  }

  const {
    response: { status, data },
  } = error

  if (status != 422 && data.message) {
    return data
  }

  if (status === 422) {
    return data
  }

  return generateError(i18n.t('error.network_response'))
}

export function showNetworkError(error: unknown, testID?: string) {
  setTimeout(() => {
    if ((error as ErrorResponse).message) {
      showError((error as ErrorResponse).message, testID)
    }
  }, 200)
}
