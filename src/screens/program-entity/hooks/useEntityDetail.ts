import { BaseEntity } from '@/models'
import { useGetEntityUserQuery } from '@/services/apis/entity.api'
import useUserListBase from '../../shared/hooks/useUserListBase'

export default function useEntityDetail(entity: BaseEntity) {
  return useUserListBase({
    entity,
    debounceDelay: 1000,
    useQuery: useGetEntityUserQuery,
    queryOptions: { refetchOnMountOrArgChange: true },
  })
}
