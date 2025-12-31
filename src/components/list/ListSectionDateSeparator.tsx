import React from 'react'
import { View, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'

interface Props {
  date: string
  count: number
}

function ListSectionDateSeparator(props: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <View className='flex-row items-center py-2 mb-4 gap-x-2 bg-gentleMist'>
      <View className='border-b border-main flex-1' />
      <Text className='font-mainRegular text-[10px] text-mediumGray uppercase'>
        {props.date}
      </Text>
      <Text className='font-mainRegular text-[10px] bg-main text-mainText py-1 px-2 rounded-lg'>
        {t('label.count_items', { count: props.count })}
      </Text>
      <View className='border-b border-main flex-1' />
    </View>
  )
}

export default React.memo(ListSectionDateSeparator)
