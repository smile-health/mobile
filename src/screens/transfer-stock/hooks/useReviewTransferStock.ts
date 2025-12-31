import { useCallback, useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLanguage } from '@/i18n/useLanguage'
import { ReviewTransactionStock } from '@/models/transaction/TransactionCreate'
import { useLazyGetMaterialsQuery } from '@/services/apis'
import { useCreateTransferStockMutation } from '@/services/apis/transfer-stock.api'
import {
  clearTransaction,
  deleteTransaction,
} from '@/services/features/transaction.slice'
import {
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import useProgramId from '@/utils/hooks/useProgramId'
import {
  createReviewItems,
  createTransferStockPayload,
} from '../helpers/TransferStockHelpers'

export default function useReviewTransferStock() {
  const { t } = useLanguage()
  const navigation = useNavigation()
  const programId = useProgramId()
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { transactions, program } = useAppSelector(trxState)

  const [createTransferStock, { isLoading }] = useCreateTransferStockMutation()
  const [
    updateAppDataMaterial,
    { isLoading: isLoadingMaterial, isFetching: isFetchingMaterial },
  ] = useLazyGetMaterialsQuery()

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const shouldShowLoading = [
    isLoading,
    isLoadingMaterial,
    isFetchingMaterial,
  ].some(Boolean)

  const reviewItems = useMemo(() => {
    return createReviewItems(transactions, program)
  }, [program, transactions])

  const openDeleteAllDialog = () => setShowDeleteAllDialog(true)
  const dismissDeleteAllDialog = () => setShowDeleteAllDialog(false)

  const handleClearTransferStock = useCallback(() => {
    dispatch(clearTransaction({ programId }))
    dismissDeleteAllDialog()
    navigation.goBack()
  }, [dispatch, navigation, programId])

  const handleDeleteItem = useCallback(
    (item: ReviewTransactionStock) => {
      if (transactions.length === 1) {
        handleClearTransferStock()
        return
      }
      dispatch(deleteTransaction({ transaction: item, programId }))
    },
    [dispatch, handleClearTransferStock, programId, transactions.length]
  )

  const handleSubmitTransferStock = async () => {
    if (isLoading) return
    try {
      const payload = createTransferStockPayload(
        transactions,
        selectedWorkspace?.entity_id,
        program?.id
      )
      await createTransferStock(payload).unwrap()
      await updateAppDataMaterial(programId)
      showSuccess(t('transaction.message.success_create'))
      dispatch(clearTransaction({ programId }))
      navigation.navigate('Home')
    } catch (error) {
      showError(formatErrorMessage(error))
    }
  }

  return {
    t,
    headerLabel: t('transfer_stock.destination_program'),
    program,
    reviewItems,
    shouldShowLoading,
    showDeleteAllDialog,
    openDeleteAllDialog,
    dismissDeleteAllDialog,
    handleDeleteItem,
    handleClearTransferStock,
    handleSubmitTransferStock,
  }
}
