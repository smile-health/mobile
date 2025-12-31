import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { TFunction } from 'i18next'
import { TicketBatch, TicketMaterial } from '@/models/order/Ticket'
import { getReasons } from '@/services/features/ticketReason.slice'
import { useAppSelector } from '@/services/store'
import { numberFormat } from '@/utils/CommonUtils'
import {
  findDetailReasonLabel,
  findReasonLabel,
} from '@/utils/helpers/labelLookup'

type BatchInfoProps = {
  batch: TicketBatch
  t: TFunction
  reasonLabel?: string
  detailReasonLabel?: string
  editable?: boolean
  showBatchCode?: boolean
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
} as const

const BatchInfo = React.memo(
  ({
    batch,
    t,
    reasonLabel,
    detailReasonLabel,
    editable = false,
    showBatchCode = true,
  }: BatchInfoProps) => {
    const formattedDate = useMemo(() => {
      return new Date(batch.expired_date)
        .toLocaleDateString('en-GB', DATE_FORMAT_OPTIONS)
        .toUpperCase()
    }, [batch.expired_date])

    const showBatch = batch.batch_code && showBatchCode

    return (
      <View className={`mb-2 p-2 rounded-sm ${editable ? '' : 'bg-[#F5F5F4]'}`}>
        {showBatch && (
          <View className='mb-2 pb-2'>
            <Text className='text-xs text-gray-700 font-medium'>
              {batch.batch_code}
            </Text>
          </View>
        )}
        <View className='flex-row justify-between mb-2 pb-2 border-b border-gray-200'>
          <Text className='text-xs text-gray-500'>{t('label.quantity')}</Text>
          <Text className='text-xs text-gray-700 font-medium'>
            {numberFormat(batch.qty)}
          </Text>
        </View>
        <View className='flex-row justify-between mb-2'>
          <Text className='text-xs text-gray-500'>
            {t('label.expired_date')}
          </Text>
          <Text className='text-xs text-gray-700 font-medium'>
            {formattedDate}
          </Text>
        </View>
        <View className='flex-row justify-between mb-2'>
          <Text className='text-xs text-gray-500'>{t('label.reason')}</Text>
          <Text className='text-xs text-gray-700 font-medium'>
            {reasonLabel ?? batch.reason}
          </Text>
        </View>
        <View className='flex-row justify-between'>
          <Text className='text-xs text-gray-500'>
            {t('label.detail_reason')}
          </Text>
          <Text className='text-xs text-gray-700 font-medium'>
            {detailReasonLabel ?? batch.detail_reason}
          </Text>
        </View>
      </View>
    )
  }
)

BatchInfo.displayName = 'BatchInfo'

type Props = {
  batch: TicketBatch
  onEdit?: () => void
  onDelete?: () => void
  handleDeleteMaterial?: (material: TicketMaterial) => void
  t: TFunction
  editable?: boolean
  materialId?: number
  isSubmitted: number | undefined
  showBatchCode?: boolean
}

const BatchItemCard = ({
  batch,
  onEdit,
  onDelete,
  handleDeleteMaterial,
  t,
  editable = true,
  materialId,
  isSubmitted,
  showBatchCode = true,
}: Readonly<Props>) => {
  const reasonOptions = useAppSelector(getReasons)

  const reasonLabel = findReasonLabel(batch.reason, reasonOptions)
  const detailReasonLabel = findDetailReasonLabel(
    batch.reason,
    batch.detail_reason,
    reasonOptions
  )

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    } else if (handleDeleteMaterial && materialId) {
      const materialToDelete: TicketMaterial = {
        id: materialId,
        name: '',
        isSubmitted,
        batch_code: batch.batch_code ?? undefined,
        batches: [batch],
      }
      handleDeleteMaterial(materialToDelete)
    }
  }

  return (
    <View
      className={`mb-4 bg-white ${editable ? 'border border-gray-200 rounded-sm p-4' : ''}`}>
      {editable ? (
        <TouchableOpacity onPress={onEdit}>
          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-primary-dark font-semibold text-base'>
              {batch.batch_code}
            </Text>
            <Feather name='chevron-right' size={20} color='#6B7280' />
          </View>

          <BatchInfo
            batch={batch}
            editable
            t={t}
            reasonLabel={reasonLabel}
            detailReasonLabel={detailReasonLabel}
            showBatchCode={showBatchCode}
          />
        </TouchableOpacity>
      ) : (
        <BatchInfo
          batch={batch}
          t={t}
          reasonLabel={reasonLabel}
          detailReasonLabel={detailReasonLabel}
        />
      )}
      {(handleDeleteMaterial || onDelete) && (
        <TouchableOpacity onPress={handleDelete} className='self-end mt-2'>
          <Text className='text-red-600 text-sm font-semibold'>
            {t('button.delete')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

BatchItemCard.displayName = 'BatchItemCard'

export default React.memo(BatchItemCard)
