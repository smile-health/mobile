import React, { useCallback, useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import InputDate from '@/components/forms/InputDate'
import LoadingDialog from '@/components/LoadingDialog'
import PhoneInput from '@/components/phone-input/PhoneInput'
import { useLanguage } from '@/i18n/useLanguage'
import { EditProfileRequest } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import { useEditProfileMutation, useFetchProfileQuery } from '@/services/apis'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import {
  formatErrorMessage,
  getTestID,
  showError,
  showSuccess,
} from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT, genderNames } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import { editProfileSchema } from './schema/EditProfileSchema'

type ProfileFormField = yup.InferType<ReturnType<typeof editProfileSchema>>
interface Props extends AppStackScreenProps<'EditProfile'> {}

export default function EditProfileScreen({ navigation }: Props) {
  const { data: user, isLoading: isLoadProfile } = useFetchProfileQuery()
  const [editProfile, { isLoading }] = useEditProfileMutation()
  const { t } = useLanguage()

  const {
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
    handleSubmit,
  } = useForm<ProfileFormField>({
    resolver: yupResolver(editProfileSchema()),
    mode: 'onChange',
  })

  const genderOptions = Object.entries(genderNames).map(([key, label]) => ({
    value: Number.parseInt(key),
    label: t(label),
    id: label,
  }))
  const { date_of_birth } = watch()
  const birthDate = date_of_birth ? stringToDate(date_of_birth) : undefined

  const isDisabledSave = Object.keys(errors).length > 0 || isLoading

  const handleDateChange = useCallback(
    (val: Date) => {
      setValue('date_of_birth', dateToString(val, DATE_FILTER_FORMAT))
    },
    [setValue]
  )

  const handleUpdateProfile: SubmitHandler<ProfileFormField> = async ({
    firstname,
    lastname,
    mobile_phone,
    ...formData
  }) => {
    if (!user) return

    const payload: EditProfileRequest = {
      userId: user.id,
      entity_id: user.entity_id,
      role: user.role,
      username: user.username,
      view_only: user.view_only,
      firstname: firstname.trim(),
      lastname: lastname?.trim() ?? null,
      mobile_phone: mobile_phone ?? null,
      program_ids: user.programs.map((p) => p.id),
      ...formData,
    }
    try {
      await editProfile(payload).unwrap()
      showSuccess(
        t('profile.success_edit_profile'),
        'snackbar-success-editprofile'
      )
      navigation.goBack()
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  useEffect(() => {
    if (user) {
      reset({
        firstname: user?.firstname,
        lastname: user?.lastname,
        gender: user?.gender,
        mobile_phone: user?.mobile_phone,
        email: user?.email,
        address: user?.address,
        date_of_birth: user?.date_of_birth || undefined,
      })
    }
  }, [user, reset])

  return (
    <View className='flex-1 bg-catskillWhite'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <ScrollView contentContainerClassName='p-4 gap-y-4'>
          <View className='bg-white px-2 py-4'>
            <Text className={AppStyles.textBold}>{t('section.main_info')}</Text>
            <TextField
              name='firstname'
              control={control}
              label={t('label.firstname')}
              placeholder={t('label.firstname')}
              errors={errors.firstname?.message}
              isMandatory
              {...getTestID('textfield-firstname')}
            />
            <TextField
              name='lastname'
              control={control}
              label={t('label.lastname')}
              placeholder={t('label.lastname')}
              errors={errors.lastname?.message}
              {...getTestID('textfield-lastname')}
            />
            <Dropdown
              preset='bottom-border'
              name='gender'
              control={control}
              data={genderOptions}
              label={t('label.gender')}
              placeholder={t('label.gender')}
              errors={errors.gender?.message}
              itemTestIDField='id'
              itemAccessibilityLabelField='id'
              isMandatory
              {...getTestID('dropdown-gender')}
            />
            <TextField
              name='email'
              control={control}
              label={t('label.email')}
              placeholder={t('label.email')}
              keyboardType='email-address'
              errors={errors.email?.message}
              isMandatory
              {...getTestID('textfield-email')}
            />
          </View>
          <View className='bg-white px-2 py-4'>
            <Text className={AppStyles.textBold}>
              {t('section.additional_info')}
            </Text>
            <InputDate
              date={birthDate}
              maximumDate={new Date()}
              label={t('label.birthdate')}
              onDateChange={handleDateChange}
            />
            <PhoneInput
              name='mobile_phone'
              control={control}
              defaultValue={user?.mobile_phone}
              placeholder={t('label.phone_number')}
              errors={errors.mobile_phone?.message}
              {...getTestID('phone-input')}
            />
            <TextField
              name='address'
              control={control}
              label={t('label.address')}
              placeholder={t('label.address')}
              {...getTestID('textfield-address')}
            />
          </View>
        </ScrollView>
        <View className='bg-white p-4'>
          <Button
            preset='filled'
            text={t('button.save')}
            onPress={handleSubmit(handleUpdateProfile)}
            LeftIcon={Icons.IcCheck}
            containerClassName='bg-deepBlue gap-x-2'
            textClassName='text-white'
            disabled={isDisabledSave}
            {...getTestID('btn-edit-profile')}
          />
        </View>
      </KeyboardAvoidingView>
      <LoadingDialog
        testID='loadingdialog-load-profile'
        modalVisible={isLoadProfile || isLoading}
      />
    </View>
  )
}
