import React, { useCallback } from 'react'
import { FlatList, View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { ReconciliationItem } from '@/models/reconciliation/ReconciliationList'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import ReconciliationHistoryTypeItem from './ReconciliationHistoryTypeItem'

interface Props {
  id: number
  updatedAt: string
  period: string
  items: ReconciliationItem[]
}

function ReconciliationHistoryItem({
  id,
  period,
  updatedAt,
  items,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const renderItem = useCallback(
    ({ item }) => (
      <ReconciliationHistoryTypeItem reconciliationId={id} item={item} />
    ),
    [id]
  )

  return (
    <View className='border border-quillGrey rounded-sm bg-white mx-4 mb-2 px-4 py-3 gap-y-2'>
      <InfoRow label={t('label.period')} value={period} />
      <InfoRow
        label={t('label.updated_at')}
        value={convertString(updatedAt, SHORT_DATE_TIME_FORMAT)}
      />
      <FlatList data={items} renderItem={renderItem} />
    </View>
  )
}

export default React.memo(ReconciliationHistoryItem)
