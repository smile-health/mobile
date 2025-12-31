import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import { BackHandler } from 'react-native'
import { TicketBatch, TicketMaterial } from '@/models/order/Ticket'
import { AppStackScreenProps } from '@/navigators'
import { useTicketingAddMaterials } from '@/screens/order/hooks/useTicketingAddMaterials'
import {
  addTicketMaterial,
  getReasons,
  getTicketMaterials,
  removeBatchFromTicketMaterial,
  removeTicketMaterial,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'

type NavigationProp = AppStackScreenProps<'TicketMaterialDetail'>['navigation']

interface UseTicketMaterialDetailProps {
  material: TicketMaterial
  navigation: NavigationProp
}

export const useTicketMaterialDetail = ({
  material,
  navigation,
}: UseTicketMaterialDetailProps) => {
  const dispatch = useAppDispatch()
  const ticketMaterials = useAppSelector(getTicketMaterials)
  const reasonOptions = useAppSelector(getReasons)

  const { control, errors, detailReasonOptions, watch } =
    useTicketingAddMaterials(material)

  const getFieldError = (fieldName: string) => {
    if (fieldName in errors) {
      return errors[fieldName as keyof typeof errors]?.message
    }
    return ''
  }

  const fieldConfigs = useMemo(() => {
    if (material.is_managed_in_batch) {
      return { reasonField: undefined, detailReasonField: undefined }
    }

    return {
      reasonField: {
        name: 'reason',
        data: reasonOptions,
        isMandatory: true,
        testID: 'dropdown-reason',
      },
      detailReasonField: {
        name: 'detail_reason',
        data: detailReasonOptions,
        isMandatory: true,
        testID: 'dropdown-detail-reason',
      },
    }
  }, [material.is_managed_in_batch, reasonOptions, detailReasonOptions])

  const QUANTITY_FIELD_CONFIG = {
    name: 'qty',
    isMandatory: true,
    testID: 'textfield-quantity',
  }

  const materialExists = useMemo(() => {
    return ticketMaterials.some((m) => m.id === material.id)
  }, [ticketMaterials, material.id])

  const currentMaterial = useMemo(() => {
    return ticketMaterials.find((m) => m.id === material.id) ?? material
  }, [ticketMaterials, material])

  const qty = watch('qty')
  const reason = watch('reason')
  const detailReason = watch('detail_reason')

  const validateBatchMaterial = useCallback(() => {
    return currentMaterial.batches && currentMaterial.batches.length > 0
  }, [currentMaterial.batches])

  const validateNonBatchMaterial = useCallback(() => {
    const hasValidQty = qty != null && qty !== 0 && qty > 0
    const hasValidReason = reason && reason !== ''
    const hasValidDetailReason = detailReason && detailReason !== ''

    return hasValidQty && hasValidReason && hasValidDetailReason
  }, [qty, reason, detailReason])

  const isButtonDisabled = useMemo(() => {
    return material.is_managed_in_batch
      ? !validateBatchMaterial()
      : !validateNonBatchMaterial()
  }, [
    material.is_managed_in_batch,
    validateBatchMaterial,
    validateNonBatchMaterial,
  ])

  useEffect(() => {
    if (!materialExists) {
      dispatch(
        addTicketMaterial({
          ...material,
          batches: [],
        })
      )
    }
  }, [dispatch, material, materialExists])

  const handleAddBatch = useCallback(() => {
    navigation.navigate('AddMaterialOrBatchScreen', {
      material,
      mode: material.is_managed_in_batch ? 'batch' : 'non-batch',
      isEdit: false,
    })
  }, [navigation, material])

  const handleEditBatch = useCallback(
    (batch: TicketBatch) => {
      navigation.navigate('AddMaterialOrBatchScreen', {
        material,
        mode: material.is_managed_in_batch ? 'batch' : 'non-batch',
        isEdit: true,
        batch,
      })
    },
    [material, navigation]
  )

  const handleDeleteBatch = useCallback(
    (batch: TicketBatch) => {
      dispatch(
        removeBatchFromTicketMaterial({
          materialId: material.id,
          batchCode: batch.batch_code ?? '',
        })
      )
    },
    [dispatch, material.id]
  )

  const handleBack = useCallback(() => {
    if (material.is_managed_in_batch) {
      const isBatchEmpty =
        !currentMaterial.batches || currentMaterial.batches.length === 0

      if (isBatchEmpty) {
        dispatch(removeTicketMaterial(material.id))
      }
    } else {
      const hasEmptyName = !material.name || material.name.trim() === ''
      const isQtyZero = !qty || qty === 0

      if (hasEmptyName || isQtyZero) {
        dispatch(removeTicketMaterial(material.id))
      }
    }

    navigation.navigate('CreateTicket', { section: 2 })
  }, [
    material.is_managed_in_batch,
    material.id,
    material.name,
    navigation,
    currentMaterial.batches,
    dispatch,
    qty,
  ])

  const handleSaveMaterial = useCallback(() => {
    const updatedMaterial = ticketMaterials.find((m) => m.id === material.id)

    if (updatedMaterial) {
      if (material.is_managed_in_batch) {
        const totalQuantity = (updatedMaterial.batches ?? []).reduce(
          (sum, batch) => sum + (batch.qty ?? 0),
          0
        )

        dispatch(
          addTicketMaterial({
            ...updatedMaterial,
            qty: totalQuantity,
            reason: undefined,
            detail_reason: undefined,

            batches: updatedMaterial.batches ?? [],
          })
        )
      } else if (qty !== 0) {
        dispatch(
          addTicketMaterial({
            ...updatedMaterial,
            qty,
            reason,
            detail_reason: detailReason,
            batches: [],
          })
        )
      }
    }

    navigation.navigate('CreateTicket', { section: 2 })
  }, [
    dispatch,
    ticketMaterials,
    material.id,
    material.is_managed_in_batch,
    navigation,
    qty,
    reason,
    detailReason,
  ])

  useEffect(() => {
    const backAction = () => {
      handleBack()
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [handleBack])

  useLayoutEffect(() => {
    const originalGoBack = navigation.goBack
    navigation.goBack = () => {
      handleBack()
    }

    return () => {
      navigation.goBack = originalGoBack
    }
  }, [navigation, handleBack])

  return {
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
    handleBack,
  }
}
