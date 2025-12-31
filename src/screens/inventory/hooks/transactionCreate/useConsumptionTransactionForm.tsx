import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import i18n from '@/i18n'
import { StockDetail, StockItem } from '@/models/shared/Material'
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
import { getTrxStockWithOtherActivityStock } from '../../helpers/ConsumptionHelpers'
import {
  findNextMaterial,
  getDefaultValue,
  getValidTransaction,
} from '../../helpers/TransactionHelpers'
import { getTrxValidationSchema } from '../../schema/TransactionCreateSchema'

function useConsumptionTransactionForm(
  stockMaterial: StockItem,
  stockDetails: StockDetail[] = []
) {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { trxMaterials, activity, customer, transactions } =
    useAppSelector(trxState)

  const isBatch = !!stockMaterial.material.is_managed_in_batch
  const isCustomerOpenVial = !!customer?.entity_tag.is_open_vial
  const isOpenVial = isCustomerOpenVial && !!stockMaterial.material.is_open_vial

  const trxConsumptionStocks = useMemo(() => {
    return getTrxStockWithOtherActivityStock(
      stockMaterial,
      transactions,
      stockDetails,
      activity.id,
      isOpenVial
    )
  }, [stockMaterial, transactions, stockDetails, activity.id, isOpenVial])

  const methods = useForm<CreateTransactionForm>({
    defaultValues: getDefaultValue(trxConsumptionStocks, isBatch),
    mode: 'onChange',
    resolver: yupResolver(getTrxValidationSchema(TRANSACTION_TYPE.CONSUMPTION)),
  })

  const {
    watch,
    formState: { errors },
  } = methods
  const formConsumption = watch()

  const navigation = useNavigation<UseNavigationScreen>()
  const nextMaterial = findNextMaterial(trxMaterials, stockMaterial)
  const hasErrors = Object.keys(errors).length > 0

  const getAllTransaction = () => [
    ...formConsumption.activeBatch,
    ...formConsumption.expiredBatch,
  ]

  const handleTransactionUpdate = (transactions: CreateTransactionStock[]) => {
    const validTrx = getValidTransaction(transactions)
    if (selectedWorkspace && !hasErrors && validTrx.length > 0) {
      dispatch(
        setTransaction({
          trxTypeId: TRANSACTION_TYPE.CONSUMPTION,
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
      ? 'TransactionConsumptionBatch'
      : 'TransactionConsumption'

    navigation.replace(destination, { stock: nextMaterial })
  }

  const handleSaveConsumptionTransaction = () => {
    const isSuccessUpdateConsumptionTrx =
      handleTransactionUpdate(getAllTransaction())

    if (isSuccessUpdateConsumptionTrx) {
      navigation.pop()
    } else {
      showError(i18n.t('error.complete_data'))
    }
  }

  return {
    isOpenVial,
    activity,
    customer,
    methods,
    isDisableNextButton: hasErrors,
    isNextMaterialExist: !!nextMaterial,
    transactions,
    handleSubmit: handleSaveConsumptionTransaction,
    navigateToNextMaterial,
  }
}

export default useConsumptionTransactionForm
