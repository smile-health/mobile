import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
interface BatchAllocationItemHierarchyProps {
  allocation: {
    stock_id: number
    draft_allocated_qty: number
    draft_order_stock_status_id: number
    draft_order_stock_status: {
      label: string
    }
    expired_date?: string
    manufacturer?: string
    stock: {
      activity: {
        name: string
      }
      batch: {
        code: number
        expired_date?: string
        manufacture: {
          name: string
        }
      }
    }
    activity: {
      name: string
    }
  }
  activityName: string
  t: TFunction
}

function BatchAllocationItemHierarchy({
  allocation,
  activityName,
  t,
}: Readonly<BatchAllocationItemHierarchyProps>) {
  const hasMaterialStatus = allocation?.draft_order_stock_status
  return (
    <View
      className='bg-white border-quillGrey border p-2 my-1 rounded-sm'
      accessibilityLabel={`Batch allocation ${allocation.stock_id}`}>
      <View className='flex-row items-center gap-x-2 mb-3'>
        <Text className={cn(AppStyles.textRegular, 'flex-1')}>
          {allocation?.stock?.batch?.code}
        </Text>
        <ActivityLabel
          name={allocation?.stock?.activity?.name || activityName}
        />
      </View>
      <InfoRow
        label={t('label.allocated_qty')}
        value={numberFormat(Number(allocation?.draft_allocated_qty))}
        valueClassName={AppStyles.textBoldSmall}
      />
      <Separator className='mt-2' />
      <InfoRow
        label={t('label.expired_date')}
        value={
          convertString(
            allocation?.stock?.batch?.expired_date,
            SHORT_DATE_FORMAT
          ) || '-'
        }
      />
      <InfoRow
        label={t('label.manufacturer')}
        value={allocation?.stock?.batch?.manufacture?.name || '-'}
        valueClassName={AppStyles.textBoldSmall}
      />
      {hasMaterialStatus && (
        <>
          <Separator className='mt-2' />
          <InfoRow
            label={t('label.material_status')}
            value={allocation?.draft_order_stock_status?.label || '-'}
            valueClassName={AppStyles.textBoldSmall}
          />
        </>
      )}
    </View>
  )
}

export default memo(BatchAllocationItemHierarchy)
