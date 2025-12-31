import React from 'react'
import { View } from 'react-native'
import { ParseKeys } from 'i18next'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { InfoRow } from '../list/InfoRow'

interface EntityActivityHeaderProps {
  activityName?: string
  entityName?: string
  entityLabel?: ParseKeys
}
export default function EntityActivityHeader(
  props: Readonly<EntityActivityHeaderProps>
) {
  const {
    activityName = '',
    entityName,
    entityLabel = 'label.customer',
  } = props
  const { t } = useLanguage()
  return (
    <View className={cn(AppStyles.borderBottom, 'bg-paleBlue px-4 py-2')}>
      <InfoRow
        label={t('label.activity')}
        value={activityName}
        labelClassName='text-marine'
        valueClassName='font-mainBold'
      />
      {!!entityName && (
        <InfoRow
          label={t(entityLabel)}
          value={entityName}
          labelClassName='text-marine'
          valueClassName='font-mainBold'
        />
      )}
    </View>
  )
}
