import React, { useEffect } from 'react'
import { View } from 'react-native'
import * as ExpoSplashScreen from 'expo-splash-screen'
import { useTranslation } from 'react-i18next'
import { TxCode } from '@/i18n'
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
      const userData = await loadLocalData(STORAGE_KEY.USER_LOGIN)
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
      const language: TxCode = setting?.language ?? 'id'

      i18n.changeLanguage(language)
      setApiLanguage(language)
      dispatch(setLanguage(language))
    }

    const loadAuthToken = async () => {
      const authToken = (await loadLocalData(STORAGE_KEY.ACCESS_TOKEN)) ?? ''
      setAuthToken(authToken)
    }

    loadUserData()
    loadLanguage()
    loadAuthToken()
  }, [dispatch, navigation, i18n])
  return <View />
}
