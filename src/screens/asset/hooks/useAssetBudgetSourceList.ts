/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo, useState } from 'react'
import { IOptions } from '@/models/Common'
import { useGetAssetBudgetSourceQuery } from '@/services/apis/asset.api'

type Props = {
  anotherOption: IOptions
}

export const useAssetBudgetSourceList = ({ anotherOption }: Props) => {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const {
    data: budgetSourceData,
    isLoading,
    isFetching,
  } = useGetAssetBudgetSourceQuery(
    { page, paginate: 25, keyword, status: 1 },
    { refetchOnMountOrArgChange: true }
  )

  // Determine if there's more data to load
  const hasMoreData = budgetSourceData
    ? page < budgetSourceData.total_page
    : false

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoading && !isFetching && hasMoreData) {
      setPage((prevPage) => prevPage + 1)
    }
  }, [isLoading, isFetching, hasMoreData])

  // Handle search text change
  const handleSearch = useCallback((text: string) => {
    setKeyword(text)
    setPage(1)
  }, [])

  const budgetSourceOptions: IOptions[] = useMemo(() => {
    return budgetSourceData
      ? [
          anotherOption,
          ...budgetSourceData.data.map((source) => ({
            label: source.name,
            value: source.id,
          })),
        ]
      : []
  }, [budgetSourceData?.data, anotherOption])

  return { budgetSourceOptions, loadMore, isFetching, handleSearch }
}
