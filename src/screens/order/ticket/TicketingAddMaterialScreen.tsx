import React, { useCallback } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import { Icons } from '@/assets/icons'
import { Button, RadioButtonGroup } from '@/components/buttons'
import { TextField } from '@/components/forms/TextField'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { BaseForm } from '@/screens/shared/component/BaseForm'
import {
  getReasons,
  setIgnoreConfirm,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'
import { getTestID } from '@/utils/CommonUtils'
import BatchItemCard from '../component/BatchItemCard'
import { getRadioOptions } from '../helpers/TicketHelpers'
import { useTicketingAddMaterials } from '../hooks/useTicketingAddMaterials'

export default function TicketingAddMaterialScreen({
  route,
}: AppStackScreenProps<'TicketingAddNewMaterial'>) {
  const { material } = route.params || {}
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const reasonOptions = useAppSelector(getReasons)

  useFocusEffect(
    useCallback(() => {
      dispatch(setIgnoreConfirm(false))
    }, [dispatch])
  )

  const {
    control,
    errors,
    isButtonValid,
    isBatch,
    detailReasonOptions,
    currentMaterial,
    handleSave,
    handleAddBatch,
    handleEditBatch,
    handleDeleteBatch,
    handleSubmit,
  } = useTicketingAddMaterials(material)

  const renderItem = useCallback(
    ({ item }) => (
      <BatchItemCard
        t={t}
        batch={item}
        isSubmitted={item.isSubmitted}
        onEdit={() => handleEditBatch(item)}
        onDelete={() => handleDeleteBatch(item)}
      />
    ),
    [handleDeleteBatch, handleEditBatch, t]
  )

  const renderFooter = useCallback(
    () => (
      <Button
        text={`+ ${t('ticket.add_batch')}`}
        onPress={handleAddBatch}
        textClassName='text-main font-semibold'
        containerClassName='mb-4 self-start'
      />
    ),
    [t, handleAddBatch]
  )

  const isShowRadioButton =
    material !== undefined && Object.keys(material).length > 0

  return (
    <View className='flex-1 bg-white'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>
        <ScrollView className='p-4 flex-1'>
          <Text className='text-base font-semibold text-primary-dark mb-2'>
            Material
          </Text>
          <TextField
            name='materialName'
            control={control}
            label={t('ticket.new_material_name')}
            placeholder={t('ticket.new_material_name')}
            isMandatory
            errors={errors.materialName?.message}
            {...getTestID('textfield-material-name')}
          />
          {!isShowRadioButton && (
            <RadioButtonGroup
              label={t('label.is_batch')}
              items={getRadioOptions()}
              name='isBatch'
              control={control}
              labelField='label'
              valueField='value'
              horizontal
              isMandatory
              containerClassName='mt-4'
              errors={errors.isBatch?.message}
              {...getTestID('radio-button-is-batch')}
            />
          )}

          <View className='flex-1 h-2 bg-gray-100 mt-4 mx-[-16]' />

          {isBatch === 0 ? (
            <BaseForm
              control={control}
              errors={errors}
              title='Non-Batch Material Data'
              quantityField={{
                name: 'qty',
                isMandatory: true,
                testID: 'textfield-quantity',
              }}
              reasonField={{
                name: 'reason',
                data: reasonOptions,
                isMandatory: true,
                testID: 'dropdown-reason',
              }}
              detailReasonField={{
                name: 'detail_reason',
                data: detailReasonOptions,
                isMandatory: true,
                testID: 'dropdown-detail-reason',
              }}
            />
          ) : (
            <View className='mt-6'>
              <Text className='text-base font-semibold text-primary-dark mb-2'>
                Material Batch
              </Text>
              <FlatList
                data={currentMaterial?.batches}
                keyExtractor={(item) => `${item.batch_code}-material-batch`}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}
              />
            </View>
          )}
        </ScrollView>

        <View className='p-4'>
          <Button
            preset='filled'
            text={t('button.save')}
            onPress={handleSubmit(handleSave)}
            containerClassName='mt-6 gap-x-2'
            LeftIcon={Icons.IcCheck}
            disabled={!isButtonValid}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
