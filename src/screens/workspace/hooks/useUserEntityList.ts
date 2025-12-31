import { BaseEntity } from '@/models'
import { useGetUsersQuery } from '@/services/apis'
import { authState, useAppSelector } from '@/services/store'
import useUserListBase from '../../shared/hooks/useUserListBase'

export default function useUserEntityList() {
  const { user } = useAppSelector(authState)
  const entity = user?.entity as unknown as BaseEntity

  return useUserListBase({
    entity,
    debounceDelay: 500,
    useQuery: useGetUsersQuery,
    queryOptions: { refetchOnMountOrArgChange: true },
  })
}
