/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo, useState } from 'react'
import { IOptions } from '@/models/Common'
import { useGetAssetManufactureQuery } from '@/services/apis/asset.api'

type Props = {
  anotherOption: IOptions
}

export const useManufactureList = ({ anotherOption }: Props) => {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const {
    data: manufactureData,
    isLoading,
    isFetching,
  } = useGetAssetManufactureQuery(
    { page, paginate: 100, keyword, status: 1 },
    { refetchOnMountOrArgChange: true }
  )

  // Determine if there's more data to load
  const hasMoreData = manufactureData
    ? page < manufactureData.total_page
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

  const manufacturerOptions: IOptions[] = useMemo(() => {
    return manufactureData
      ? [
          anotherOption,
          ...manufactureData.data.map((manufacture) => ({
            label: manufacture.name,
            value: manufacture.id,
          })),
        ]
      : []
  }, [manufactureData?.data, anotherOption])

  return { manufacturerOptions, loadMore, isFetching, handleSearch }
}
