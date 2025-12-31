import { useCallback, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { TicketBatch, TicketMaterial } from '@/models/order/Ticket'
import {
  addBatchToTicketMaterial,
  addTicketMaterial,
  getTicketFormData,
  removeBatchFromTicketMaterial,
  setIgnoreConfirm,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'
import { DATE_FILTER_FORMAT, NAVIGATION_TIMEOUT } from '@/utils/Constants'
import { dateToString } from '@/utils/DateFormatUtils'
import { isNewMaterial } from '@/utils/helpers/MaterialHelpers'
import { TicketBatchSchema } from '../schema/TicketBatchSchema'
import { TicketNonBatchSchema } from '../schema/TicketNonBatchSchema'
import { BaseFormFields, BatchFormFields } from '../types/form'

export const useAddMaterialOrBatch = (
  material: TicketMaterial,
  mode: 'batch' | 'non-batch',
  defaultValuesOverride?: Partial<BatchFormFields>
) => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const formData = useAppSelector(getTicketFormData)

  const getDefaultValues = () => {
    if (defaultValuesOverride) {
      return defaultValuesOverride
    }

    return mode === 'batch'
      ? {
          batch_code: '',
          expired_date: '',
          qty: undefined,
          reason: '',
          detail_reason: '',
        }
      : {
          qty: undefined,
        }
  }

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<BatchFormFields | BaseFormFields>({
    resolver: yupResolver(
      mode === 'batch' ? TicketBatchSchema : TicketNonBatchSchema
    ),
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    if (defaultValuesOverride) {
      reset(defaultValuesOverride)
    }
  }, [defaultValuesOverride, reset])

  const handleDateChange = useCallback(
    (field: 'expired_date') => (val: Date) => {
      setValue(field, dateToString(val, DATE_FILTER_FORMAT), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const handleSubmitToStore = useCallback(
    (data: BatchFormFields) => {
      if (mode === 'batch') {
        const qty = typeof data.qty === 'number' ? data.qty : 0
        const ticketBatch: TicketBatch = {
          batch_code: data.batch_code,
          expired_date: data.expired_date,
          qty: qty,
          reason: data.reason ?? '',
          detail_reason: data.detail_reason ?? '',
        }

        if (
          defaultValuesOverride?.batch_code &&
          defaultValuesOverride.batch_code !== data.batch_code
        ) {
          dispatch(
            removeBatchFromTicketMaterial({
              materialId: material.id,
              batchCode: defaultValuesOverride.batch_code,
            })
          )
        }

        dispatch(
          addBatchToTicketMaterial({
            materialId: material.id,
            batch: ticketBatch,
          })
        )
        dispatch(setIgnoreConfirm(true))
        const isNewMaterialItem = isNewMaterial(material.id)
        setTimeout(() => {
          if (isNewMaterialItem) {
            navigation.goBack()
          } else {
            navigation.navigate('TicketMaterialDetail', {
              material: material,
              mode: 'batch',
              isEdit: true,
            })
          }
        }, NAVIGATION_TIMEOUT)
      } else {
        const updatedMaterial: TicketMaterial = {
          id: material.id,
          name: material.name,
          is_managed_in_batch: material.is_managed_in_batch,
          qty: data.qty,
          doNumber: formData?.doNumber ?? '',
          arrivalDate: formData?.arrivalDate ?? '',
          isSubmitted: formData?.isSubmitted,
          batches: material.batches,
        }

        dispatch(addTicketMaterial(updatedMaterial))
        dispatch(setIgnoreConfirm(true))
        setTimeout(() => {
          navigation.navigate('CreateTicket', { section: 2 })
        }, NAVIGATION_TIMEOUT)
      }
    },
    [dispatch, material, navigation, formData, mode, defaultValuesOverride]
  )

  const getFieldError = (fieldName: string) => {
    if (fieldName in errors) {
      return errors[fieldName as keyof typeof errors]?.message
    }
    return ''
  }

  return {
    control,
    getFieldError,
    watch,
    handleSubmit,
    handleDateChange,
    handleSubmitToStore,
    setValue,
    isValid,
    reset,
  }
}
