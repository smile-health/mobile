import { createRef } from 'react'
import { Platform } from 'react-native'
import dayjs from 'dayjs'
import { isRunningInExpoGo } from 'expo'
import * as Localization from 'expo-localization'
import { ParseKeys, TFunction } from 'i18next'
import { ShowSnackbarPropType, SnackbarAction } from '@/components/Snackbar'
import i18n from '@/i18n'
import { HomeMenuItem } from '@/models'
import { IOptions } from '@/models/Common'
import { COLOR_BRIGHTNESS_THRESHOLD } from '@/theme/theme.constant'
import {
  NUMERIC_REGEX,
  ORDER_STATUS,
  TICKET_STATUS,
  WORKING_STATUS,
} from './Constants'

dayjs.locale('id')

export const isAndroid = Platform.OS === 'android'

export const isIOS = Platform.OS === 'ios'

export const canShowNetworkLogger = __DEV__ || isRunningInExpoGo()

export const snackbarRef = createRef<SnackbarAction>()

export const showSnackbar = ({
  message,
  type,
  testID,
}: ShowSnackbarPropType) => {
  snackbarRef.current?.show({ message, type, testID })
}

export function showSuccess(message: any, testID?: string) {
  if (!message || typeof message !== 'string') {
    return
  }
  showSnackbar({
    type: 'success',
    message,
    testID,
  })
}

export function showError(message: any, testID?: string) {
  if (!message || typeof message !== 'string') {
    return
  }

  showSnackbar({
    type: 'error',
    message,
    testID,
  })
}

export function insertList(array: never[], data: never) {
  const newArray = [...array, ...data]
  return newArray
}

export function numberFormat(value?: number | null, format?: string) {
  if (typeof value !== 'number') {
    return ''
  }

  return Intl.NumberFormat(format ?? i18n.language).format(value)
}

export function parseNumber(value?: string | null) {
  if (value == null) {
    return 0
  }

  const valueNumber = Number.parseInt(value, 10)
  if (!Number.isNaN(valueNumber)) {
    return valueNumber
  }

  return 0
}

export function parseNumberOrNull(value?: string | null) {
  if (value == null) {
    return null
  }

  const valueNumber = Number.parseInt(value, 10)
  if (!Number.isNaN(valueNumber)) {
    return valueNumber
  }

  return null
}

export function numberToString(value?: number | null) {
  if (value == null) {
    return ''
  }
  return String(value)
}

export function currencyFormat(num: number = 0, currency: string = 'IDR') {
  const locale = Localization.getLocales()[0].languageTag

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(num)
}

export function stringToDate(string: string, inputFormat = null) {
  const date = dayjs(string)
  if (!date.isValid()) {
    return ''
  }
  if (inputFormat) {
    return date.format(inputFormat)
  }
  return date.toDate()
}

export function dateToString(date: string | Date, format: any) {
  const day = dayjs(date)
  if (!day.isValid()) {
    return ''
  }
  return day.format(format)
}

export function numberOrNull(value: string) {
  const number = Number.parseInt(value, 10)
  if (!Number.isNaN(number)) {
    return number
  }
  return null
}

export function getNumericValue(value: string) {
  return value.replaceAll(NUMERIC_REGEX, '')
}

export function getInitials(name: string): string {
  const nameParts = name.toUpperCase().trim().split(/\s+/)

  if (nameParts.length > 1) {
    return nameParts[0][0] + nameParts[1][0]
  }
  return nameParts[0].slice(0, 2)
}

export function getTestID(id?: string) {
  if (!id) {
    return
  }
  return Platform.select({
    android: {
      testID: id,
      accessibilityLabel: id,
    },
    ios: {
      testID: id,
    },
  })
}

export function concatString(
  args: (string | undefined)[],
  separator: string = ', '
) {
  const filters = [...args]
  const clean = filters.filter(Boolean)
  return clean.join(separator)
}

export function getStatusColor(status?: number) {
  const greenStatus = [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.ALLOCATED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.FULFILLED,
  ]

  if (status === ORDER_STATUS.PENDING) {
    return {
      background: 'bg-softIvory',
      border: 'border-softIvory',
      text: 'text-vividOrange',
    }
  }

  if (status === ORDER_STATUS.CANCELLED) {
    return {
      background: 'bg-softPink',
      border: 'border-softPink',
      text: 'text-lavaRed',
    }
  }

  if (status === ORDER_STATUS.DRAFT) {
    return {
      background: 'bg-catskillWhite',
      border: 'border-catskillWhite',
      text: 'text-mediumGray',
    }
  }

  if (greenStatus.includes(status!)) {
    return {
      background: 'bg-mintGreen',
      border: 'border-mintGreen',
      text: 'text-greenPrimary',
    }
  }

  return {
    background: 'bg-mintGreen',
    border: 'border-mintGreen',
    text: 'text-greenPrimary',
  }
}

