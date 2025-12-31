import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import i18n from '@/i18n'
import { StockItem } from '@/models/shared/Material'
import { CreateTransactionForm } from '@/models/transaction/TransactionCreate'
import { setTransaction } from '@/services/features/transaction.slice'
import {
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import {
  createTransactionStock,
  getDefaultValue,
  getValidTransaction,
} from '../../helpers/TransactionHelpers'
import { getTrxValidationSchema } from '../../schema/TransactionCreateSchema'

function useDiscardTransactionForm(stockMaterial: StockItem) {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { transactions } = useAppSelector(trxState)

  const isBatch = !!stockMaterial.material.is_managed_in_batch
  const isOpenVial = !!stockMaterial.material.is_open_vial
  const stockDetail = stockMaterial.details[0] || null

  const trxDiscardStocks = useMemo(() => {
    return createTransactionStock(
      stockDetail?.stocks || [],
      transactions,
      stockMaterial.material,
      undefined,
      isOpenVial
    )
  }, [isOpenVial, stockDetail?.stocks, stockMaterial.material, transactions])

  const methods = useForm<CreateTransactionForm>({
    defaultValues: getDefaultValue(trxDiscardStocks, isBatch),
    mode: 'onChange',
    resolver: yupResolver(getTrxValidationSchema(TRANSACTION_TYPE.DISCARDS)),
  })
  const {
    watch,
    formState: { errors },
  } = methods
  const formDiscard = watch()
  const navigation = useNavigation()

  const handleSaveDiscardTransaction = () => {
    const transactions = [
      ...formDiscard.activeBatch,
      ...formDiscard.expiredBatch,
    ]
    const validTrxStock = getValidTransaction(transactions)
    const hasErrors = Object.keys(errors).length > 0

    if (validTrxStock.length === 0 || hasErrors || !selectedWorkspace?.id) {
      showError(i18n.t('error.complete_data'))
      return
    }
    dispatch(
      setTransaction({
        trxTypeId: TRANSACTION_TYPE.DISCARDS,
        programId: selectedWorkspace.id,
        transactions: validTrxStock,
      })
    )
    navigation.navigate('TransactionMaterialSelect')
  }

  return {
    methods,
    handleSubmit: handleSaveDiscardTransaction,
  }
}

export default useDiscardTransactionForm
