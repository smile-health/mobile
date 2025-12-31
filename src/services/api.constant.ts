import { PAGE_SIZE } from '@/utils/Constants'

export const API_TIMEOUT_MS = 60_000

export const API_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'device-type': 'mobile',
}

export const API_TAG_TYPE = {
  AUTH: 'Auth',
  PROFILE: 'Profile',
  NOTIFICATION: 'Notification',
  NOTIFICATION_COUNT: 'NotificationCount',
}

export const initialPageParam = {
  page: 1,
  paginate: PAGE_SIZE,
}

export const API_CONFIG = {
  CACHE_TIME: {
    DEFAULT: 60, // seconds
  },
  RETRY: {
    MAX_RETRIES: 3,
  },
} as const
