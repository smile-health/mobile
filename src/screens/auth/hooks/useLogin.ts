import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { clearTheme } from '@/services/features'
import { useAppDispatch } from '@/services/store'
import { usePushNotifications } from '../../../hooks/usePushNotifications'
import { useLanguage } from '../../../i18n/useLanguage'
import { LoginRequest } from '../../../models'
import {
  useLoginUserMutation,
  useLazyFetchProfileQuery,
} from '../../../services/apis'
import { loadLocalData } from '../../../storage'
import { showError, showSuccess } from '../../../utils/CommonUtils'
import { PUSH_NOTIFICATION_STORAGE_KEYS } from '../../../utils/Constants'
import { showNetworkError } from '../../../utils/NetworkUtils'
import { loginSchema } from '../LoginSchema'

export const useLogin = (navigation) => {
  const dispatch = useAppDispatch()
  const { t, options, currentLang } = useLanguage()
  const { initializePushNotifications } = usePushNotifications()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LoginRequest>({
    mode: 'onChange',
    resolver: yupResolver(loginSchema),
  })

  const [username, password] = watch(['username', 'password'])
  const [loginUser, { isLoading: isLoadingLogin }] = useLoginUserMutation()
  const [fetchProfile, { isLoading }] = useLazyFetchProfileQuery()

  const handleOpenHelpCenter = () => {
    navigation.navigate('HelpCenter')
  }

  const handleLogin = async (data: LoginRequest) => {
    if (password.length < 8) {
      showError(t('validation.invalid_credential'), 'snackbar-error-login')
      return
    }
    try {
      const fcmToken = await loadLocalData(
        PUSH_NOTIFICATION_STORAGE_KEYS.FCM_TOKEN
      )

      const loginPayload = {
        ...data,
        fcm_token: fcmToken ?? undefined,
      }
      const loginResponse = await loginUser(loginPayload).unwrap()
      if (loginResponse) {
        const profile = await fetchProfile().unwrap()
        if (profile) {
          await initializePushNotifications()
          reset()
          showSuccess(t('login_success'), 'snackbar-success-login')
          navigation.replace('Workspace')
        }
      }
    } catch (error) {
      showNetworkError(error, 'snackbar-error-login')
    }
  }

  useEffect(() => {
    dispatch(clearTheme())
  }, [dispatch])

  return {
    control,
    handleSubmit,
    handleLogin,
    handleOpenHelpCenter,
    errors,
    options,
    currentLang,
    username,
    password,
    isLoading: isLoading || isLoadingLogin,
  }
}
