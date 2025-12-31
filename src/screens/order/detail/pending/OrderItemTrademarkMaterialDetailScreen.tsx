import React from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { MaterialDetailScreenBase } from '@/screens/shared/MaterialDetailScreenBase'
import { setDraft } from '@/services/features/order.slice'
import {
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'

interface Props
  extends AppStackScreenProps<'OrderItemTrademarkMaterialDetail'> {}

export default function OrderItemTrademarkMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const { data, parentMaterial } = route.params

  const { t } = useLanguage()

  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const programId = selectedWorkspace?.id

  return (
    <MaterialDetailScreenBase
      orderType={ORDER_KEY.REGULAR}
      isTrademark={true}
      parentMaterial={parentMaterial}
      data={data}
      title={t('order.add_order')}
      navigation={navigation}
      dispatchAction={(item) =>
        dispatch(
          setDraft({
            type: ORDER_KEY.REGULAR,
            item,
            programId,
            parentMaterial,
          })
        )
      }
    />
  )
}
