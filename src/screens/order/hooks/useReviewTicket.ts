import { useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import { TicketMaterial } from '@/models/order/Ticket'
import { AppStackParamList } from '@/navigators'
import {
  clearTicketMaterials,
  clearTicketFormData,
  TicketFormData,
  removeTicketMaterial,
  removeBatchFromTicketMaterial,
} from '@/services/features/ticketReason.slice'
import { useAppDispatch } from '@/services/store'
import { DELAY_TIMEOUT } from '@/utils/Constants'
import { useTicketSubmission } from './useTicketSubmission'
import { navigateToTicketDetail } from '../helpers/NavigationHelpers'

type CommentFormData = {
  comment: string | null
  requestCancel: boolean | null
}

export function useReviewTicket({
  ticketMaterials,
  ticketFormData,
}: {
  ticketMaterials: TicketMaterial[]
  ticketFormData: TicketFormData | undefined
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  const [materialToDelete, setMaterialToDelete] = useState<number | null>(null)

  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const dispatch = useAppDispatch()

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommentFormData>({
    defaultValues: {
      comment: null,
      requestCancel: null,
    },
  })

  const commentValue = watch('comment')
  const requestCancelValue = watch('requestCancel')

  const { handleSend, isLoading } = useTicketSubmission({
    ticketMaterials,
    ticketFormData,
    comment: commentValue,
    requestCancel: requestCancelValue,
  })

  const handleDeleteAll = useCallback(() => {
    setMaterialToDelete(null)
    setShowDeleteAllConfirm(true)
  }, [])

  const confirmDeleteAll = useCallback(
    (materialId?: number) => {
      setShowDeleteAllConfirm(false)

      if (materialId) {
        dispatch(removeTicketMaterial(materialId))
      } else {
        dispatch(clearTicketMaterials())
        dispatch(clearTicketFormData())
      }

      setTimeout(() => {
        navigation.navigate('CreateTicket', { section: 1 })
      }, 500)
    },
    [dispatch, navigation]
  )

  const onSend = useCallback(() => {
    if (ticketFormData?.isSubmitted === 1 && requestCancelValue !== true) {
      if (requestCancelValue === null) {
        setValue('requestCancel', false)
      }
      setShowConfirm(false)
      return
    }

    handleSend(
      (responseId: number) => {
        setShowConfirm(false)
        setTimeout(() => {
          navigateToTicketDetail(responseId)
        }, DELAY_TIMEOUT)
      },
      () => {
        setShowConfirm(false)
      }
    )
  }, [handleSend, requestCancelValue, setValue, ticketFormData?.isSubmitted])

  const handleDeleteBatch = useCallback(
    (materialId: number, batchCode: string) => {
      dispatch(removeBatchFromTicketMaterial({ materialId, batchCode }))
    },
    [dispatch]
  )

  const handleDeleteMaterial = useCallback(
    (material: TicketMaterial) => {
      if (
        material.batches &&
        material.batches.length > 0 &&
        material.batch_code
      ) {
        handleDeleteBatch(material.id, material.batch_code)
        return
      }

      if (ticketMaterials.length <= 1) {
        setMaterialToDelete(material.id)
        setShowDeleteAllConfirm(true)
      } else {
        dispatch(removeTicketMaterial(material.id))
      }
    },
    [
      dispatch,
      ticketMaterials.length,
      setShowDeleteAllConfirm,
      setMaterialToDelete,
      handleDeleteBatch,
    ]
  )

  const handleConfirmDelete = useCallback(() => {
    confirmDeleteAll(materialToDelete || undefined)
    setMaterialToDelete(null)
  }, [confirmDeleteAll, materialToDelete])

  return {
    isLoading,
    showConfirm,
    setShowConfirm,
    showDeleteAllConfirm,
    setShowDeleteAllConfirm,
    handleDeleteMaterial,
    handleDeleteAll,
    confirmDeleteAll: handleConfirmDelete,
    originalConfirmDeleteAll: confirmDeleteAll,
    onSend,
    control,
    commentValue,
    requestCancelValue,
    errors: errors.comment?.message,
  }
}
