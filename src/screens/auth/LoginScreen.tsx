import React, { useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native'
import Constants from 'expo-constants'
import { ParseKeys } from 'i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icons } from '@/assets/icons'
import { Images } from '@/assets/images'
import { Button } from '@/components/buttons'
import { TextField } from '@/components/forms/TextField'
import LoadingDialog from '@/components/LoadingDialog'
import { PopupMenu } from '@/components/menu/PopupMenu'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { useLogin } from './hooks/useLogin'

interface Props extends AppStackScreenProps<'Login'> {}

export default function LoginScreen({ navigation }: Props) {
  const [isSecurePassword, setIsSecurePassword] = useState<boolean>(true)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const { t, changeLanguage, options, currentLang } = useLanguage()

  const {
    handleLogin,
    isLoading,
    username,
    password,
    control,
    errors,
    handleSubmit,
    handleOpenHelpCenter,
  } = useLogin(navigation)

  const handleChangeLanguage = ({ code }) => {
    changeLanguage(code)
  }

  const toggleShowLanguageMenu = () => {
    setShowLanguageMenu((prev) => !prev)
  }

  const passwordAccessory = useMemo(() => {
    return function PasswordRightAccessory() {
      return (
        <Pressable
          onPress={() => setIsSecurePassword(!isSecurePassword)}
          {...getTestID('pressable-secure-password')}>
          {isSecurePassword ? (
            <Icons.IcVisibilityOff
              height={20}
              width={20}
              fill={colors.mediumGray}
            />
          ) : (
            <Icons.IcVisibilityOn height={20} width={20} />
          )}
        </Pressable>
      )
    }
  }, [isSecurePassword])

  const appVersion = Constants.expoConfig?.version

  const isDisabled = !username || !password

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-bluePrimary'>
      <StatusBar backgroundColor={colors.app()} barStyle='light-content' />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1 bg-white p-4'
        {...getTestID('keyboardavoidingview-loginscreen')}>
        <View className={AppStyles.rowBetween}>
          <PopupMenu
            labelField='name'
            itemTestIDField='name'
            itemTestIDPrefix='menu-'
            modalVisible={showLanguageMenu}
            onPressItem={handleChangeLanguage}
            dismissDialog={toggleShowLanguageMenu}
            itemTextClassName={AppStyles.textRegularLarge}
            containerClassName='mt-8 left-4'
            data={options}>
            <TouchableOpacity
              onPress={toggleShowLanguageMenu}
              className='flex-row items-center'
              {...getTestID('btn-openlanguage')}>
              <Text
                className={cn(AppStyles.textRegular, 'mr-[13px]')}
                {...getTestID('text-language')}>
                {currentLang?.name}
              </Text>
              <Icons.IcExpandMore />
            </TouchableOpacity>
          </PopupMenu>
          <Text
            className={cn(AppStyles.textRegular, 'text-slateGray')}
            {...getTestID('text-version')}>
            v{appVersion}
          </Text>
        </View>
        <View>
          <Image
            source={Images.ImgLogoSmile}
            className='my-16 w-48 h-20 self-center'
            resizeMode='contain'
            {...getTestID('image-logo')}
          />
          <TextField
            label={t('common.username')}
            placeholder={t('common.username')}
            maxLength={255}
            autoCapitalize='none'
            name='username'
            control={control}
            errors={t(errors.username?.message as ParseKeys)}
            applyPlatformFix
            {...getTestID('textfield-username')}
          />
          <TextField
            label={t('common.password')}
            placeholder={t('common.password')}
            containerClassName='mt-2'
            secureTextEntry={isSecurePassword}
            RightAccessory={passwordAccessory}
            autoCapitalize='none'
            name='password'
            control={control}
            errors={t(errors.password?.message as ParseKeys)}
            applyPlatformFix
            {...getTestID('textfield-password')}
          />
          <Button
            disabled={isDisabled}
            preset='filled'
            containerClassName='mt-6 bg-deepBlue'
            text={t('common.login')}
            onPress={handleSubmit(handleLogin)}
            {...getTestID('btn-login')}
          />
        </View>
        <View className='flex-grow' />
        <View>
          <View className='flex-row justify-center my-8'>
            <Image
              source={Images.ImgLogoHealtMinistry}
              resizeMode='contain'
              className='w-[89px] h-10 self-center'
              {...getTestID('image-healthministry')}
            />
            <View className='w-10' />
            <Image
              source={Images.ImgLogoUndp}
              resizeMode='contain'
              className='w-10 h-10 self-center'
              {...getTestID('image-undp')}
            />
          </View>
          <View className={cn(AppStyles.rowBetween, 'flex-row my-4')}>
            <View className={cn(AppStyles.borderBottom, 'flex-1')} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenHelpCenter}
              {...getTestID('btn-helpcenter')}>
              <Text
                className={cn(AppStyles.textBold, 'text-brightOrange mx-5')}>
                {t('help_center.title')}
              </Text>
            </TouchableOpacity>
            <View className={cn(AppStyles.borderBottom, 'flex-1')} />
          </View>
        </View>
        <LoadingDialog testID='loadingdialog-login' modalVisible={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
