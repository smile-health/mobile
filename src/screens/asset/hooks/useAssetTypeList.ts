/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo, useState } from 'react'
import { IOptions } from '@/models/Common'
import { useGetAssetTypeQuery } from '@/services/apis/asset.api'

type Props = {
  anotherOption: IOptions
}

export const useAssetTypeList = ({ anotherOption }: Props) => {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const {
    data: assetTypeData,
    isLoading,
    isFetching,
  } = useGetAssetTypeQuery(
    { page, paginate: 25, keyword, status: 1 },
    { refetchOnMountOrArgChange: true }
  )

  // Determine if there's more data to load
  const hasMoreData = assetTypeData ? page < assetTypeData.total_page : false

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

  const assetTypeOptions: IOptions[] = useMemo(() => {
    return assetTypeData
      ? [
          anotherOption,
          ...assetTypeData.data.map((type) => ({
            label: type.name,
            value: type.id,
          })),
        ]
      : []
  }, [assetTypeData?.data, anotherOption])

  return { assetTypeOptions, loadMore, isFetching, handleSearch }
}
