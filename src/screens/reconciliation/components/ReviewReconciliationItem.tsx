import React, { useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import ReviewReconciliationTypeItem from './ReviewReconciliationTypeItem'
import { ReconciliationFormItem } from '../schema/CreateReconciliationSchema'

interface Props {
  materialName: string
  periodText: string
  createdAt: string
  items: ReconciliationFormItem[]
}

function ReviewReconciliationItem({
  materialName,
  periodText,
  createdAt,
  items,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const renderItem = useCallback(
    ({ item }) => <ReviewReconciliationTypeItem item={item} />,
    []
  )

  return (
    <View className='border border-quillGrey rounded-sm bg-white px-4 py-3 gap-y-2'>
      <View className='flex-row'>
        <Text className={AppStyles.textBold} style={flexStyle}>
          {materialName}
        </Text>
        <Text className={cn(AppStyles.labelRegular, 'text-xxs')}>
          {convertString(createdAt, TIME_FORMAT)}
        </Text>
      </View>
      <InfoRow
        label={t('label.period')}
        value={periodText}
        valueClassName='uppercase'
      />
      <FlatList data={items} renderItem={renderItem} />
    </View>
  )
}

export default React.memo(ReviewReconciliationItem)
