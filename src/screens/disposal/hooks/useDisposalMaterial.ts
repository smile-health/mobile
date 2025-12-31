import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DisposalStockItemResponse } from '@/models/disposal/DisposalStock'
import { useGetDisposalStockQuery } from '@/services/apis'
import { clearDisposal, setMaterial } from '@/services/features/disposal.slice'
import {
  disposalState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { MATERIAL_LEVEL_TYPE, PAGE_SIZE } from '@/utils/Constants'
import { useDebounce } from '@/utils/hooks/useDebounce'
import {
  DISPOSAL_SHIPMENT_METHOD,
  DISPOSAL_TYPE,
  DisposalType,
} from '../disposal-constant'

export default function useDisposalMaterial(
  type: DisposalType = DISPOSAL_TYPE.SELF
) {
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, method, disposal } = useAppSelector(disposalState)
  const dispatch = useAppDispatch()

  const [page, setPage] = useState(1)

  const { control, watch } = useForm<{ name: string }>()
  const searchName = watch('name')
  const keyword = useDebounce(searchName, 500)

  const queryParams = {
    page,
    paginate: PAGE_SIZE,
    entity_id: selectedWorkspace?.entity_id,
    activity_id: activity.id,
    flow_id: type === DISPOSAL_TYPE.SELF ? method.id : DISPOSAL_SHIPMENT_METHOD,
    material_level_id: MATERIAL_LEVEL_TYPE.KFA_93,
    only_have_qty: 1,
    ...(keyword && { keyword }),
  }

  const { data, isLoading, isFetching, refetch } = useGetDisposalStockQuery(
    queryParams,
    { refetchOnMountOrArgChange: true }
  )

  const hasMoreData = data ? page < data.total_page : false
  const totalItems = data?.total_item ?? 0

  const filteredList = useMemo(() => {
    if (isLoading || (isFetching && !!keyword)) return []
    return data?.data || []
  }, [data?.data, isFetching, isLoading, keyword])

  const shouldShowFooter = useMemo(
    () =>
      Object.values(disposal).some((item) =>
        item.disposal.some(
          (iitem) => iitem.discard.length > 0 || iitem.received.length > 0
        )
      ),
    [disposal]
  )

  const setDisposalMaterial = useCallback(
    (material: DisposalStockItemResponse) => {
      dispatch(setMaterial(material))
    },
    [dispatch]
  )

  const deleteAllDisposal = () => {
    dispatch(clearDisposal())
  }

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isFetching && hasMoreData) {
      setPage((prevPage) => {
        const newPage = prevPage + 1
        return newPage
      })
    }
  }, [hasMoreData, isFetching, isLoading])

  return {
    activity,
    data: filteredList,
    totalItems,
    disposal,
    isLoading,
    isFetching,
    control,
    shouldShowFooter,
    refetch,
    handleLoadMore,
    setDisposalMaterial,
    deleteAllDisposal,
  }
}
