import { useCallback } from 'react'
import { BaseEntity, ENTITY_TYPE } from '@/models'
import { getEntities, setReceiver } from '@/services/features'
import { disposalState, useAppDispatch, useAppSelector } from '@/services/store'
import { navigate } from '@/utils/NavigationUtils'

export default function useDisposalReceiver() {
  const dispatch = useAppDispatch()
  const { activity } = useAppSelector(disposalState)
  const data = useAppSelector((state) => getEntities(state, ENTITY_TYPE.VENDOR))

  const handleClearReceiver = useCallback(() => {
    dispatch(setReceiver())
  }, [dispatch])

  const handlePressReceiver = useCallback(
    (data: BaseEntity) => {
      dispatch(setReceiver(data))
      navigate('ShipmentDisposalMaterial')
    },
    [dispatch]
  )
  return { activity, data, handleClearReceiver, handlePressReceiver }
}
