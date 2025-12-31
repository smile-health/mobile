import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { TransferStockProgram } from '@/models/transaction/TransferStock'
import { useGetProgramsQuery } from '@/services/apis/transfer-stock.api'
import { setProgram } from '@/services/features/transaction.slice'
import {
  homeState,
  trxState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { navigate } from '@/utils/NavigationUtils'

export default function useTransferStockProgram() {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { activeMenu } = useAppSelector(homeState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { draftTrxTypeId, program } = useAppSelector(trxState)

  const [isOpenModalExistTrx, setIsOpenModalExistTrx] = useState(false)

  const { control, watch } = useForm({
    defaultValues: { name: '' },
  })
  const searchName = watch('name')

  const { data, refetch, isLoading, isFetching, isUninitialized } =
    useGetProgramsQuery({
      entity_id: selectedWorkspace?.entity_id,
    })

  const programList = useMemo(() => {
    if (!data) return []
    return data.filter((p) =>
      p.name.toLowerCase().includes(searchName.toLowerCase())
    )
  }, [data, searchName])

  const handleRefreshList = () => {
    if (!isUninitialized) {
      refetch()
    }
  }

  const closeModalExistTrx = () => {
    setIsOpenModalExistTrx(false)
  }

  const handleSelectProgram = useCallback(
    (item: TransferStockProgram) => {
      if (item.id !== program?.id && draftTrxTypeId) {
        setIsOpenModalExistTrx(true)
        return
      }
      dispatch(setProgram(item))
      navigate('TransferStockMaterial')
    },
    [dispatch, draftTrxTypeId, program?.id]
  )

  return {
    t,
    draftProgram: draftTrxTypeId && program ? program : undefined,
    control,
    shouldShowLoading: isLoading || isFetching,
    programList,
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    isOpenModalExistTrx,
    handleRefreshList,
    handleSelectProgram,
    closeModalExistTrx,
  }
}
