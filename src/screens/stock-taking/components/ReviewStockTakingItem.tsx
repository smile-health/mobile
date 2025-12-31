import React, { useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'
import { FieldValue } from '@/components/list/FieldValue'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import ReviewStockTakingStockItem from './ReviewStockTakingStockItem'
import { StockTakingFormItem } from '../schema/CreateStockTakingSchema'

interface Props {
  parentMaterialName?: string
  materialName: string
  totalActualQty: number
  createdAt: string
  items: StockTakingFormItem[]
}

function ReviewStockTakingItem({
  parentMaterialName,
  materialName,
  totalActualQty,
  createdAt,
  items,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const isHierarchy = !!parentMaterialName

  const renderItem = useCallback(
    ({ item }) => <ReviewStockTakingStockItem item={item} />,
    []
  )

  return (
    <View
      className={cn(
        'border border-quillGrey rounded-sm bg-white',
        isHierarchy ? 'p-3' : 'p-4'
      )}>
      {parentMaterialName && (
        <FieldValue
          label={t('label.active_ingredient_material')}
          value={parentMaterialName}
          containerClassName='mb-2'
          labelClassName='text-xs'
          valueClassName='font-mainBold'
        />
      )}
      <View
        className={cn(
          'gap-y-1',
          isHierarchy ? 'border border-quillGrey p-2' : undefined
        )}>
        {isHierarchy && (
          <Text className={AppStyles.labelBold}>
            {t('label.trademark_material')}
          </Text>
        )}
        <View className='flex-row'>
          <Text className={AppStyles.textBold} style={flexStyle}>
            {materialName}
          </Text>
          {!isHierarchy && (
            <Text className={cn(AppStyles.labelRegular, 'text-xxs')}>
              {convertString(createdAt, TIME_FORMAT)}
            </Text>
          )}
        </View>
        <InfoRow
          label={t('label.taken_stock_qty')}
          value={numberFormat(totalActualQty)}
          valueClassName='font-mainBold'
        />
        <FlatList data={items} renderItem={renderItem} />
      </View>
    </View>
  )
}

export default React.memo(ReviewStockTakingItem)
