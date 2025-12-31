import React from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { setDraft } from '@/services/features/order.slice'
import {
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'
import { MaterialDetailScreenBase } from '../../shared/MaterialDetailScreenBase'

interface Props extends AppStackScreenProps<'RegularMaterialDetail'> {}

export default function RegularTrademarkMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const dispatch = useAppDispatch()
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const programId = selectedWorkspace?.id

  const { data, parentMaterial } = route.params

  const { t } = useLanguage()

  return (
    <MaterialDetailScreenBase
      orderType={ORDER_KEY.REGULAR}
      data={data}
      navigation={navigation}
      title={t('order.add_order')}
      parentMaterial={parentMaterial}
      isTrademark={true}
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
