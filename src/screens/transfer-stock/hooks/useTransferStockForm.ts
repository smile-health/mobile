import { useCallback, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { ParseKeys } from 'i18next'
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import { StockItem } from '@/models/shared/Material'
import { UseNavigationScreen } from '@/navigators'
import { findNextMaterial } from '@/screens/inventory/helpers/TransactionHelpers'
import { setTransaction } from '@/services/features/transaction.slice'
import {
  homeState,
  trxState,
  useAppDispatch,
  useAppSelector,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { batchTypeSection, TRANSACTION_TYPE } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import useTransferStockActivities from './useTransferStockActivities'
import {
  getFormItemsValue,
  getValidTransferStock,
} from '../helpers/TransferStockHelpers'
import {
  TransferStockForm,
  TransferStockFormSchema,
} from '../schema/CreateTransferStockSchema'

export default function useTransferStockForm(
  materials: StockItem[],
  material: StockItem
) {
  const navigation = useNavigation<UseNavigationScreen>()
  const dispatch = useAppDispatch()
  const programId = useProgramId()
  const { t } = useLanguage()
  const { activeMenu } = useAppSelector(homeState)
  const { transactions, program } = useAppSelector(trxState)
  const transferStockActivities = useTransferStockActivities(
    t,
    program?.id,
    material.material.id
  )

  const methods = useForm<TransferStockForm>({
    mode: 'onChange',
    resolver: yupResolver(TransferStockFormSchema),
    defaultValues: getFormItemsValue(material, transactions),
  })
  const {
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = methods
  const { destination_activity_id, items } = watch()

  const sections = useMemo(() => {
    const allStocks = [...items.activeBatch, ...items.expiredBatch]
    if (allStocks.length === 0) return []
    return Object.entries(items).map(([fieldname, data]) => ({
      fieldname,
      title: batchTypeSection[fieldname] as ParseKeys,
      data,
    }))
  }, [items])

  const nextMaterial = useMemo(
    () => findNextMaterial(materials, material),
    [material, materials]
  )

  const handleChangeActivity = useCallback(
    (item: IOptions) => {
      setValue('destination_activity_id', item.value, { shouldValidate: true })
      setValue('destination_activity', item)
    },
    [setValue]
  )

  const handleSaveNext: SubmitHandler<TransferStockForm> = (data) => {
    const validTransaction = getValidTransferStock(data)
    dispatch(
      setTransaction({
        trxTypeId: TRANSACTION_TYPE.TRANSFER_STOCK,
        programId,
        transactions: validTransaction,
      })
    )
  }

  const handleSave: SubmitHandler<TransferStockForm> = (data) => {
    handleSaveNext(data)
    navigation.pop()
  }

  const handleError: SubmitErrorHandler<TransferStockForm> = () => {
    showError(t('error.complete_data'))
  }

  const handleNextMaterial = () => {
    if (!nextMaterial) return
    handleSubmit(handleSaveNext)()
    navigation.replace('CreateTransferStock', {
      materials,
      material: nextMaterial,
    })
  }

  return {
    t,
    program,
    methods,
    sections,
    control,
    errors,
    destination_activity_id,
    hasNextMaterial: !!nextMaterial,
    isBatch: !!material.material.is_managed_in_batch,
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    handleSaveTransferStock: handleSubmit(handleSave, handleError),
    handleNextMaterial,
    handleChangeActivity,
    ...transferStockActivities,
  }
}
