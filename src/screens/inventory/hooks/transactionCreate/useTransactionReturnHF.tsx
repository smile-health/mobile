import { useCallback, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import {
  TransactionConsumption,
  TransactionConsumptionFilter,
} from '@/models/transaction/Transaction'
import { useGetTransactionConsumptionQuery } from '@/services/apis/transaction.api'
import { setTransaction } from '@/services/features/transaction.slice'
import {
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { DATE_FILTER_FORMAT, TRANSACTION_TYPE } from '@/utils/Constants'
import { convertString, getDaysBefore } from '@/utils/DateFormatUtils'
import { trxConsumptionToCreateTransaction } from '../../helpers/ReturnHFHelpers'
import {
  ReturnHealthFacilitySchema,
  ReturnHFForm,
} from '../../schema/ReturnHealthFacilitySchema'

const initialDate = {
  start: getDaysBefore(7),
  end: convertString(Date.now(), DATE_FILTER_FORMAT),
}

function useReturnHFTransaction() {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, trxMaterial, customer, transactions } =
    useAppSelector(trxState)

  const isCustomerOpenVial = !!customer?.entity_tag.is_open_vial
  const isOpenVial = isCustomerOpenVial && !!trxMaterial.material.is_open_vial

  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<TransactionConsumptionFilter>({
    start_date: initialDate.start,
    end_date: initialDate.end,
  })
  const [savedTrxIds, setSavedTrxIds] = useState<number[]>(
    transactions
      .filter((t) => t.material_id === trxMaterial.material.id)
      .map((t) => t.transaction_id ?? 0)
  )
  const [currentTrxIds, setCurrentTrxIds] = useState<number[]>([])

  const methods = useForm<ReturnHFForm>({
    resolver: yupResolver(ReturnHealthFacilitySchema()),
    mode: 'onChange',
    defaultValues: {
      selectedTrx: transactions.filter(
        (t) => t.material_id === trxMaterial.material.id
      ),
    },
  })

  const {
    watch,
    setValue,
    formState: { errors },
  } = methods
  const { selectedTrx } = watch()

  const hasErrors = Object.keys(errors).length > 0
  const isDisableSave = selectedTrx.some((t) => t.change_qty === 0) || hasErrors

  const navigation = useNavigation()

  const { data, refetch, isLoading, isFetching } =
    useGetTransactionConsumptionQuery(
      {
        page,
        entity_id: selectedWorkspace?.entity_id,
        activity_id: activity.id,
        material_id: trxMaterial.material.id,
        customer_id: customer?.id,
        ...filter,
      },
      { refetchOnMountOrArgChange: true }
    )

  const filteredList = useMemo(
    () => (data?.data ?? []).filter((trx) => !savedTrxIds.includes(trx.id)),
    [data?.data, savedTrxIds]
  )

  const handleRefreshList = () => {
    refetch()
  }

  const handleApplyFilter = (data: TransactionConsumptionFilter) => {
    setPage(1)
    setFilter(data)
  }

  const handleLoadMore = () => {
    if (!isFetching && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }

  const handleSelectItem = useCallback(
    (item: TransactionConsumption) => {
      const isExistSaved = savedTrxIds.includes(item.id)
      const isExistCurrent = currentTrxIds.includes(item.id)
      if (isExistSaved) {
        setSavedTrxIds((prev) => prev.filter((id) => id !== item.id))
      }

      if (isExistCurrent) {
        setCurrentTrxIds((prev) => prev.filter((id) => id !== item.id))
      }
      if (isExistCurrent || isExistSaved) {
        setValue(
          'selectedTrx',
          [...selectedTrx].filter((trx) => trx.transaction_id !== item.id)
        )
      } else {
        setCurrentTrxIds((prev) => [...prev, item.id])
        setValue('selectedTrx', [
          ...selectedTrx,
          trxConsumptionToCreateTransaction(item, isOpenVial),
        ])
      }
    },
    [currentTrxIds, isOpenVial, savedTrxIds, selectedTrx, setValue]
  )

  const handleDeleteItem = useCallback(
    (transactionID?: number) => {
      setSavedTrxIds((prev) => prev.filter((id) => id !== transactionID))
      setCurrentTrxIds((prev) => prev.filter((id) => id !== transactionID))

      setValue(
        'selectedTrx',
        [...selectedTrx].filter((trx) => trx.transaction_id !== transactionID)
      )
    },
    [selectedTrx, setValue]
  )

  const checkIsSelected = useCallback(
    (transactionID: number) =>
      selectedTrx.map((t) => t.transaction_id).includes(transactionID),
    [selectedTrx]
  )

  const handleSubmit = () => {
    if (!selectedWorkspace?.id) return
    dispatch(
      setTransaction({
        programId: selectedWorkspace.id,
        trxTypeId: TRANSACTION_TYPE.RETURN,
        transactions: selectedTrx,
      })
    )
    navigation.navigate('TransactionMaterialSelect')
  }

  return {
    savedTrxIds,
    currentTrxIds,
    methods,
    filter,
    activity,
    isDisableSave,
    transactionList: filteredList,
    shouldShowLoading: isLoading || isFetching,
    handleRefreshList,
    handleApplyFilter,
    handleLoadMore,
    handleSelectItem,
    handleDeleteItem,
    checkIsSelected,
    handleSubmit,
  }
}

export default useReturnHFTransaction
