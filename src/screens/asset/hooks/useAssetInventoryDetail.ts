import { useGetAssetInventoryDetailQuery } from '@/services/apis/asset-inventory.api'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface UseAssetInventoryDetailParams {
  id: string | number
}

export const useAssetInventoryDetail = ({
  id,
}: UseAssetInventoryDetailParams) => {
  const {
    data: assetDetail,
    refetch: refetchDetail,
    isLoading,
    isFetching,
    isError,
  } = useGetAssetInventoryDetailQuery({ id })

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return convertString(dateString, SHORT_DATE_FORMAT).toUpperCase()
  }

  const formatContactPerson = (
    name?: string | null,
    number?: string | null
  ): string => {
    if (!name && !number) return '-'

    if (name && !number) return name

    if (!name && number) return number

    return `${name} \n(${number})`
  }

  return {
    assetDetail,
    refetchDetail,
    isLoadingDetail: isFetching || isLoading,
    isError,
    formatDate,
    formatContactPerson,
  }
}
