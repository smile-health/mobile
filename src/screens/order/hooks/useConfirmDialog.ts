import { useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TicketMaterial } from '@/models/order/Ticket'
import {
  removeTicketMaterial,
  setIgnoreConfirm,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'

interface UseConfirmDialogProps {
  isDirty: boolean
  ignoreConfirm?: boolean
  onConfirm?: () => void
  customBackAction?: () => boolean
  clearDataOnBack?: () => void
  currentStep?: number
  totalSteps?: number
  material?: TicketMaterial
  isBatchScreen?: boolean
}

export const useConfirmDialog = ({
  isDirty,
  onConfirm,
  customBackAction,
  clearDataOnBack,
  currentStep = 1,
  totalSteps = 1,
  material,
  isBatchScreen = false,
  ignoreConfirm: ignoreConfirmProp = false,
}: UseConfirmDialogProps) => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const [showConfirm, setShowConfirm] = useState(false)
  const storeIgnoreConfirm = useAppSelector(
    (state) => state.ticketReason.ignoreConfirm
  )

  const checkAndRemoveIncompleteMaterial = useCallback(() => {
    if (isBatchScreen && material) {
      const hasBatches = material.batches && material.batches.length > 0
      const hasName = material.name && material.name.trim() !== ''

      if (!hasBatches || !hasName) {
        dispatch(removeTicketMaterial(material.id))
        return true
      }
    }
    return false
  }, [isBatchScreen, material, dispatch])

  useEffect(() => {
    if (ignoreConfirmProp) {
      dispatch(setIgnoreConfirm(true))
    }
  }, [])

  const handleManualBackFromFirstStep = useCallback(() => {
    if (totalSteps > 1) {
      return false
    }

    if (isDirty && !storeIgnoreConfirm) {
      setShowConfirm(true)
      return true
    }
    return false
  }, [isDirty, storeIgnoreConfirm, totalSteps])

  const handleBackFromLaterStep = useCallback(() => {
    if (isDirty && !storeIgnoreConfirm) {
      setShowConfirm(true)
      return true
    }

    if (clearDataOnBack) {
      clearDataOnBack()
    }

    return false
  }, [clearDataOnBack, isDirty, storeIgnoreConfirm])

  const handleBackPress = useCallback(() => {
    if (isBatchScreen && !isDirty) {
      checkAndRemoveIncompleteMaterial()
    }

    if (customBackAction) {
      return customBackAction()
    }

    if (currentStep > 1 && currentStep <= totalSteps) {
      return handleBackFromLaterStep()
    } else if (currentStep === 1) {
      return handleManualBackFromFirstStep()
    }

    return false
  }, [
    isBatchScreen,
    isDirty,
    customBackAction,
    currentStep,
    totalSteps,
    checkAndRemoveIncompleteMaterial,
    handleBackFromLaterStep,
    handleManualBackFromFirstStep,
  ])

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const backHandlerRef = useRef<any>(null)

  const removeAllListeners = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    if (backHandlerRef.current) {
      backHandlerRef.current.remove()
      backHandlerRef.current = null
    }
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (e: { preventDefault: () => void }) => {
        if (handleBackPress()) {
          e.preventDefault()
        }
      }
    )
    unsubscribeRef.current = unsubscribe
    return unsubscribe
  }, [navigation, handleBackPress])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    )
    backHandlerRef.current = backHandler
    return () => backHandler.remove()
  }, [handleBackPress])

  const handleCancelLeave = () => {
    setShowConfirm(false)
  }

  const handleConfirmLeave = () => {
    dispatch(setIgnoreConfirm(true))

    setShowConfirm(false)

    if (onConfirm) {
      onConfirm()
    }

    removeAllListeners()

    navigation.goBack()
  }

  return {
    showConfirm,
    setShowConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBackPress,
    checkAndRemoveIncompleteMaterial,
    removeAllListeners,
  }
}
