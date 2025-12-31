/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo, useState } from 'react'
import { IOptions } from '@/models/Common'
import { useGetAssetModelQuery } from '@/services/apis/asset.api'

type Props = {
  anotherOption: IOptions
}

export const useAssetModelList = ({ anotherOption }: Props) => {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const {
    data: assetModelData,
    isLoading,
    isFetching,
  } = useGetAssetModelQuery(
    { page, paginate: 25, keyword, status: 1 },
    { refetchOnMountOrArgChange: true }
  )

  // Determine if there's more data to load
  const hasMoreData = assetModelData ? page < assetModelData.total_page : false

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

  const assetModelOptions: IOptions[] = useMemo(() => {
    return assetModelData
      ? [
          anotherOption,
          ...assetModelData.data.map((model) => ({
            label: model.name,
            value: model.id,
          })),
        ]
      : []
  }, [assetModelData?.data, anotherOption])

  return { assetModelOptions, loadMore, isFetching, handleSearch }
}
