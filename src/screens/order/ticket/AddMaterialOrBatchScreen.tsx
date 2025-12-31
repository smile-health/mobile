import React, { useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import InputDate from '@/components/forms/InputDate'
import { TextField } from '@/components/forms/TextField'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { BaseForm } from '@/screens/shared/component/BaseForm'
import { useGetReasonsQuery } from '@/services/apis/reason.api'
import {
  getReasons,
  getStoreIgnoreConfirm,
  setIgnoreConfirm,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'
import { getTestID } from '@/utils/CommonUtils'
import {
  MAXIMUM_DATE_TICKET,
  MINIMUM_DATE_TICKET,
  STEPS,
} from '@/utils/Constants'
import { stringToDate } from '@/utils/DateFormatUtils'
import { useAddMaterialOrBatch } from '../hooks/useAddMaterialOrBatch'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import { BatchFormFields, BaseFormFields } from '../types/form'

const QUANTITY_FIELD_CONFIG = {
  name: 'qty',
  isMandatory: true,
  testID: 'textfield-qty',
} as const

const createBatchFieldConfig = (
  name: string,
  data: Array<{ label: string; value: string }>,
  testID: string
) => ({
  name,
  data,
  isMandatory: true,
  testID,
})

export default function AddMaterialOrBatchScreen({
  route,
}: AppStackScreenProps<'AddMaterialOrBatchScreen'>) {
  const { material, mode, batch, isEdit } = route.params
  const { t } = useLanguage()
  const dispatch = useAppDispatch()

  useGetReasonsQuery()
  const reasonOptions = useAppSelector(getReasons)
  const storeIgnoreConfirm = useAppSelector(getStoreIgnoreConfirm)

  useEffect(() => {
    dispatch(setIgnoreConfirm(false))
  }, [dispatch])

  const defaultValues = useMemo(() => {
    if (isEdit && batch && mode === 'batch') {
      return {
        batch_code: batch.batch_code || '',
        expired_date: batch.expired_date,
        qty: batch.qty,
        reason: batch.reason ? String(batch.reason) : '',
        detail_reason: batch.detail_reason ? String(batch.detail_reason) : '',
      }
    }
    if (mode === 'batch') {
      return {
        batch_code: '',
        expired_date: '',
        qty: undefined,
        reason: '',
        detail_reason: '',
      }
    }
    return { qty: 1 }
  }, [isEdit, batch, mode])

  const {
    control,
    getFieldError,
    watch,
    handleSubmit,
    handleDateChange,
    handleSubmitToStore,
    isValid,
    reset,
  } = useAddMaterialOrBatch(material, mode, defaultValues)

  useEffect(() => {
    if (mode !== 'batch' || reasonOptions.length > 0) {
      reset(defaultValues)
    }
  }, [reset, defaultValues, reasonOptions, mode])

  const selectedReasonId = watch('reason')

  const initialFormRef = useRef<BatchFormFields | BaseFormFields>(
    mode === 'batch'
      ? {
          batch_code: '',
          expired_date: '',
          qty: undefined as unknown as number,
          reason: '',
          detail_reason: '',
        }
      : { qty: 1 }
  )
  const formValue = watch()

  const isDirty = useMemo(
    () => JSON.stringify(formValue) !== JSON.stringify(initialFormRef.current),
    [formValue]
  )

  const { showConfirm, handleCancelLeave, handleConfirmLeave } =
    useConfirmDialog({
      isDirty,
      onConfirm: () => reset(defaultValues),
      currentStep: STEPS.FORM,
      totalSteps: STEPS.FORM,
      material: material,
      isBatchScreen: mode === 'batch',
    })

  const handleSave = (data: BatchFormFields | BaseFormFields) => {
    handleSubmitToStore(data as BatchFormFields)
  }

  const expired_date = mode === 'batch' ? (watch('expired_date') as string) : ''
  const expiredDate = expired_date ? stringToDate(expired_date) : undefined

  const batchFieldConfigs = useMemo(() => {
    if (mode !== 'batch')
      return { reasonField: undefined, detailReasonField: undefined }

    const selectedReason = reasonOptions.find(
      (r) => r.value === selectedReasonId
    )
    const detailReasonOptions = selectedReason?.children ?? []

    return {
      reasonField: createBatchFieldConfig(
        'reason',
        reasonOptions,
        'dropdown-reason'
      ),
      detailReasonField: createBatchFieldConfig(
        'detail_reason',
        detailReasonOptions,
        'dropdown-detail-reason'
      ),
    }
  }, [mode, reasonOptions, selectedReasonId])

  useToolbar({
    title: mode === 'batch' ? t('ticket.add_batch') : t('ticket.add_material'),
  })

  return (
    <View className='flex-1 bg-white'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>
        <ScrollView className='p-4 flex-1'>
          <Text className='text-base font-semibold text-primary-dark mb-2'>
            Material Batch Data
          </Text>

          {mode === 'batch' && (
            <>
              <TextField
                name='batch_code'
                control={control}
                autoCapitalize='characters'
                label={t('label.code_batch')}
                placeholder={t('label.code_batch')}
                errors={getFieldError('batch_code')}
                isMandatory
                {...getTestID('textfield-code-batch')}
              />
              <InputDate
                date={expiredDate}
                minimumDate={MINIMUM_DATE_TICKET}
                maximumDate={MAXIMUM_DATE_TICKET}
                label={t('label.expired_date_batch')}
                onDateChange={handleDateChange('expired_date')}
                testID='inputdate-expired-date'
                errors={getFieldError('expired_date')}
                isMandatory
              />
            </>
          )}

          <BaseForm
            control={control}
            errors={{ ...getFieldError }}
            quantityField={QUANTITY_FIELD_CONFIG}
            {...batchFieldConfigs}
          />
        </ScrollView>

        <View className='p-4'>
          <Button
            preset='filled'
            text={t('button.save')}
            onPress={handleSubmit(handleSave)}
            containerClassName='mt-6'
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>

      <ConfirmationDialog
        modalVisible={showConfirm && !storeIgnoreConfirm}
        title={t('dialog.unsaved_changes')}
        message={t('dialog.unsaved_changes_message')}
        confirmText={t('button.yes')}
        cancelText={t('button.cancel')}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        dismissDialog={handleCancelLeave}
      />
    </View>
  )
}
