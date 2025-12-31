import React from 'react'
import { Text, View } from 'react-native'
import { useForm } from 'react-hook-form'
import {
  BaseButton,
  BaseButtonAccessoryProps,
  Button,
  RadioButtonGroup,
} from '@/components/buttons'
import colors from '@/theme/colors'

const languageOption = [
  { value: 1, label: 'Indonesia' },
  { value: 2, label: 'English' },
]

export default function ButtonTemporary() {
  const { control } = useForm<{ languageId: number }>({
    mode: 'onChange',
  })
  const buttonAccesory = React.memo(function renderAccessory(
    props: BaseButtonAccessoryProps
  ) {
    return <Text className={props.accessoryClassName}>X</Text>
  })
  return (
    <View className='px-6 bg-lightPink flex-1'>
      <Text>TODO: create login screen</Text>
      <Text className='mb-2'>Default Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton text='Button' containerClassName='flex-1' />
        <BaseButton
          text='Button'
          containerClassName='flex-1'
          textClassName='text-main'
        />
        <BaseButton text='Button' containerClassName='flex-1' disabled />
      </View>
      <Text className='mb-2'>Outlined Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton
          preset='outlined'
          text='Button'
          containerClassName='flex-1'
        />
        <BaseButton
          preset='outlined'
          text='Button'
          containerClassName='flex-1 border-main'
          textClassName='text-main'
          LeftAccessory={buttonAccesory}
          RightAccessory={buttonAccesory}
          isLoading
        />
        <BaseButton
          preset='outlined'
          text='Button'
          containerClassName='flex-1'
          disabled
        />
      </View>
      <Text className='mb-2'>Outlined Primary Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton
          preset='outlined-primary'
          text='Button'
          containerClassName='flex-1'
        />
        <BaseButton
          preset='outlined-primary'
          text='Button'
          containerClassName='flex-1'
          textClassName='text-main'
          isLoading
        />
        <BaseButton
          preset='outlined-primary'
          text='Button'
          containerClassName='flex-1'
          disabled
        />
      </View>
      <Text className='mb-2'>Outlined Buttons :</Text>
      <View className='flex-row gap-2 mb-2'>
        <BaseButton preset='filled' text='Button' containerClassName='flex-1' />
        <BaseButton
          preset='filled'
          text='Button'
          containerClassName='flex-1 bg-bluePrimary'
          isLoading
          loadingColor={colors.white}
        />
        <BaseButton
          preset='filled'
          text='Button'
          containerClassName='flex-1'
          disabled
        />
      </View>
      <Text className='mb-2'>App Button :</Text>
      <View className='flex-row gap-2 mb-2'>
        <Button
          preset='outlined'
          containerClassName='flex-1'
          text='Hapus Semua'
          //   leftIcon={Icons.IcDelete}
        />
        <Button
          preset='filled'
          containerClassName='flex-1'
          text='Ulasan'
          //   leftIcon={Icons.IcReview}
        />
      </View>
      <Text className='mb-2'>Image Button :</Text>
      <View className='flex-row justify-between'>
        {/* <ImageButton
         source={Icons.IcDelete}
          color={colors.leafyGreen} />
        <ImageButton
          preset='outlined'
          source={Icons.IcDelete}
          color={colors.leafyGreen}
        />
        <ImageButton
          preset='outlined-primary'
          source={Icons.IcDelete}
          color={colors.leafyGreen}
        />
        <ImageButton
          preset='filled'
          source={Icons.IcDelete}
          color={colors.leafyGreen}
        /> */}
      </View>
      <RadioButtonGroup
        items={languageOption}
        labelField='label'
        valueField='value'
        control={control}
        name='language'
        label='Select Language'
        horizontal
      />
    </View>
  )
}
