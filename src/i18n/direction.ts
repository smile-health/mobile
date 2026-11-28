import { DevSettings, I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type TextDirection = 'ltr' | 'rtl'
// 'auto' follows the active language; 'ltr' / 'rtl' are manual overrides.
export type DirectionPreference = 'auto' | TextDirection

export const RTL_LANGUAGES = ['ar']
export const DIRECTION_STORAGE_KEY = 'textDirection'
// Direction we last reloaded for; caps direction reloads to one per target.
export const DIRECTION_RELOAD_KEY = 'textDirectionReload'

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

// Arabic keeps Latin digits (decision BA-949) so stock numbers stay familiar.
export const toIntlLocale = (language?: string | null) =>
  isRtlLanguage(language) ? `${language}-u-nu-latn` : (language ?? undefined)

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
 *
 * On Android `isRTL` is `allowRTL && (forceRTL || device locale is RTL)`, so an
 * LTR app must also disallow RTL. Otherwise a device in Arabic stays RTL after
 * `forceRTL(false)` and the app reloads forever.
 */
export const syncNativeDirection = async (
  language: string | null | undefined,
  preference?: DirectionPreference
) => {
  const pref = preference ?? (await getDirectionPreference())
  const target = resolveDirection(language, pref)
  const wantRtl = target === 'rtl'
  I18nManager.allowRTL(wantRtl)
  I18nManager.forceRTL(wantRtl)
  const reloadedFor = await AsyncStorage.getItem(DIRECTION_RELOAD_KEY)
  if (I18nManager.isRTL === wantRtl) {
    if (reloadedFor) await AsyncStorage.removeItem(DIRECTION_RELOAD_KEY)
    return false
  }
  // Already reloaded for this direction and native still disagrees: keep the
  // current layout instead of looping on the splash screen.
  if (reloadedFor === target) return false
  await AsyncStorage.setItem(DIRECTION_RELOAD_KEY, target)
  await reloadApp()
  return true
}
