import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'

interface NonBatchAllocationItemHierarchyProps {
  batchCode: number
  allocatedQty: number
  activityName: string
  t: TFunction
}

function NonBatchAllocationItemHierarchy({
  batchCode,
  allocatedQty,
  activityName,
  t,
}: Readonly<NonBatchAllocationItemHierarchyProps>) {
  return (
    <View
      className='border-quillGrey border p-2 my-1 rounded-sm'
      accessibilityLabel={`Non-batch allocation ${batchCode}`}>
      <View className='flex-row items-center gap-x-2 mb-3'>
        <Text className={cn(AppStyles.textRegular, 'flex-1')}>{batchCode}</Text>
        <ActivityLabel name={activityName} />
      </View>
      <InfoRow
        label={t('label.allocated_qty')}
        value={numberFormat(Number(allocatedQty))}
        valueClassName={AppStyles.textBoldSmall}
      />
    </View>
  )
}

export default memo(NonBatchAllocationItemHierarchy)
