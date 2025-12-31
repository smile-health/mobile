import React, { useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { TextField, TextFieldAccessoryProps } from '@/components/forms'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { useEditPasswordMutation } from '@/services/apis'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import {
  formatErrorMessage,
  getTestID,
  showError,
  showSuccess,
} from '@/utils/CommonUtils'
import { editPasswordSchema } from './schema/EditPasswordSchema'

type EditPasswordFormField = yup.InferType<
  ReturnType<typeof editPasswordSchema>
>
interface Props extends AppStackScreenProps<'EditPassword'> {}

const VisibilityIcon = ({ isVisible }: { isVisible: boolean }) =>
  isVisible ? (
    <Icons.IcVisibilityOff height={20} width={20} fill={colors.mediumGray} />
  ) : (
    <Icons.IcVisibilityOn height={20} width={20} />
  )

export default function EditPasswordScreen({ navigation }: Props) {
  const { t } = useLanguage()
  const [isSecurePassword, setIsSecurePassword] = useState({
    password: true,
    new_password: true,
    password_confirmation: true,
  })
  const [updatePassword, { isLoading: isSavingPassword }] =
    useEditPasswordMutation()

  const {
    control,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditPasswordFormField>({
    resolver: yupResolver(editPasswordSchema()),
    mode: 'onChange',
  })

  const [password, newPassword, confirmPassword] = watch([
    'password',
    'new_password',
    'password_confirmation',
  ])

  const isSavingDisabled =
    Object.keys(errors).length > 0 ||
    ![password, newPassword, confirmPassword].every(Boolean) ||
    isSavingPassword

  const handlePasswordUpdate: SubmitHandler<EditPasswordFormField> = async (
    formData
  ) => {
    if (formData.password === formData.new_password) {
      setError('new_password', {
        message: t('validation.old_password_same_with_new'),
      })
      return
    }

    try {
      await updatePassword(formData).unwrap()
      showSuccess(
        t('profile.success_edit_password'),
        'snackbar-success-editpassword'
      )
      navigation.navigate('Workspace')
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  const toggleSecurePassword = useCallback((field: string) => {
    setIsSecurePassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const PasswordFieldAccessory = useCallback(
    ({ name }: TextFieldAccessoryProps) => (
      <Pressable
        {...getTestID(`secure_${name}`)}
        onPress={() => toggleSecurePassword(name)}>
        <VisibilityIcon isVisible={isSecurePassword[name]} />
      </Pressable>
    ),
    [isSecurePassword, toggleSecurePassword]
  )

  return (
    <View className='flex-1 bg-catskillWhite'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <ScrollView contentContainerClassName='p-4'>
          <Text className={AppStyles.textMedium}>
            {t('profile.please_input_new_password')}
          </Text>
          <Text className='font-mainMedium text-[13px] text-warmGrey mt-1 mb-4'>
            {t('profile.enter_a_password_helper')}
          </Text>
          <View className='bg-white p-2 pb-4 rounded'>
            <TextField
              name='password'
              control={control}
              label={t('label.old_password')}
              placeholder={t('label.old_password')}
              secureTextEntry={isSecurePassword.password}
              RightAccessory={PasswordFieldAccessory}
              labelClassName='px-2 mt-2'
              inputWrapperClassName='px-3'
              errors={errors.password?.message}
              isMandatory
              {...getTestID('textfield-old-password')}
            />
            <TextField
              name='new_password'
              control={control}
              label={t('label.new_password')}
              placeholder={t('label.new_password')}
              secureTextEntry={isSecurePassword.new_password}
              RightAccessory={PasswordFieldAccessory}
              labelClassName='px-2 mt-2'
              inputWrapperClassName='px-3'
              errors={errors.new_password?.message}
              isMandatory
              onChange={(e) => {
                if (e.nativeEvent.text === confirmPassword) {
                  clearErrors('password_confirmation')
                }
              }}
              {...getTestID('textfield-new-password')}
            />
            <TextField
              name='password_confirmation'
              control={control}
              label={t('label.password_confirmation')}
              placeholder={t('label.password_confirmation')}
              secureTextEntry={isSecurePassword.password_confirmation}
              RightAccessory={PasswordFieldAccessory}
              labelClassName='px-2 mt-2'
              inputWrapperClassName='px-3'
              errors={errors.password_confirmation?.message}
              isMandatory
              {...getTestID('textfield-confirm-password')}
            />
          </View>
        </ScrollView>
        <View className='bg-white p-4'>
          <Button
            preset='filled'
            text={t('button.save')}
            onPress={handleSubmit(handlePasswordUpdate)}
            LeftIcon={Icons.IcCheck}
            leftIconSize={20}
            containerClassName='bg-deepBlue'
            textClassName='ml-2 text-white'
            disabled={isSavingDisabled}
            {...getTestID('btn-edit-password')}
          />
        </View>
      </KeyboardAvoidingView>
      <LoadingDialog
        testID='loadingdialog-edit-password'
        modalVisible={isSavingPassword}
      />
    </View>
  )
}
