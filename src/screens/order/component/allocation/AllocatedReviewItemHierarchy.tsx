import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import { OrderAllocateItem } from '@/models/order/OrderItem'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import BatchAllocationItemHierarchy from './BatchAllocationItemHierarchy'
import NonBatchAllocationItemHierarchy from './NonBatchAllocationItemHierarchy'

interface AllocatedReviewItemHierarchyProps {
  containerClassName?: string
  t: TFunction
  item: OrderAllocateItem
  detail: OrderDetailResponse
}

function AllocatedReviewItemHierarchy({
  containerClassName,
  t,
  item,
  detail,
}: Readonly<AllocatedReviewItemHierarchyProps>) {
  const isBatch = item?.is_managed_in_batch === 1
  return (
    <View
      className={cn(
        'mx-4 border-quillGrey border p-2 mb-2 rounded-sm',
        containerClassName
      )}>
      <Text
        className={cn(AppStyles.textBoldSmall, 'text-mediumGray mt-1 mb-2')}>
        {t('label.active_ingredient_material')}
      </Text>
      <Text className={cn(AppStyles.textBold, 'mb-1')}>
        {item?.material_name}
      </Text>
      <InfoRow
        label={t('label.allocated_qty')}
        value={numberFormat(item?.total_draft_allocated_qty)}
        valueClassName={AppStyles.textBoldSmall}
      />
      <InfoRow
        label={t('label.ordered_qty')}
        value={numberFormat(item?.qty)}
        valueClassName={AppStyles.textBoldSmall}
      />
      <Separator className='mt-3' />
      <Text
        className={cn(AppStyles.textBoldSmall, 'text-mediumGray mt-1 mb-2')}>
        {t('label.trademark_material')}
      </Text>
      {isBatch
        ? item.children.map((child) => {
            return (
              <View
                key={child.material.id}
                className='border border-lightGreyMinimal rounded-xs bg-catskillWhite p-2 mb-2'>
                <Text className={cn(AppStyles.textRegular, 'mb-1')}>
                  {child.material.name}
                </Text>
                <InfoRow
                  label={t('label.allocated_qty')}
                  value={numberFormat(item?.total_allocated_qty)}
                  valueClassName={AppStyles.textBoldSmall}
                />
                <InfoRow
                  label={t('label.ordered_qty')}
                  value={numberFormat(item?.qty)}
                  valueClassName={cn(AppStyles.textBoldSmall, 'my-1')}
                />
                <Separator className='mt-2' />
                <Text className={cn(AppStyles.labelBold, 'mb-2')}>
                  {t('section.material_batch')}
                </Text>
                {child.stock.map((allocation) => (
                  <BatchAllocationItemHierarchy
                    key={allocation.stock_id}
                    allocation={allocation}
                    activityName={detail.activity.name}
                    t={t}
                  />
                ))}
              </View>
            )
          })
        : item.children.map((child) => {
            return (
              <View
                key={child.material.id}
                className='border border-lightGreyMinimal rounded-xs bg-catskillWhite p-2 mb-2'>
                <Text className={cn(AppStyles.textRegular, 'mb-1')}>
                  {child.material.name}
                </Text>
                <InfoRow
                  label={t('label.allocated_qty')}
                  value={numberFormat(child?.total_allocated_qty)}
                  valueClassName={AppStyles.textBoldSmall}
                />
                {child.stock.map((stock) => {
                  const batchCode = stock?.stock?.batch?.code
                  const stockId = stock.stock_id
                  const activityName = stock?.stock?.activity?.name
                  return (
                    <NonBatchAllocationItemHierarchy
                      key={stockId}
                      batchCode={batchCode}
                      allocatedQty={stock.draft_allocated_qty}
                      activityName={activityName}
                      t={t}
                    />
                  )
                })}
              </View>
            )
          })}
    </View>
  )
}

export default memo(AllocatedReviewItemHierarchy)
