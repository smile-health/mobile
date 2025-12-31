import React, { useState } from 'react'
import { StatusBar, Text, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icons } from '@/assets/icons'
import { Button, ImageButton } from '@/components/buttons'
import {
  ConfirmationDialog,
  ConfirmationDialogProps,
} from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import { PopupMenu } from '@/components/menu/PopupMenu'
import { LanguageOption, useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { resetApiState } from '@/services/api'
import { useLogoutMutation } from '@/services/apis'

import { authState, useAppDispatch, useAppSelector } from '@/services/store'
import { clearLocalData } from '@/storage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import {
  getInitials,
  isAndroid,
  getTestID,
  showError,
} from '@/utils/CommonUtils'
import { navigateToLogin } from '@/utils/NavigationUtils'

interface Props extends AppStackScreenProps<'Profile'> {}

export default function ProfileScreen({ navigation }: Props) {
  const { t, currentLang, options, changeLanguage } = useLanguage()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(authState)
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation()

  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<
    Omit<ConfirmationDialogProps, 'dismissDialog'>
  >({
    modalVisible: false,
    onCancel: handleCloseLogoutDialog,
    onConfirm: handleLogout,
    cancelProps: {
      textClassName: 'text-scienceBlue px-2',
      ...getTestID('btn-cancel-logout'),
    },
    confirmProps: { ...getTestID('btn-confirm-logout') },
  })

  const appVersion = Constants.expoConfig?.version

  const handleCloseLanguageMenu = () => {
    setIsLanguageMenuOpen(false)
  }

  const handleOpenLanguageMenu = () => {
    setIsLanguageMenuOpen(true)
  }

  function handleCloseLogoutDialog() {
    setDialog((prev) => ({ ...prev, modalVisible: false }))
  }

  const handleOpenLogoutDialog = async () => {
    const storageKeys = await AsyncStorage.getAllKeys()
    const isExistDraft = storageKeys.some((str) =>
      str.toLowerCase().includes('draft')
    )
    const confirmText = isExistDraft
      ? t('button.logout_anyway')
      : t('common.logout')
    const message = isExistDraft
      ? t('dialog.unsubmit_draft_logout')
      : t('dialog.logout_message')

    setDialog((prev) => ({
      ...prev,
      modalVisible: true,
      message,
      confirmText,
    }))
  }

  async function handleLogout() {
    handleCloseLogoutDialog()
    try {
      await logoutUser().unwrap()
      await clearLocalData()
      dispatch(resetApiState())
      navigateToLogin()
    } catch {
      showError(t('error.logout'), 'snackbar-error-logout')
    }
  }

  const navigateToProfileDetail = () => {
    navigation.navigate('ProfileDetail')
  }

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const navigateToEditPassword = () => {
    navigation.navigate('EditPassword')
  }

  const navigateToChangeHistory = () => {
    if (user) {
      navigation.navigate('ChangeHistory', { userId: user.id })
    }
  }

  const handleLanguageSelect = (selectedLanguage: LanguageOption) => {
    changeLanguage(selectedLanguage.code)
  }

  return (
    <SafeAreaView edges={['top']} className='bg-whiteSmoke flex-1'>
      <StatusBar barStyle='dark-content' backgroundColor={colors.whiteSmoke} />
      <View className='flex-1 items-start pt-4'>
        <ImageButton
          Icon={Icons.IcDelete}
          size={24}
          onPress={navigation.goBack}
          containerClassName='mb-6 ml-4'
          {...getTestID('btn-back-profile')}
        />
        <View className='flex-row gap-x-[13px] px-4'>
          <View className='rounded-full bg-white h-12 w-12 items-center justify-center'>
            <Text className={cn(AppStyles.textMedium, 'text-lg')}>
              {getInitials(`${user?.firstname ?? ''} ${user?.lastname ?? ''}`)}
            </Text>
          </View>
          <View className='flex-1'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={navigateToProfileDetail}
              className='flex-row justify-between'
              {...getTestID('btn-nav-detail-profile')}>
              <View>
                <Text className={AppStyles.textMediumLarge}>
                  {user?.username}
                </Text>
                <Text className={AppStyles.labelRegular}>
                  {`${user?.firstname ?? ''} ${user?.lastname ?? ''}`}
                </Text>
              </View>
              <Icons.IcChevronRight />
            </TouchableOpacity>
            <View className='flex-row gap-x-4 mt-2'>
              <Button
                text={t('button.change_profile')}
                textClassName='text-scienceBlue'
                onPress={navigateToEditProfile}
                {...getTestID('btn-nav-edit-profile')}
              />
              <Button
                text={t('button.change_password')}
                textClassName='text-scienceBlue'
                onPress={navigateToEditPassword}
                {...getTestID('btn-nav-edit-password')}
              />
            </View>
          </View>
        </View>
        <View
          className={cn(AppStyles.border, 'self-stretch my-2 mx-4 px-3 py-2')}
          {...getTestID('profile-entity')}>
          <Text className={AppStyles.textMedium}>{user?.entity.name}</Text>
          <Text className={AppStyles.labelRegular}>{user?.entity.address}</Text>
        </View>
        <Button
          onPress={navigateToChangeHistory}
          text={t('common.change_history')}
          RightIcon={Icons.IcChevronRight}
          rightIconSize={20}
          containerClassName='justify-between w-full py-2 px-4'
          {...getTestID('btn-change-history')}
        />
        <PopupMenu
          data={options}
          labelField='name'
          itemTestIDField='name'
          itemTestIDPrefix='menu-'
          dismissDialog={handleCloseLanguageMenu}
          modalVisible={isLanguageMenuOpen}
          containerClassName='right-0 mr-4'
          itemContainerClassName='px-4 py-2'
          onPressItem={handleLanguageSelect}>
          <Button
            onPress={handleOpenLanguageMenu}
            RightIcon={Icons.IcExpandMore}
            rightIconSize={24}
            containerClassName='justify-between w-full py-2 px-4'
            {...getTestID('btn-popup-languange')}>
            <Text className={AppStyles.textMedium}>{t('common.language')}</Text>
            <Text className={AppStyles.labelRegular}>{currentLang?.name}</Text>
          </Button>
        </PopupMenu>
      </View>
      <View className='gap-4 p-4'>
        <Text
          className={cn(
            AppStyles.textRegular,
            'text-mediumGray'
          )}>{`Version ${appVersion}`}</Text>
        <Button
          onPress={handleOpenLogoutDialog}
          RightIcon={Icons.IcLogout}
          rightIconSize={20}
          text={t('common.logout')}
          textClassName='text-lavaRed'
          containerClassName='justify-start w-full gap-x-2'
          {...getTestID('btn-logout')}
        />
      </View>
      <ConfirmationDialog dismissDialog={handleCloseLogoutDialog} {...dialog} />
      {isAndroid && (
        <LoadingDialog
          testID='loadingdialog-logout'
          modalVisible={isLoggingOut}
        />
      )}
    </SafeAreaView>
  )
}
