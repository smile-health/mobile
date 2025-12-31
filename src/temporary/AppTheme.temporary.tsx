import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import {
  BaseButton,
  Button,
  ImageButton,
  RadioButtonGroup,
} from '@/components/buttons'
import { TextField } from '@/components/forms/TextField'
import { LoginRequest } from '@/models'
import { setAppTheme } from '@/services/features'
import { useAppDispatch } from '@/services/store'
import colors from '@/theme/colors'
import { showError, showSuccess } from '@/utils/CommonUtils'

const languageOption = [
  { value: 1, label: 'Indonesia' },
  { value: 2, label: 'English' },
]

export default function LoginScreen() {
  const { control } = useForm<LoginRequest>({
    mode: 'onChange',
  })
  const dispatch = useAppDispatch()
  const buttonShowError = () => {
    showError('Test Error')
  }

  const buttonShowSuccess = () => {
    showSuccess('Test Success')
  }
  return (
    <ScrollView className='px-6 flex-1 bg-white'>
      <Text className='font-mainMedium'>TODO: create login screen</Text>
      <TextField
        name='password'
        control={control}
        placeholder='PASSWORD'
        containerClassName='mb-2'
        label='Test'
      />
      <TextField
        preset='outlined'
        name='password'
        control={control}
        placeholder='PASSWORD'
        containerClassName='mb-2'
        label='Test'
      />
      <View className='flex-row gap-2 mb-2'>
        <BaseButton text='BUTTON' containerClassName='flex-1' />
        <BaseButton
          text='BUTTON'
          containerClassName='flex-1'
          textClassName='text-main'
        />
        <BaseButton text='BUTTON' containerClassName='flex-1' disabled />
      </View>
      <Text className='mb-2 font-mainMedium'>Outlined Primary Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton
          preset='outlined-primary'
          text='BUTTON'
          containerClassName='flex-1'
        />
        <BaseButton
          preset='outlined-primary'
          text='BUTTON'
          containerClassName='flex-1'
          textClassName='text-main'
          isLoading
          loadingColor={colors.main}
        />
        <BaseButton
          preset='outlined-primary'
          text='BUTTON'
          containerClassName='flex-1'
          disabled
        />
      </View>
      <Text className='mb-2 font-mainMedium'>Outlined Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton preset='filled' text='BUTTON' containerClassName='flex-1' />
        <BaseButton
          preset='filled'
          text='BUTTON'
          containerClassName='flex-1 bg-bluePrimary'
          isLoading
          loadingColor={colors.white}
        />
        <BaseButton
          preset='filled'
          text='BUTTON'
          containerClassName='flex-1'
          disabled
        />
      </View>
      <Text className='mb-2 font-mainMedium'>App BUTTON :</Text>
      <View className='flex-row gap-2 mb-2'>
        <Button
          preset='outlined'
          containerClassName='flex-1'
          text='SHOW ERROR'
          LeftIcon={Icons.IcDelete}
          onPress={buttonShowError}
        />
        <Button
          preset='filled'
          containerClassName='flex-1'
          text='SHOW SUCCESS'
          LeftIcon={Icons.IcReview}
          onPress={buttonShowSuccess}
        />
      </View>
      <Text className='mb-2 font-mainMedium'>Image BUTTON :</Text>
      <View className='flex-row justify-between'>
        <ImageButton
          Icon={Icons.IcAdd}
          color={colors.leafyGreen}
          onPress={() => {
            dispatch(setAppTheme('immunization'))
          }}
        />
        <ImageButton
          preset='outlined'
          Icon={Icons.IcCheck}
          color={colors.transparent}
          onPress={() => {
            dispatch(setAppTheme('logistic'))
          }}
        />
        <ImageButton
          preset='outlined-primary'
          Icon={Icons.IcDelete}
          color={colors.leafyGreen}
          onPress={() => {
            dispatch(setAppTheme('waste'))
          }}
        />
        <ImageButton
          preset='filled'
          Icon={Icons.IcReview}
          color={colors.brightOrange}
          onPress={() => {
            dispatch(setAppTheme('e_learning'))
          }}
        />
      </View>
      <RadioButtonGroup
        items={languageOption}
        control={control}
        name='language'
        label='Select Language'
        horizontal
      />
      <Text className='mb-2 font-mainMedium'>SELECT THEME :</Text>
      <View className='flex-row gap-2 mb-2'>
        <Button
          preset='filled'
          containerClassName='flex-1'
          text='IMMUNISASI'
          onPress={() => {
            dispatch(setAppTheme('immunization'))
          }}
        />
        <Button
          preset='filled'
          containerClassName='flex-1'
          text='LOGISTIK'
          onPress={() => {
            dispatch(setAppTheme('logistic'))
          }}
        />
        <Button
          preset='filled'
          containerClassName='flex-1'
          text='WASTE'
          onPress={() => {
            dispatch(setAppTheme('waste'))
          }}
        />
        <Button
          preset='filled'
          containerClassName='flex-1'
          text='E-LEARNING'
          onPress={() => {
            dispatch(setAppTheme('e_learning'))
          }}
        />
      </View>
    </ScrollView>
  )
}
