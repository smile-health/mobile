import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import {
  filterAllocatedDraftByOrderId,
  resetAllocatedDraft,
} from '@/services/features'
import { allocateState, useAppDispatch, useAppSelector } from '@/services/store'
import { AllocatedOrderSchema } from '../schema/AllocateOrderSchema'

export const useAllocatedOrder = (data) => {
  const { control, watch, setValue } = useForm({
    resolver: yupResolver(AllocatedOrderSchema()),
    mode: 'onChange',
    defaultValues: {
      comment: '',
      order_items: [],
    },
  })

  const form = watch()
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  const { allocatedDraft } = useAppSelector(allocateState)
  const isDisableSaveAllocate =
    (allocatedDraft?.length || 0) !== (data?.order_items?.length || 0)
  const orderId = data.id

  useEffect(() => {
    if (data?.id) {
      dispatch(filterAllocatedDraftByOrderId(orderId))
    }
  }, [data, data?.id, dispatch, orderId])

  const toggleDialog = () => setShowDeleteAllDialog(!showDeleteAllDialog)

  const handleSubmit = () =>
    navigation.navigate('AllocatedOrderReview', {
      data,
      comment: form.comment ?? '',
    })

  const handleDeleteOrders = () => {
    dispatch(resetAllocatedDraft())
    toggleDialog()
  }

  return {
    watch,
    setValue,
    form,
    control,
    handleSubmit,
    handleDeleteOrders,
    allocatedDraft,
    shouldShowButtonFooter: allocatedDraft.length > 0,
    toggleDialog,
    showDeleteAllDialog,
    isDisableSaveAllocate,
  }
}
