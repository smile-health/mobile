import { DevSettings, I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type TextDirection = 'ltr' | 'rtl'
// 'auto' follows the active language; 'ltr' / 'rtl' are manual overrides.
export type DirectionPreference = 'auto' | TextDirection

export const RTL_LANGUAGES = ['ar']
export const DIRECTION_STORAGE_KEY = 'textDirection'

const PREFERENCES: DirectionPreference[] = ['auto', 'ltr', 'rtl']

export const isRtlLanguage = (language?: string | null) =>
  !!language && RTL_LANGUAGES.includes(language.toLowerCase().split('-')[0])

export const resolveDirection = (
  language: string | null | undefined,
  preference: DirectionPreference = 'auto'
): TextDirection => {
  if (preference !== 'auto') return preference
  return isRtlLanguage(language) ? 'rtl' : 'ltr'
}

export const parsePreference = (
  value: string | null | undefined
): DirectionPreference =>
  PREFERENCES.includes(value as DirectionPreference)
    ? (value as DirectionPreference)
    : 'auto'

export const nextPreference = (
  current: DirectionPreference
): DirectionPreference =>
  PREFERENCES[(PREFERENCES.indexOf(current) + 1) % PREFERENCES.length]

export const getDirectionPreference = async () =>
  parsePreference(await AsyncStorage.getItem(DIRECTION_STORAGE_KEY))

export const saveDirectionPreference = async (
  preference: DirectionPreference
) => {
  await (preference === 'auto'
    ? AsyncStorage.removeItem(DIRECTION_STORAGE_KEY)
    : AsyncStorage.setItem(DIRECTION_STORAGE_KEY, preference))
}

const reloadApp = async () => {
  try {
    // Loaded lazily: expo-updates touches native modules at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
    const Updates = require('expo-updates') as typeof import('expo-updates')
    await Updates.reloadAsync()
  } catch {
    // expo-updates is disabled in dev clients; fall back to the dev reload
    DevSettings.reload()
  }
}

/**
 * React Native only applies a layout direction change after a JS reload.
 * Returns true when a reload was triggered.
 */
export const syncNativeDirection = async (
  language: string | null | undefined,
  preference?: DirectionPreference
) => {
  const pref = preference ?? (await getDirectionPreference())
  const wantRtl = resolveDirection(language, pref) === 'rtl'
  I18nManager.allowRTL(true)
  if (I18nManager.isRTL === wantRtl) return false
  I18nManager.forceRTL(wantRtl)
  await reloadApp()
  return true
}
