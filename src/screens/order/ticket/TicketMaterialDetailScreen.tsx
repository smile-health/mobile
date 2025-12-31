import React, { useCallback } from 'react'
import { View, Text, FlatList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import BatchItemCard from '@/screens/order/component/BatchItemCard'
import { useTicketMaterialDetail } from '@/screens/order/ticket/hooks/useTicketMaterialDetail'
import { BaseForm } from '@/screens/shared/component/BaseForm'
import { setIgnoreConfirm } from '@/services/features/ticketReason.slice'
import { useAppDispatch } from '@/services/store'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface Props extends AppStackScreenProps<'TicketMaterialDetail'> {}

export default function TicketMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const { material } = route.params
  const { t } = useLanguage()
  const dispatch = useAppDispatch()

  useFocusEffect(
    useCallback(() => {
      dispatch(setIgnoreConfirm(false))
    }, [dispatch])
  )

  const {
    currentMaterial,
    fieldConfigs,
    QUANTITY_FIELD_CONFIG,
    control,
    getFieldError,
    isButtonDisabled,
    handleAddBatch,
    handleEditBatch,
    handleDeleteBatch,
    handleSaveMaterial,
  } = useTicketMaterialDetail({ material, navigation })

  const renderItem = useCallback(
    ({ item }) => (
      <BatchItemCard
        t={t}
        batch={item}
        onEdit={() => handleEditBatch(item)}
        onDelete={() => handleDeleteBatch(item)}
        isSubmitted={material.isSubmitted}
        showBatchCode={false}
      />
    ),
    [handleDeleteBatch, handleEditBatch, material.isSubmitted, t]
  )

  const renderFooter = useCallback(
    () =>
      material.is_managed_in_batch ? (
        <Button
          text={`+ ${t('ticket.add_batch')}`}
          onPress={handleAddBatch}
          textClassName='text-main font-semibold'
          containerClassName='mb-4 self-start'
        />
      ) : null,
    [material.is_managed_in_batch, t, handleAddBatch]
  )

  return (
    <View className='flex-1'>
      <View className='flex-1'>
        <View className='px-3 py-2'>
          <Text className='text-base mb-2 font-semibold'>
            {t('section.material')}
          </Text>
          <View className='mb-4 p-3 bg-white rounded border border-gray-200 shadow-sm'>
            <Text className='text-base font-semibold'>{material.name}</Text>
            <Text className='text-xs text-gray-500 mt-1'>
              {t('label.updated_at')}{' '}
              {convertString(new Date(), SHORT_DATE_FORMAT)}
            </Text>
          </View>
        </View>

        <View className='flex-1 bg-white p-4'>
          {material.is_managed_in_batch ? (
            <View className='mb-4'>
              <FlatList
                data={currentMaterial?.batches}
                keyExtractor={(item, idx) => `${item.batch_code}-${idx}`}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}
              />
            </View>
          ) : (
            <BaseForm
              control={control}
              errors={{ ...getFieldError }}
              title={t('section.material_data')}
              quantityField={QUANTITY_FIELD_CONFIG}
              {...fieldConfigs}
            />
          )}
        </View>
      </View>
      <View className='p-4 border-t border-gray-200 bg-white'>
        <Button
          preset='filled'
          text={t('button.save')}
          containerClassName='mt-6 gap-x-2'
          LeftIcon={Icons.IcCheck}
          onPress={handleSaveMaterial}
          disabled={isButtonDisabled}
        />
      </View>
    </View>
  )
}
