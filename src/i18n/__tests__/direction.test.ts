import { I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'
import {
  DIRECTION_RELOAD_KEY,
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

  describe('syncNativeDirection', () => {
    let allow: jest.SpyInstance
    let force: jest.SpyInstance
    const setNativeRtl = (value: boolean) =>
      Object.defineProperty(I18nManager, 'isRTL', {
        value,
        configurable: true,
      })

    beforeEach(async () => {
      allow = jest.spyOn(I18nManager, 'allowRTL').mockImplementation(() => {})
      force = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {})
      await AsyncStorage.removeItem(DIRECTION_RELOAD_KEY)
      jest.clearAllMocks()
    })

    it('does nothing when native direction already matches', async () => {
      setNativeRtl(false)
      expect(await syncNativeDirection('en', 'auto')).toBe(false)
      expect(allow).toHaveBeenCalledWith(false)
      expect(force).toHaveBeenCalledWith(false)
      expect(Updates.reloadAsync).not.toHaveBeenCalled()
    })

    it('allows and forces RTL, then reloads once for Arabic', async () => {
      setNativeRtl(false)
      expect(await syncNativeDirection('ar', 'auto')).toBe(true)
      expect(allow).toHaveBeenCalledWith(true)
      expect(force).toHaveBeenCalledWith(true)
      expect(Updates.reloadAsync).toHaveBeenCalledTimes(1)
      expect(await AsyncStorage.getItem(DIRECTION_RELOAD_KEY)).toBe('rtl')

      // After the reload native agrees, so the guard is cleared.
      setNativeRtl(true)
      expect(await syncNativeDirection('ar', 'auto')).toBe(false)
      expect(await AsyncStorage.getItem(DIRECTION_RELOAD_KEY)).toBeNull()
    })

    it('disallows RTL for an LTR language on an RTL device', async () => {
      // Arabic device locale: native starts RTL while the app is English.
      setNativeRtl(true)
      expect(await syncNativeDirection('en', 'auto')).toBe(true)
      expect(allow).toHaveBeenCalledWith(false)
      expect(force).toHaveBeenCalledWith(false)
      expect(Updates.reloadAsync).toHaveBeenCalledTimes(1)
    })

    it('never reloads twice for the same direction', async () => {
      setNativeRtl(true)
      expect(await syncNativeDirection('en', 'auto')).toBe(true)
      // Native still disagrees after the reload: stop instead of looping.
      expect(await syncNativeDirection('en', 'auto')).toBe(false)
      expect(await syncNativeDirection('en', 'auto')).toBe(false)
      expect(Updates.reloadAsync).toHaveBeenCalledTimes(1)

      // A different target direction may still reload.
      setNativeRtl(false)
      expect(await syncNativeDirection('ar', 'auto')).toBe(true)
      expect(Updates.reloadAsync).toHaveBeenCalledTimes(2)
    })
  })
})
