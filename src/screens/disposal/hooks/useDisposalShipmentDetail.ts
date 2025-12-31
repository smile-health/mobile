import { useCallback, useEffect, useMemo } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipmentDetailItem } from '@/models/disposal/DisposalShipmentList'
import { useGetDisposalShipmentDetailQuery } from '@/services/apis'
import { showError } from '@/utils/CommonUtils'
import { navigate } from '@/utils/NavigationUtils'
import { DISPOSAL_STATUS } from '../disposal-constant'

function useDisposalShipmentDetail({ id, isSender }) {
  const { t } = useLanguage()
  const { data, refetch, error, isLoading, isFetching } =
    useGetDisposalShipmentDetailQuery(id)

  const sections = useMemo(() => {
    if (!data) return []
    return [
      {
        key: 'items',
        title: 'label.item',
        data: data.disposal_items,
      },
      {
        key: 'comments',
        title: 'label.comment',
        data: data?.disposal_comments,
      },
    ]
  }, [data])

  const actionConfig = useMemo(() => {
    return {
      destination: isSender
        ? 'CancelDisposalShipment'
        : 'ReceiveDisposalShipment',
      buttonText: isSender
        ? 'disposal.cancel_shipment'
        : 'disposal.receive_shipment',
      buttonPreset: isSender ? 'outlined-primary' : 'filled',
      testID: isSender ? 'btn-cancel-shipment' : 'btn-receive-shipment',
      Icon: isSender ? undefined : Icons.IcCheck,
    } as const
  }, [isSender])

  const handleActionButton = () => {
    if (!data) return
    navigate(actionConfig.destination, { data })
  }

  const handlePressItem = useCallback(
    (item: IDisposalShipmentDetailItem) => {
      if (!data) return
      navigate('DisposalShipmentItemDetail', {
        item,
        activityName: data.activity.name,
        status: data.status,
      })
    },
    [data]
  )

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  useEffect(() => {
    if (error) {
      showError(t('error.load_data'))
    }
  }, [error, t])

  return {
    t,
    data,
    sections,
    actionConfig,
    isSender,
    isShipped: data?.status === DISPOSAL_STATUS.SHIPPED,
    isLoading: isLoading || isFetching,
    refetch,
    handleActionButton,
    handlePressItem,
  }
}

export default useDisposalShipmentDetail
