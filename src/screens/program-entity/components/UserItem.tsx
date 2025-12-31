import React from 'react'
import { View } from 'react-native'
import { ParseKeys, TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'

interface Props {
  labelNameKey?: ParseKeys
  name: string
  username: string
  role: string
  phone: string | null
  t: TFunction
}

function UserItem({
  labelNameKey,
  t,
  name,
  username,
  role,
  phone,
}: Readonly<Props>) {
  return (
    <View className='p-2 gap-y-1 mx-4 mb-2 bg-white border border-lightGreyMinimal rounded-sm'>
      <InfoRow
        label={t(labelNameKey ?? 'label.entity_name')}
        value={name}
        labelClassName='w-1/3 flex-none'
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.username')}
        value={username}
        labelClassName='w-1/3 flex-none'
      />
      <InfoRow
        label={t('label.phone_number')}
        value={phone ?? '-'}
        labelClassName='w-1/3 flex-none'
      />
      <InfoRow
        label={t('label.role')}
        value={role}
        labelClassName='w-1/3 flex-none'
      />
    </View>
  )
}

export default React.memo(UserItem)
