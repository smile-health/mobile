import { useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  TransactionDiscard,
  TransactionDiscardFilter,
} from '@/models/transaction/Transaction'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { useGetTransactionDiscardsQuery } from '@/services/apis/transaction.api'
import { setTransaction } from '@/services/features/transaction.slice'
import {
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { TRANSACTION_TYPE } from '@/utils/Constants'
import {
  trxDiscardToCreateTransaction,
  updateExistingTransaction,
  updateSelectedTransactions,
} from '../../helpers/CancelDiscardHelpers'

function useCancelDiscardTransaction() {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, trxMaterial, transactions } = useAppSelector(trxState)

  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<TransactionDiscardFilter | null>(null)
  const [isOpenFilter, setIsOpenFilter] = useState(true)
  const [selectedTrx, setSelectedTrx] = useState<CreateTransaction[]>(
    transactions.filter((t) => t.material_id === trxMaterial.material.id)
  )

  const navigation = useNavigation()

  const { data, refetch, isLoading, isFetching } =
    useGetTransactionDiscardsQuery(
      {
        page,
        entity_id: selectedWorkspace?.entity_id,
        activity_id: activity.id,
        material_id: trxMaterial.material.id,
        ...filter,
      },
      { skip: !filter }
    )

  const handleRefreshList = () => {
    refetch()
  }

  const handleResetFilter = () => {
    setPage(1)
    setFilter(null)
    setIsOpenFilter(true)
  }

  const handleApplyFilter = (data: TransactionDiscardFilter) => {
    setPage(1)
    setFilter(data)
    setIsOpenFilter(false)
  }

  const handleToggleFilter = () => {
    setIsOpenFilter((prev) => !prev)
  }

  const handleLoadMore = () => {
    if (!isFetching && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }

  const handleSelectItem = useCallback(
    (item: TransactionDiscard) => {
      const existingTrx = selectedTrx.find((t) => t.stock_id === item.stock_id)

      if (!existingTrx) {
        const newTrx = trxDiscardToCreateTransaction(item)
        setSelectedTrx((val) => [...val, newTrx])
        return
      }

      const hasTransactionId = (existingTrx.transaction_ids ?? []).includes(
        item.id
      )
      const updatedTrx = updateExistingTransaction(
        existingTrx,
        item,
        hasTransactionId
      )

      const isEmptyIds = (updatedTrx.transaction_ids ?? []).length === 0
      setSelectedTrx((val) =>
        updateSelectedTransactions(val, updatedTrx, isEmptyIds)
      )
    },
    [selectedTrx]
  )

  const checkIsSelected = useCallback(
    (item: TransactionDiscard) => {
      const trx = selectedTrx.find((t) => t.stock_id === item.stock_id)
      return trx ? (trx.transaction_ids ?? []).includes(item.id) : false
    },
    [selectedTrx]
  )

  const handleSubmit = () => {
    if (!selectedWorkspace?.id) return
    dispatch(
      setTransaction({
        programId: selectedWorkspace.id,
        trxTypeId: TRANSACTION_TYPE.CANCEL_DISCARDS,
        transactions: selectedTrx,
      })
    )
    navigation.navigate('TransactionMaterialSelect')
  }

  return {
    isDisableSave: selectedTrx.length === 0,
    filter,
    isOpenFilter,
    transactionList: data?.data ?? [],
    shouldShowLoading: isLoading || isFetching,
    handleRefreshList,
    handleApplyFilter,
    handleResetFilter,
    handleLoadMore,
    handleToggleFilter,
    handleSelectItem,
    checkIsSelected,
    handleSubmit,
  }
}

export default useCancelDiscardTransaction
