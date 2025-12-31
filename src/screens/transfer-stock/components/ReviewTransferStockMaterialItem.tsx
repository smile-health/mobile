import React, { useCallback } from 'react'
import { View, FlatList, Text, ListRenderItem } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { ReviewTransactionStock } from '@/models/transaction/TransactionCreate'
import {
  IReviewTransferStockItem,
  IReviewTransferStockMaterialItem,
} from '@/models/transaction/TransferStock'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import ReviewTransferStockItem from './ReviewTransferStockItem'

interface Props {
  item: IReviewTransferStockMaterialItem
  onDelete: (item: ReviewTransactionStock) => void
}

function ReviewTransferStockMaterialItem({ item, onDelete }: Readonly<Props>) {
  const { t } = useLanguage()
  const { materialId, materialName, createdAt, items } = item

  const renderItem: ListRenderItem<IReviewTransferStockItem> = useCallback(
    ({ item: stockItem, index }) => (
      <ReviewTransferStockItem
        index={index}
        item={stockItem}
        onDelete={() => onDelete(stockItem)}
      />
    ),
    [onDelete]
  )

  return (
    <View
      className={cn(AppStyles.card, 'bg-white mb-2')}
      {...getTestID(`ReviewTransferStockMaterialItem-${materialId}`)}>
      <View className='flex-row items-center mb-2 gap-x-2'>
        <Icons.IcFlag height={16} width={16} />
        <Text className={cn(AppStyles.labelRegular, 'text-scienceBlue flex-1')}>
          {t('home.menu.transfer_stock')}
        </Text>
        <Text className={AppStyles.labelRegular}>{createdAt}</Text>
      </View>
      <Text className={AppStyles.textBold}>{materialName}</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        contentContainerClassName='gap-y-2'
      />
    </View>
  )
}

export default React.memo(ReviewTransferStockMaterialItem)
