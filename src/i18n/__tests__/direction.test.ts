import { I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'
import {
  DIRECTION_STORAGE_KEY,
  getDirectionPreference,
  isRtlLanguage,
  nextPreference,
  parsePreference,
  resolveDirection,
  saveDirectionPreference,
  syncNativeDirection,
} from '../direction'

jest.mock('expo-updates', () => ({
  reloadAsync: jest.fn(() => Promise.resolve()),
}))
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
    setItem: jest.fn((k: string, v: string) => {
      store[k] = v
      return Promise.resolve()
    }),
    removeItem: jest.fn((k: string) => {
      delete store[k]
      return Promise.resolve()
    }),
  }
})

describe('direction', () => {
  beforeEach(() => jest.clearAllMocks())

  it('detects RTL languages', () => {
    expect(isRtlLanguage('ar')).toBe(true)
    expect(isRtlLanguage('ar-EG')).toBe(true)
    expect(isRtlLanguage('id')).toBe(false)
    expect(isRtlLanguage()).toBe(false)
  })

  it('resolves auto from language and honours overrides', () => {
    expect(resolveDirection('ar')).toBe('rtl')
    expect(resolveDirection('en')).toBe('ltr')
    expect(resolveDirection('ar', 'ltr')).toBe('ltr')
    expect(resolveDirection('id', 'rtl')).toBe('rtl')
  })

  it('parses and cycles preferences', () => {
    expect(parsePreference('bogus')).toBe('auto')
    expect(nextPreference('auto')).toBe('ltr')
    expect(nextPreference('ltr')).toBe('rtl')
    expect(nextPreference('rtl')).toBe('auto')
  })

  it('stores overrides and clears them on auto', async () => {
    await saveDirectionPreference('rtl')
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      DIRECTION_STORAGE_KEY,
      'rtl'
    )
    expect(await getDirectionPreference()).toBe('rtl')
    await saveDirectionPreference('auto')
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DIRECTION_STORAGE_KEY)
    expect(await getDirectionPreference()).toBe('auto')
  })

  it('forces RTL and reloads only when the direction changes', async () => {
    const force = jest
      .spyOn(I18nManager, 'forceRTL')
      .mockImplementation(() => {})
    jest.spyOn(I18nManager, 'allowRTL').mockImplementation(() => {})
    Object.defineProperty(I18nManager, 'isRTL', {
      value: false,
      configurable: true,
    })

    expect(await syncNativeDirection('en', 'auto')).toBe(false)
    expect(Updates.reloadAsync).not.toHaveBeenCalled()

    expect(await syncNativeDirection('ar', 'auto')).toBe(true)
    expect(force).toHaveBeenCalledWith(true)
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1)
  })
})
