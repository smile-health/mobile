import React, { useEffect } from 'react'
import { View } from 'react-native'
import * as ExpoSplashScreen from 'expo-splash-screen'
import { useTranslation } from 'react-i18next'
import { TxCode } from '@/i18n'
import { syncNativeDirection } from '@/i18n/direction'
import { resolveAppLanguage } from '@/i18n/language'
import { AppStackScreenProps } from '@/navigators/types'
import { setApiLanguage, setAuthToken } from '@/services/api'
import { setLanguage, setUserData } from '@/services/features'
import { setWorkspacesData } from '@/services/features/workspace.slice'
import { useAppDispatch } from '@/services/store'
import { loadLocalData } from '@/storage'
import { STORAGE_KEY } from '@/utils/Constants'

interface Props extends AppStackScreenProps<'Splash'> {}

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const { i18n } = useTranslation()
  useEffect(() => {
    const loadUserData = async () => {
      const [userData, authToken] = await Promise.all([
        loadLocalData(STORAGE_KEY.USER_LOGIN),
        loadLocalData(STORAGE_KEY.ACCESS_TOKEN),
      ])
      setAuthToken(authToken ?? '')
      await ExpoSplashScreen.hideAsync()

      if (userData) {
        dispatch(setUserData(userData))
        dispatch(setWorkspacesData(userData.programs))
        navigation.replace('Workspace')
      } else {
        navigation.replace('Login')
      }
    }

    const loadLanguage = async () => {
      const setting = await loadLocalData(STORAGE_KEY.SETTINGS)
      const language: TxCode = resolveAppLanguage(setting?.language)

      i18n.changeLanguage(language)
      setApiLanguage(language)
      dispatch(setLanguage(language))
      // Reloads at most once when the language/override disagrees with the
      // native layout direction (e.g. Arabic device locale, English app).
      await syncNativeDirection(language)
    }

    // Language first, so the next screen mounts with the saved language
    // instead of the device default.
    const init = async () => {
      await loadLanguage()
      await loadUserData()
    }

    init()
  }, [dispatch, navigation, i18n])
  return <View />
}
