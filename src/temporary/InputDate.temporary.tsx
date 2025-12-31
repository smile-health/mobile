import React from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import InputDate from '@/components/forms/InputDate'

export default function InputDateTemporary() {
  const { t } = useTranslation()

  return (
    <View className=' bg-white p-4'>
      <View className='flex-row  justify-between'>
        <InputDate
          date={new Date()}
          label={t('label.start_date')}
          maximumDate={new Date()}
          className='flex-1 bg-white'
          onDateChange={(val) => console.log(val)}
          colorLabel={true}
        />
        <View className='w-4' />
        <InputDate
          label={t('label.end_date')}
          className='flex-1 bg-white'
          onDateChange={(val) => console.log(val)}
        />
      </View>
    </View>
  )
}
