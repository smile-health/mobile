import React from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { setOrderItemDraft } from '@/services/features/order.slice'
import { useAppDispatch } from '@/services/store'
import { ORDER_KEY, ORDER_REASON_TYPE, ORDER_TYPE } from '@/utils/Constants'
import { MaterialDetailScreenBase } from '../../../shared/MaterialDetailScreenBase'

interface Props extends AppStackScreenProps<'OrderItemMaterialDetail'> {}

export default function OrderItemMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const dispatch = useAppDispatch()
  const { orderType, data, editableQty, activityName } = route.params!

  const orderTypeNames =
    orderType === ORDER_TYPE.RELOCATION
      ? ORDER_KEY.RELOCATION
      : ORDER_KEY.REGULAR
  const orderReasonTypeNames =
    orderType === ORDER_TYPE.RELOCATION
      ? ORDER_REASON_TYPE.RELOCATION
      : ORDER_REASON_TYPE.REQUEST

  const { t } = useLanguage()

  return (
    <MaterialDetailScreenBase
      title={t('order.add_order')}
      data={data}
      editableQty={editableQty}
      activityName={activityName}
      navigation={navigation}
      isOrderItem={true}
      orderType={orderTypeNames}
      orderReasonType={orderReasonTypeNames}
      dispatchAction={(payload) =>
        dispatch(setOrderItemDraft({ ...payload, children: [] }))
      }
    />
  )
}
