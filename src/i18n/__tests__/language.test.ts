import * as Localization from 'expo-localization'
import {
  getDeviceLanguage,
  resolveAppLanguage,
  toSupportedLanguage,
} from '../language'

const mockLocale = (languageCode: string | null) =>
  (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode }])

describe('language', () => {
  it('maps codes to supported app languages', () => {
    expect(toSupportedLanguage('ar')).toBe('ar')
    expect(toSupportedLanguage('AR-ma')).toBe('ar')
    expect(toSupportedLanguage('id')).toBe('id')
    expect(toSupportedLanguage('fr')).toBeUndefined()
    expect(toSupportedLanguage(null)).toBeUndefined()
  })

  it('prefers the saved language', () => {
    expect(resolveAppLanguage('id', 'ar')).toBe('id')
  })

  it('follows a supported device language when nothing is saved', () => {
    expect(resolveAppLanguage(undefined, 'ar')).toBe('ar')
    expect(resolveAppLanguage(null, 'fr')).toBe('en')
    expect(resolveAppLanguage('xx', null)).toBe('en')
  })

  it('reads the device language from expo-localization', () => {
    mockLocale('ar')
    expect(getDeviceLanguage()).toBe('ar')
    expect(resolveAppLanguage()).toBe('ar')
    mockLocale(null)
    expect(getDeviceLanguage()).toBeUndefined()
    expect(resolveAppLanguage()).toBe('en')
  })
})
