import { toIntlLocale } from '../direction'
import { languageOptions } from '../useLanguage'

jest.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: jest.fn() },
  useTranslation: jest.fn(),
}))
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}))
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))

// jest.setup.js mocks '@/i18n'; the real module is needed here.
const { resources } = jest.requireActual<typeof import('@/i18n')>('@/i18n')

const flatKeys = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) =>
        flatKeys(v, prefix ? `${prefix}.${k}` : k)
      )
    : [prefix]

describe('Arabic locale', () => {
  it('is registered as resource and selectable language', () => {
    expect(resources.ar.translation).toBeDefined()
    expect(languageOptions.map((l) => l.code)).toEqual(['id', 'en', 'ar'])
  })

  it('covers every English key', () => {
    const ar = new Set(flatKeys(resources.ar.translation))
    const missing = flatKeys(resources.en.translation).filter((k) => !ar.has(k))
    expect(missing).toEqual([])
  })

  it('formats numbers with Latin digits', () => {
    expect(toIntlLocale('ar')).toBe('ar-u-nu-latn')
    expect(toIntlLocale('en')).toBe('en')
    expect(new Intl.NumberFormat(toIntlLocale('ar')).format(1234)).toMatch(
      /^1.?234$/
    )
  })
})
