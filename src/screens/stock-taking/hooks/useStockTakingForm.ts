import { useCallback, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { stockTakingState, useAppSelector } from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { DATE_CREATED_FORMAT } from '@/utils/Constants'
import { getStringUTC } from '@/utils/DateFormatUtils'
import {
  StockTakingForm,
  StockTakingFormItem,
  StockTakingFormSchema,
} from '../schema/CreateStockTakingSchema'

export function useStockTakingForm() {
  const { t } = useLanguage()
  const navigation = useNavigation()

  const { period, detail, parentMaterial } = useAppSelector(stockTakingState)
  const [isOpen, setIsOpen] = useState(false)

  const methods = useForm<StockTakingForm>({
    mode: 'onChange',
    resolver: yupResolver(StockTakingFormSchema),
    defaultValues: {
      entity_id: detail.entityId,
      period_id: period?.id,
      material_id: detail.materialId,
      items: detail.stocks,
    },
  })

  const formItems = methods.watch('items')
  const sections = useMemo(() => {
    return [{ title: t('section.material_batch'), data: formItems }]
  }, [formItems, t])

  const activityList = useMemo(() => {
    if (detail.isBatch) return []

    const formItemActivityIds = new Set(
      formItems.map((item) => item.activity_id)
    )
    return detail.activities.filter(
      (activity) => !formItemActivityIds.has(activity.id)
    )
  }, [detail.isBatch, detail.activities, formItems])

  const handleAddNewBatch = () => {
    navigation.navigate('AddBatchStockTaking', { batchList: formItems })
  }

  const handleAddDetail = useCallback(
    ({ id, name }) => {
      const newStock: StockTakingFormItem = {
        stock_id: null,
        actual_qty: null,
        in_transit_qty: 0,
        recorded_qty: 0,
        activity_id: id,
        activity_name: name,
      }
      methods.setValue('items', [...formItems, newStock])
      setIsOpen(false)
    },
    [formItems, methods]
  )

  const toggleSheet = useCallback(() => setIsOpen((prev) => !prev), [])

  const handleViewHistory = useCallback(() => {
    navigation.navigate('StockTakingHistory')
  }, [navigation])

  const handleSaveStockTaking: SubmitHandler<StockTakingForm> = (data) => {
    navigation.navigate('ReviewStockTaking', {
      data,
      createdAt: getStringUTC(DATE_CREATED_FORMAT),
    })
  }

  const handleErrorSaveStockTaking = () => {
    showError(t('error.complete_data'))
  }

  return {
    t,
    activityList,
    periodName: period?.name ?? '',
    parentMaterial,
    detail,
    sections,
    methods,
    isOpen,
    toggleSheet,
    handleAddNewBatch,
    handleAddDetail,
    handleViewHistory,
    handleSave: methods.handleSubmit(
      handleSaveStockTaking,
      handleErrorSaveStockTaking
    ),
  }
}
