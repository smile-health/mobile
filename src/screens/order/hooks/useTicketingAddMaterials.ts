import { useCallback, useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'

import { TicketBatch, TicketMaterial } from '@/models/order/Ticket'
import {
  addTicketMaterial,
  getReasons,
  getTicketMaterials,
  removeBatchFromTicketMaterial,
  removeTicketMaterial,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'
import { getFormQuantity } from '../helpers/TicketHelpers'
import { AddMaterialSchema } from '../schema/AddMaterialSchema'
import { AddMaterialFormFields } from '../types/form'

export const useTicketingAddMaterials = (initialMaterial?: TicketMaterial) => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  const reasonOptions = useAppSelector(getReasons)
  const ticketMaterials = useAppSelector(getTicketMaterials)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AddMaterialFormFields>({
    resolver: yupResolver(AddMaterialSchema),
    mode: 'onChange',
    defaultValues: {
      materialName: '',
      isBatch: 0,
      qty: undefined,
      reason: '',
      detail_reason: '',
    },
  })

  const qty = watch('qty')
  const isBatch = watch('isBatch')
  const materialName = watch('materialName')

  const selectedReasonId = watch('reason')
  const selectedReason = reasonOptions.find((r) => r.value === selectedReasonId)
  const detailReasonOptions = selectedReason?.children ?? []

  useEffect(() => {
    if (initialMaterial) {
      setValue('materialName', initialMaterial.name ?? '')
      setValue('isBatch', initialMaterial.is_managed_in_batch ? 1 : 0)
      setValue('qty', initialMaterial.qty ?? undefined)
      setValue('reason', initialMaterial.reason ?? '')
      setValue('detail_reason', initialMaterial.detail_reason ?? '')
    }
  }, [initialMaterial, setValue])

  const tempMaterial: TicketMaterial = useMemo(() => {
    const existingTempMaterial = ticketMaterials.find(
      (m) => m.name === '' && m.id > 1_000_000_000
    )

    if (existingTempMaterial && materialName === '') {
      return {
        ...existingTempMaterial,
        is_managed_in_batch: isBatch === 1,
      }
    }

    return {
      id: existingTempMaterial?.id ?? Date.now(),
      name: materialName,
      is_managed_in_batch: isBatch === 1,
      batches: existingTempMaterial?.batches ?? [],
      isSubmitted: 0,
    }
  }, [materialName, isBatch, ticketMaterials])

  const currentMaterial = useMemo(() => {
    if (initialMaterial) {
      const material = ticketMaterials.find((m) => m.id === initialMaterial.id)
      if (material) {
        return material
      }
    }

    const existingMaterial = ticketMaterials.find(
      (m) =>
        m.name.toLowerCase() === materialName.toLowerCase() && m.name !== ''
    )

    if (existingMaterial) {
      return existingMaterial
    }

    const existingTempMaterial = ticketMaterials.find(
      (m) => m.id === tempMaterial.id
    )

    return existingTempMaterial ?? tempMaterial
  }, [ticketMaterials, tempMaterial, materialName, initialMaterial])

  useEffect(() => {
    const backHandler = navigation.addListener('beforeRemove', () => {
      const isBatchMode = isBatch === 1
      const materialName = currentMaterial?.name?.trim() || ''

      if (isBatchMode) {
        const isBatchEmpty =
          !currentMaterial.batches || currentMaterial.batches.length === 0

        if (isBatchEmpty) {
          dispatch(removeTicketMaterial(currentMaterial.id))
        }
      } else {
        const isNameEmpty = materialName === ''
        const isQtyZero = qty === 0

        if (isNameEmpty || isQtyZero) {
          dispatch(removeTicketMaterial(currentMaterial.id))
        }
      }
    })

    return backHandler
  }, [navigation, isBatch, currentMaterial, isValid, dispatch, qty])

  const handleSave = (data: AddMaterialFormFields) => {
    const materialToUpdate = initialMaterial
      ? ticketMaterials.find((m) => m.id === initialMaterial.id)
      : ticketMaterials.find(
          (m) =>
            m?.name?.toLowerCase() === data?.materialName?.toLowerCase() &&
            m?.name !== ''
        )

    const totalQuantity = (currentMaterial.batches ?? []).reduce(
      (sum, batch) => sum + (batch.qty ?? 0),
      0
    )

    if (materialToUpdate) {
      const updatedMaterial: TicketMaterial = {
        ...materialToUpdate,
        name: data.materialName,
        is_managed_in_batch: data.isBatch === 1,
        batches: currentMaterial.batches ?? [],
      }

      if (data.isBatch === 0) {
        updatedMaterial.qty = getFormQuantity(data.qty)
        updatedMaterial.reason = data.reason
        updatedMaterial.detail_reason = data.detail_reason
        updatedMaterial.batches = []
      } else {
        updatedMaterial.qty = totalQuantity
        delete updatedMaterial.reason
        delete updatedMaterial.detail_reason

        updatedMaterial.batches = currentMaterial.batches ?? []
      }

      dispatch(addTicketMaterial(updatedMaterial))
    } else {
      const materialToSave: TicketMaterial = {
        ...currentMaterial,
        name: data.materialName,
        is_managed_in_batch: data.isBatch === 1,
        isSubmitted: 0,
      }

      if (data.isBatch === 0) {
        materialToSave.qty = getFormQuantity(data.qty)
        materialToSave.reason = data.reason
        materialToSave.detail_reason = data.detail_reason
        materialToSave.batches = []
      } else {
        materialToSave.qty = totalQuantity
        delete materialToSave.reason
        delete materialToSave.detail_reason

        materialToSave.batches = currentMaterial.batches ?? []
      }

      dispatch(addTicketMaterial(materialToSave))
    }

    navigation.navigate('CreateTicket', { section: 2 })
  }

  const handleAddBatch = useCallback(() => {
    const existingMaterial = ticketMaterials.find(
      (m) =>
        m.name.toLowerCase() === materialName.toLowerCase() && m.name !== ''
    )

    if (existingMaterial) {
      navigation.navigate('AddMaterialOrBatchScreen', {
        material: existingMaterial,
        mode: 'batch',
        isEdit: false,
      })
    } else {
      const existingTempMaterial = ticketMaterials.find(
        (m) => m.id === tempMaterial.id
      )

      if (!existingTempMaterial) {
        dispatch(addTicketMaterial(tempMaterial))
      }

      navigation.navigate('AddMaterialOrBatchScreen', {
        material: tempMaterial,
        mode: 'batch',
        isEdit: false,
      })
    }
  }, [navigation, tempMaterial, materialName, dispatch, ticketMaterials])

  const handleEditBatch = useCallback(
    (batch: TicketBatch) => {
      navigation.navigate('AddMaterialOrBatchScreen', {
        material: currentMaterial,
        mode: 'batch',
        isEdit: true,
        batch,
      })
    },
    [navigation, currentMaterial]
  )

  const handleDeleteBatch = useCallback(
    (batch: TicketBatch) => {
      dispatch(
        removeBatchFromTicketMaterial({
          materialId: currentMaterial.id,
          batchCode: batch.batch_code ?? '',
        })
      )
    },
    [dispatch, currentMaterial]
  )

  const isButtonValid = useMemo(() => {
    if (isBatch === 0) {
      return isValid
    }

    const hasBatches =
      currentMaterial.batches && currentMaterial.batches.length > 0
    const hasValidName = materialName.trim() !== ''

    return hasValidName && hasBatches
  }, [isBatch, currentMaterial.batches, materialName, isValid])

  return {
    control,
    errors,
    isButtonValid,
    isBatch,
    materialName,
    detailReasonOptions,
    currentMaterial,
    handleSave,
    handleAddBatch,
    handleEditBatch,
    handleDeleteBatch,
    handleSubmit,
    watch,
  }
}
