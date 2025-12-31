import { useMemo, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { AddDisposalForm } from '@/models/disposal/CreateSelfDisposal'
import {
  DisposalSectionData,
  DisposalSectionItem,
} from '@/models/disposal/DisposalMaterial'
import { DisposalDetailMaterialStockItem } from '@/models/disposal/DisposalStock'
import {
  AddDisposalFormSchema,
  getAddDisposalDefaultValues,
} from '@/screens/disposal/schema/AddDisposalSchema'
import { setBatchDisposal } from '@/services/features/disposal.slice'
import { disposalState, useAppSelector, useAppDispatch } from '@/services/store'
import {
  DISPOSAL_QTY_TYPE,
  disposalItemLabel,
  DisposalType,
} from '../disposal-constant'

interface UseAddDisposalFormProps {
  disposalStock: DisposalDetailMaterialStockItem
  type: DisposalType
}

export default function useAddDisposalForm({
  disposalStock,
  type,
}: UseAddDisposalFormProps) {
  const { t } = useLanguage()
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { activity, material, batchDisposalData } =
    useAppSelector(disposalState)

  const sections = useMemo(() => {
    const stocks = disposalStock.disposals
    const discardData = stocks?.map(
      (item) =>
        ({
          ...item.transaction_reason,
          disposal_qty: item.disposal_discard_qty,
        }) as DisposalSectionItem
    )
    const receivedData = stocks?.map(
      (item) =>
        ({
          ...item.transaction_reason,
          disposal_qty: item.disposal_received_qty,
        }) as DisposalSectionItem
    )
    return [
      {
        key: DISPOSAL_QTY_TYPE.DISCARD,
        title: t(disposalItemLabel[type].stockDiscard),
        data: discardData || [],
      },
      {
        key: DISPOSAL_QTY_TYPE.RECEIVED,
        title: t(disposalItemLabel[type].stockReceived),
        data: receivedData || [],
      },
    ] as unknown as DisposalSectionData[]
  }, [disposalStock.disposals, t, type])

  // Create default structure for form initialization
  const baseDefaultValues = useMemo(() => {
    const discardItems =
      disposalStock.disposals?.map((item) => ({
        max_qty: item.disposal_discard_qty,
        disposal_stock_id: item.disposal_stock_id,
        transaction_reason_id: item.transaction_reason.id,
        transaction_reason_name: item.transaction_reason.title,
      })) || []
    const receivedItems =
      disposalStock.disposals?.map((item) => ({
        max_qty: item.disposal_received_qty,
        disposal_stock_id: item.disposal_stock_id,
        transaction_reason_id: item.transaction_reason.id,
        transaction_reason_name: item.transaction_reason.title,
      })) || []

    return getAddDisposalDefaultValues(discardItems, receivedItems)
  }, [disposalStock.disposals])

  const methods = useForm<AddDisposalForm>({
    resolver: yupResolver(AddDisposalFormSchema),
    defaultValues: baseDefaultValues,
    mode: 'onChange',
  })

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = methods

  // Handle form population with existing data using setValue approach
  useEffect(() => {
    const existingData = batchDisposalData[disposalStock.id]

    if (existingData) {
      const mergedData = {
        discard: baseDefaultValues.discard.map((defaultItem) => {
          const existingItem = existingData.discard.find(
            (item) =>
              item.transaction_reason_id === defaultItem.transaction_reason_id
          )
          return existingItem || defaultItem
        }),
        received: baseDefaultValues.received.map((defaultItem) => {
          const existingItem = existingData.received.find(
            (item) =>
              item.transaction_reason_id === defaultItem.transaction_reason_id
          )
          return existingItem || defaultItem
        }),
      }

      // Use reset to update entire form values at once
      methods.reset(mergedData)
    }
  }, [disposalStock.id, batchDisposalData, methods, baseDefaultValues])

  const watchedValues = watch()

  const isSaveEnabled = useMemo(() => {
    const hasDiscardItems = watchedValues.discard?.some(
      (item) => item.disposal_qty > 0
    )
    const hasReceivedItems = watchedValues.received?.some(
      (item) => item.disposal_qty > 0
    )
    const hasErrors = Object.keys(errors).length > 0

    return (hasDiscardItems || hasReceivedItems) && !hasErrors
  }, [watchedValues, errors])

  const handleSave = (data: AddDisposalForm) => {
    // Filter out items with disposal_qty = 0 (empty fields)
    const filteredData = {
      discard: data.discard.filter((item) => item.disposal_qty > 0),
      received: data.received.filter((item) => item.disposal_qty > 0),
    }

    // Save filtered data to Redux using stock_id as key
    dispatch(
      setBatchDisposal({
        stockId: disposalStock.id,
        disposalData: filteredData,
      })
    )

    // Navigate back to the previous screen
    navigation.goBack()
  }

  return {
    activity,
    material,
    methods,
    errors,
    sections,
    control,
    isSaveEnabled,
    handleSave: handleSubmit(handleSave),
  }
}