export function getTicketStatusColor(status?: number) {
  if (status === TICKET_STATUS.PENDING) {
    return {
      background: 'bg-softIvory',
      border: 'border-softIvory',
      text: 'text-vividOrange',
    }
  }

  if (status === TICKET_STATUS.CANCELED) {
    return {
      background: 'bg-softPink',
      border: 'border-softPink',
      text: 'text-lavaRed',
    }
  }

  if (status === TICKET_STATUS.COMPLETED) {
    return {
      background: 'bg-mintGreen',
      border: 'border-mintGreen',
      text: 'text-greenPrimary',
    }
  }

  if (status === TICKET_STATUS.MANUAL_INPUT) {
    return {
      background: 'bg-gray-100',
      border: 'border-gray-50',
      text: 'text-gray-500',
    }
  }

  return {
    background: 'bg-mintGreen',
    border: 'border-mintGreen',
    text: 'text-greenPrimary',
  }
}

export const filterMenuByRole = (
  menuItems: HomeMenuItem[],
  userRole: number
): HomeMenuItem[] => {
  return menuItems.reduce((acc, menu) => {
    const filteredChilds =
      menu.childs?.filter(
        (child) => !child.role || child.role.includes(userRole)
      ) || []

    if (filteredChilds.length > 0) {
      acc.push({ ...menu, childs: filteredChilds })
    }

    return acc
  }, [] as HomeMenuItem[])
}

export const getOptionWithDefaultValue = (
  option: IOptions[],
  t: TFunction,
  defaultLabel: ParseKeys = 'label.all'
) => {
  return [{ value: 0, label: t(defaultLabel) }, ...option]
}

export function formatErrorMessage(error) {
  if (!error) return ''

  let message = error.message || ''

  if (error.errors) {
    message += '\n\n'
    let errorNumber = 1
    const formatNestedErrors = (obj) => {
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          for (const errorMsg of value) {
            message += `${errorNumber}. ${errorMsg}\n`
            errorNumber++
          }
        } else if (typeof value === 'object' && value !== null) {
          formatNestedErrors(value)
        }
      }
    }
    formatNestedErrors(error.errors)
  }

  return message
}

// Mapping for working status
const statusBadgeStyleMap: Record<number, string> = {
  [WORKING_STATUS.FUNCTION]: 'bg-mintGreen rounded-xl p-2',
  [WORKING_STATUS.STANDBY]: 'bg-mintGreen rounded-xl p-2',
  [WORKING_STATUS.REPAIR]: 'bg-softIvory rounded-xl p-2',
  [WORKING_STATUS.DAMAGED]: 'bg-softPink rounded-xl p-2',
  [WORKING_STATUS.UNREPAIRABLE]: 'bg-softPink rounded-xl p-2',
  [WORKING_STATUS.DEFROSTING]: 'bg-yellow50 rounded-xl p-2',
  [WORKING_STATUS.NOT_USED]: 'bg-catskillWhite rounded-xl p-2',
  [WORKING_STATUS.UNSUBCRIBES]: 'bg-catskillWhite rounded-xl p-2',
}

const statusTextStyleMap: Record<number, string> = {
  [WORKING_STATUS.FUNCTION]: 'text-xs font-mainBold text-greenPrimary',
  [WORKING_STATUS.STANDBY]: 'text-xs font-mainBold text-greenPrimary',
  [WORKING_STATUS.REPAIR]: 'text-xs font-mainBold text-vividOrange',
  [WORKING_STATUS.DAMAGED]: 'text-xs font-mainBold text-lavaRed',
  [WORKING_STATUS.UNREPAIRABLE]: 'text-xs font-mainBold text-lavaRed',
  [WORKING_STATUS.DEFROSTING]: 'text-xs font-mainBold text-yellow600',
  [WORKING_STATUS.NOT_USED]: 'text-xs font-mainBold text-mediumGray',
  [WORKING_STATUS.UNSUBCRIBES]: 'text-xs font-mainBold text-mediumGray',
}

export const getStatusBadgeStyle = (statusId: number | string): string => {
  const id =
    typeof statusId === 'string' ? Number.parseInt(statusId, 10) : statusId
  return statusBadgeStyleMap[id] ?? 'bg-catskillWhite rounded-xl p-2'
}

export const getStatusTextStyle = (statusId: number | string): string => {
  const id =
    typeof statusId === 'string' ? Number.parseInt(statusId, 10) : statusId
  return statusTextStyleMap[id] ?? 'text-xs font-mainBold text-mediumGray'
}

/**
 * @param hexcolor - A hex color string (e.g., "#ff0000", "#f00", "ff0000", "f00")
 * @returns - "light" if text should be light (white),
 *            "dark" if text should be dark (black),
 */
export function getReadableTextColor(hexColor: string): 'light' | 'dark' {
  const hex = hexColor.replace(/^#/, '')

  let r: number, g: number, b: number

  if (hex.length === 3) {
    r = Number.parseInt(hex[0] + hex[0], 16)
    g = Number.parseInt(hex[1] + hex[1], 16)
    b = Number.parseInt(hex[2] + hex[2], 16)
  } else {
    r = Number.parseInt(hex.slice(0, 2), 16)
    g = Number.parseInt(hex.slice(2, 4), 16)
    b = Number.parseInt(hex.slice(4, 6), 16)
  }

  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > COLOR_BRIGHTNESS_THRESHOLD ? 'dark' : 'light'
}

export function trimText(text: string): string {
  return text.replaceAll(/(^\s+)|(\s+$)/g, '')
}
