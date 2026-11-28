import * as Localization from 'expo-localization'

export const SUPPORTED_LANGUAGES = ['id', 'en', 'ar'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export const toSupportedLanguage = (
  code?: string | null
): SupportedLanguage | undefined => {
  const base = code?.toLowerCase().split('-')[0]
  return SUPPORTED_LANGUAGES.find((lang) => lang === base)
}

export const getDeviceLanguage = () =>
  toSupportedLanguage(Localization.getLocales()[0]?.languageCode)

/**
 * The saved app language wins; otherwise follow the device language when the
 * app supports it (e.g. first launch on an Arabic phone), else English.
 */
export const resolveAppLanguage = (
  stored?: string | null,
  device: string | null | undefined = getDeviceLanguage()
): SupportedLanguage =>
  toSupportedLanguage(stored) ?? toSupportedLanguage(device) ?? DEFAULT_LANGUAGE
