import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  DATE_FILTER_FORMAT,
  EXPIRATION_STATUS,
  SHORT_DATE_FORMAT,
  SHORT_DATE_TIME_FORMAT,
} from './Constants'

dayjs.locale('id')

export function dateToString(date: Date, outputFormat: string): string {
  const day = dayjs(date)
  if (!day.isValid()) {
    return ''
  }
  return day.format(outputFormat)
}

export function stringToDate(input: string, inputFormat?: string): Date | null {
  const date = inputFormat ? dayjs(input, inputFormat) : dayjs(input)
  if (!date.isValid()) {
    return null
  }
  return date.toDate()
}

export function getStringUTC(format: string): string {
  dayjs.extend(utc)
  return dayjs.utc().format(format)
}

export function stringToDateUTC(input: string, inputFormat: string) {
  const date = dayjs(input)
  dayjs.extend(utc)
  if (!date.isValid()) {
    return ''
  }
  if (inputFormat) {
    return dayjs.utc(input, inputFormat, false)
  }
  return dayjs.utc(input).toDate()
}

export function convertString(
  input: dayjs.ConfigType,
  outputFormat?: string,
  inputFormat?: dayjs.OptionType
): string {
  const date = dayjs(input || '', inputFormat)
  if (!date.isValid()) {
    return ''
  }
  if (
    outputFormat === SHORT_DATE_FORMAT ||
    outputFormat === SHORT_DATE_TIME_FORMAT
  ) {
    return date.format(outputFormat).toUpperCase()
  }
  return date.format(outputFormat)
}

export function checkExpiration(expiredDate: dayjs.ConfigType) {
  const currentDate = dayjs()
  const expiration = dayjs(expiredDate)

  const isExpired = !expiration.isAfter(currentDate, 'day')
  const isNearExpired =
    expiration.isAfter(currentDate) && expiration.diff(currentDate, 'day') <= 30

  if (isExpired) return EXPIRATION_STATUS.EXPIRED
  if (isNearExpired) return EXPIRATION_STATUS.NEAR_ED
  return EXPIRATION_STATUS.VALID
}

export function isDateToday(
  input: dayjs.ConfigType,
  inputFormat: string = DATE_FILTER_FORMAT
) {
  const todayFormatted = dayjs().format(inputFormat)

  return input === todayFormatted
}

/**
 * @param num num day want to substract
 * @param inputFormat
 * @returns string formated date
 */
export function getDaysBefore(num: number, inputFormat = DATE_FILTER_FORMAT) {
  return dayjs().subtract(num, 'day').format(inputFormat)
}

/**
 * @param num num day want to added
 * @param inputFormat
 * @returns string formated date
 */
export function getDaysAfter(num: number, inputFormat = DATE_FILTER_FORMAT) {
  return dayjs().add(num, 'day').format(inputFormat)
}

export function isTimePassed(
  timestamp: number,
  unit: dayjs.ManipulateType,
  value: number
) {
  // Get current timestamp
  const now = Date.now()

  // Calculate the duration threshold
  const threshold = dayjs(now).subtract(value, unit)

  // Compare the original timestamp with the threshold
  return dayjs(timestamp).isBefore(threshold)
}

export function getDateRangeText(
  startDate: dayjs.ConfigType,
  endDate: dayjs.ConfigType,
  format = SHORT_DATE_FORMAT
) {
  if (!startDate || !endDate) return

  const start = convertString(startDate, format)
  const end = convertString(endDate, format)
  return `${start} - ${end}`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}
