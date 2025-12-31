import { useMemo, useState } from 'react'
import { useGetReconciliationDetailQuery } from '@/services/apis/reconciliation.api'

export default function useReconciliationDetail(id?: number, itemId?: number) {
  const [openBottomSheet, setOpenBottomSheet] = useState(false)

  const { data, isLoading, isFetching } = useGetReconciliationDetailQuery(id, {
    skip: !id || !openBottomSheet,
  })

  const categoryDetail = useMemo(() => {
    return data?.items?.find((item) => item.id === itemId)
  }, [data?.items, itemId])

  const toggleBottomSheet = () => setOpenBottomSheet((prev) => !prev)

  return {
    data,
    detail: categoryDetail,
    isLoading: isLoading || isFetching,
    openBottomSheet,
    toggleBottomSheet,
  }
}
