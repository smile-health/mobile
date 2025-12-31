import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'
import AppStyles from '@/theme/AppStyles'

interface Props {
  title: string
  name: string
  address: string
  t: TFunction
}

function EntityInfo({ t, title, name, address }: Readonly<Props>) {
  return (
    <View className='p-4 bg-lightGrey gap-y-2 border-b border-quillGrey'>
      <Text className={AppStyles.textBold}>{title}</Text>
      <View className='p-2 gap-y-1 bg-white border border-lightGreyMinimal rounded-sm'>
        <InfoRow
          label={t('label.entity_name')}
          value={name}
          labelClassName='w-1/3 flex-none'
          valueClassName='font-mainBold'
        />
        <InfoRow
          label={t('label.address')}
          value={address}
          className='items-start'
          labelClassName='w-1/3 flex-none'
          valueClassName='flex-1'
        />
      </View>
    </View>
  )
}

export default React.memo(EntityInfo)
