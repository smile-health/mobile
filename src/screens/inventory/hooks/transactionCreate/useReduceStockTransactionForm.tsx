import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import i18n from '@/i18n'
import { StockItem } from '@/models/shared/Material'
import {
  CreateTransactionForm,
  CreateTransactionStock,
} from '@/models/transaction/TransactionCreate'
import { UseNavigationScreen } from '@/navigators'
import {
  setMaterial,
  setTransaction,
} from '@/services/features/transaction.slice'
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
  findNextMaterial,
  getDefaultValue,
  getValidTransaction,
} from '../../helpers/TransactionHelpers'
import { getTrxValidationSchema } from '../../schema/TransactionCreateSchema'

function useReduceStockTransactionForm(stockMaterial: StockItem) {
  const dispatch = useAppDispatch()
  const { trxMaterials } = useAppSelector(trxState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { transactions } = useAppSelector(trxState)

  const isBatch = !!stockMaterial.material.is_managed_in_batch
  const stockDetail = stockMaterial.details[0]

  const trxReduceStocks = useMemo(
    () =>
      createTransactionStock(
        stockDetail?.stocks || [],
        transactions,
        stockMaterial.material
      ),
    [stockDetail?.stocks, stockMaterial.material, transactions]
  )

  const methods = useForm<CreateTransactionForm>({
    defaultValues: getDefaultValue(trxReduceStocks, isBatch),
    mode: 'onChange',
    resolver: yupResolver(
      getTrxValidationSchema(TRANSACTION_TYPE.REDUCE_STOCK)
    ),
  })
  const {
    watch,
    formState: { errors },
  } = methods
  const formReduceStock = watch()
  const hasErrors = Object.keys(errors).length > 0

  const navigation = useNavigation<UseNavigationScreen>()
  const nextMaterial = findNextMaterial(trxMaterials, stockMaterial)

  const getAllTransaction = () => [
    ...formReduceStock.activeBatch,
    ...formReduceStock.expiredBatch,
  ]

  const handleTransactionUpdate = (transactions: CreateTransactionStock[]) => {
    const validTrx = getValidTransaction(transactions)
    if (selectedWorkspace && !hasErrors && validTrx.length > 0) {
      dispatch(
        setTransaction({
          trxTypeId: TRANSACTION_TYPE.REDUCE_STOCK,
          programId: selectedWorkspace.id,
          transactions: validTrx,
        })
      )
      return true
    }
    return false
  }

  const navigateToNextMaterial = async () => {
    if (!nextMaterial) return
    handleTransactionUpdate(getAllTransaction())

    dispatch(setMaterial(nextMaterial))

    const destination = nextMaterial.material.is_managed_in_batch
      ? 'TransactionReduceStockBatch'
      : 'TransactionReduceStock'

    navigation.replace(destination, { stock: nextMaterial })
  }

  const handleSaveReduceStockTransaction = () => {
    const isSuccessUpdateReduceStockTrx =
      handleTransactionUpdate(getAllTransaction())

    if (isSuccessUpdateReduceStockTrx) {
      navigation.pop()
    } else {
      showError(i18n.t('error.complete_data'))
    }
  }

  return {
    methods,
    isNextMaterialExist: !!nextMaterial,
    isDisableNextButton: hasErrors,
    handleSubmit: handleSaveReduceStockTransaction,
    navigateToNextMaterial,
  }
}

export default useReduceStockTransactionForm
