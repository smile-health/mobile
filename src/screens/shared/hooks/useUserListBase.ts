import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BaseEntity } from '@/models'
import { PAGE_SIZE } from '@/utils/Constants'
import { useDebounce } from '@/utils/hooks/useDebounce'

interface UseUserListBaseConfig {
  entity: BaseEntity
  debounceDelay?: number
  useQuery: any // RTK Query hook - flexible type to handle different query hooks
  queryOptions?: any
}

export default function useUserListBase({
  entity,
  debounceDelay = 1000,
  useQuery,
  queryOptions = { refetchOnMountOrArgChange: true },
}: UseUserListBaseConfig) {
  const [page, setPage] = useState(1)
  const { control, watch, setValue } = useForm({
    defaultValues: { name: '' },
  })
  const searchName = watch('name')
  const debouncedSearch = useDebounce(searchName, debounceDelay)

  const { data, isLoading, isFetching } = useQuery(
    {
      page,
      paginate: PAGE_SIZE,
      entity_id: entity?.id || 0,
      keyword: debouncedSearch || undefined,
    },
    queryOptions
  )

  const handleLoadMore = useCallback(() => {
    if ((!isFetching || !isLoading) && data && data.page < data.total_page) {
      setPage((prev) => prev + 1)
    }
  }, [isFetching, isLoading, data])

  const handleSearchUser = useCallback(
    (value: string) => {
      setValue('name', value)
      setPage(1)
    },
    [setValue]
  )

  return {
    entity,
    control,
    userList: data?.data ?? [],
    totalUser: data?.total_item ?? 0,
    isLoadingUser: (isFetching || isLoading) && page === 1,
    isLoadMore: (isFetching || isLoading) && page !== 1,
    handleLoadMore,
    handleSearchUser,
  }
}
