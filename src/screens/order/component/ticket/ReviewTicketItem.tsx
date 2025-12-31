import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { TFunction } from 'i18next'
import { Reason } from '@/models/order/Reason'
import { TicketMaterial } from '@/models/order/Ticket'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import {
  findDetailReasonLabel,
  findReasonLabel,
} from '@/utils/helpers/labelLookup'
import { isNewMaterial } from '@/utils/helpers/MaterialHelpers'
import { getFormattedQuantity } from '../../helpers/TicketHelpers'
import BatchItemCard from '../BatchItemCard'

interface ReviewTicketItemProps {
  item: TicketMaterial
  t: TFunction
  reasonOptions: Reason[]
  handleDelete?: (material: TicketMaterial) => void
}

const ReviewTicketItem: React.FC<ReviewTicketItemProps> = ({
  item,
  t,
  reasonOptions,
  handleDelete,
}) => {
  const hasBatches = Array.isArray(item?.batches) && item?.batches?.length > 0

  const reasonLabel = findReasonLabel(item.reason ?? '', reasonOptions)

  const detailReasonLabel = findDetailReasonLabel(
    item.reason ?? '',
    item.detail_reason ?? item.child_reason ?? '',
    reasonOptions
  )

  const isDeleted = handleDelete ?? undefined
  const materialName = item.custom_material ?? item.material_name ?? item.name
  const isNewMaterialItem =
    item?.custom_material !== null || isNewMaterial(item.id)

  return (
    <View className='px-4 pt-4 mx-4 my-2 border border-whiteTwo rounded-sm bg-white'>
      <Text className={cn(AppStyles.textBoldMedium, 'mb-2 text-darkGray')}>
        {materialName}
      </Text>
      {isNewMaterialItem && (
        <Text
          className={cn(
            AppStyles.textRegularSmall,
            'mt-[-8] mb-2 text-mediumGray'
          )}>
          {t('ticket.new_material_label') || '(New Material)'}
        </Text>
      )}

      <View className='flex-row justify-between mb-2 border-b border-gray-200 pb-2'>
        <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
          {'Qty'}
        </Text>
        <Text className={cn(AppStyles.textRegularSmall, 'text-darkGray')}>
          {getFormattedQuantity(item)}
        </Text>
      </View>

      {hasBatches ? (
        <>
          <Text className={'text-mediumGray mb-2 text-bold font-mainBold'}>
            {t('ticket.material_batch')}
          </Text>
          {item.batches?.map((batch, index) => (
            <BatchItemCard
              key={`${batch.batch_code}-${index}`}
              batch={batch}
              editable={false}
              handleDeleteMaterial={isDeleted}
              materialId={item.id}
              isSubmitted={item.isSubmitted}
              t={t}
            />
          ))}
        </>
      ) : (
        <>
          <View className='mt-2 flex-row justify-between'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('label.reason')}
            </Text>
            <Text className={AppStyles.textRegularSmall}>{reasonLabel}</Text>
          </View>
          <View className='my-2 flex-row justify-between'>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {t('label.detail_reason')}
            </Text>
            <Text className={AppStyles.textRegularSmall}>
              {detailReasonLabel}
            </Text>
          </View>

          {handleDelete && (
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              className='self-end my-2'>
              <Text className='text-red-600 text-sm font-semibold'>
                {t('button.delete')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  )
}

ReviewTicketItem.displayName = 'ReviewTicketItem'

export default React.memo(ReviewTicketItem)
