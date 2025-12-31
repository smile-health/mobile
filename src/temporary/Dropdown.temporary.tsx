import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import {
  BaseButton,
  BaseButtonAccessoryProps,
  Button,
  ImageButton,
  RadioButtonGroup,
} from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms/TextField'
import { LoginRequest } from '@/models'
import colors from '@/theme/colors'
import { showError, showSuccess } from '@/utils/CommonUtils'

const data = [
  { email: 'testing@gmail.com', value: 'testing@gmail.com' },
  { email: 'admin@gmail.com', value: 'admin@gmail.com' },
  { email: 'Operator@gmail.com', value: 'operator@gmail.com' },
]

const languageOption = [
  { value: 1, label: 'Indonesia' },
  { value: 2, label: 'English' },
]

export default function LoginScreen() {
  const { control } = useForm<LoginRequest>({
    mode: 'onChange',
  })
  const buttonAccesory = React.memo(function renderAccessory(
    props: BaseButtonAccessoryProps
  ) {
    return <Text className={props.accessoryClassName}>X</Text>
  })
  const buttonShowError = () => {
    showError('Test Error')
  }

  const buttonShowSuccess = () => {
    showSuccess('Test Success')
  }
  return (
    <ScrollView className='px-6 flex-1 bg-white'>
      <Text className='font-mainMedium'>TODO: create login screen</Text>
      <Dropdown
        name='email'
        control={control}
        data={data}
        labelField='email'
        valueField='value'
      />
      <Dropdown
        preset='bottom-border'
        name='email'
        control={control}
        data={data}
        labelField='email'
        valueField='value'
        label='Search Email'
        placeholder='Select Email'
        search
        searchPlaceholder='Cari email O'
      />
      <Dropdown
        preset='bottom-border'
        name='email'
        control={control}
        data={data}
        labelField='email'
        valueField='value'
        label='Bottom border'
        placeholder='Select Email'
        containerClassName='p-3 rounded-sm border border-whiteTwo mb-3'
      />
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
      <Text className='mb-2 font-mainMedium'>Outlined Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton
          preset='outlined'
          text='BUTTON'
          containerClassName='flex-1'
        />
        <BaseButton
          preset='outlined'
          text='BUTTON'
          containerClassName='flex-1 border-main'
          textClassName='text-main'
          LeftAccessory={buttonAccesory}
          RightAccessory={buttonAccesory}
          isLoading
        />
        <BaseButton
          preset='outlined'
          text='BUTTON'
          containerClassName='flex-1'
          disabled
        />
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
        <ImageButton Icon={Icons.IcAdd} color={colors.leafyGreen} />
        <ImageButton
          preset='outlined'
          Icon={Icons.IcCheck}
          color={colors.bluePrimary}
        />
        <ImageButton
          preset='outlined-primary'
          Icon={Icons.IcDelete}
          color={colors.leafyGreen}
        />
        <ImageButton
          preset='filled'
          Icon={Icons.IcReview}
          color={colors.brightOrange}
        />
      </View>
      <RadioButtonGroup
        items={languageOption}
        control={control}
        name='language'
        label='Select Language'
        horizontal
      />
    </ScrollView>
  )
}
