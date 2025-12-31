import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { BaseEntity } from '@/models'
import { useGetCVRelocationQuery } from '@/services/apis'
import { setVendor } from '@/services/features/relocation.slice'
import {
  relocationState,
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'

function useRelocationVendorList() {
  const navigation = useNavigation()

  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { activity, vendor, relocations } = useAppSelector(relocationState)
  const hasDataRelocation = relocations.length > 0

  const {
    data: entitites = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetCVRelocationQuery()

  const [isOpenModalExist, setIsOpenModalExist] = useState(false)

  const closeModalExist = () => {
    setIsOpenModalExist(false)
  }

  const handleSelectVendor = async (item: BaseEntity) => {
    if (!selectedWorkspace?.id) return
    if (vendor?.id !== item.id && hasDataRelocation) {
      setIsOpenModalExist(true)
      return
    }

    dispatch(setVendor(item))
    navigation.navigate('RelocationMaterialSelect')
  }

  return {
    activity,
    entitites,
    vendorRelocation: hasDataRelocation ? vendor : undefined,
    handleSelectVendor,
    isOpenModalExist,
    closeModalExist,
    isLoading: isLoading || isFetching,
    refetchVendorList: refetch,
  }
}

export default useRelocationVendorList
