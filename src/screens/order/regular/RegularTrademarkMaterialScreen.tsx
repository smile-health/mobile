import React from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import MaterialItem, { MaterialItemProps } from '@/components/list/MaterialItem'
import MaterialList from '@/components/list/MaterialList'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { removeAllChildDraft } from '@/services/features/order.slice'
import {
  activityState,
  orderState,
  useAppDispatch,
  useAppSelector,
  vendorState,
} from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'

interface Props extends AppStackScreenProps<'RegularTrademarkMaterialScreen'> {}

export default function RegularTrademarkMaterialScreen({
  route,
  navigation,
}: Props) {
  const { t } = useLanguage()

  const dispatch = useAppDispatch()

  const [dialogVisible, setDialogVisible] = React.useState(false)

  const { activeActivity } = useAppSelector(activityState)
  const { drafts } = useAppSelector(orderState)
  const { vendor } = useAppSelector(vendorState)
  const programId = useProgramId()

  const orderDraft = programId ? (drafts.regular?.[programId] ?? []) : []

  const { data } = route.params
  const hasOrderHierarchy = orderDraft.some(
    (item) =>
      Array.isArray(item.material_hierarchy) &&
      item.material_hierarchy.length > 0
  )

  useToolbar({ title: t('button.add_item') })

  const handlePressTrademarkMaterial = (detail) => {
    navigation.navigate('RegularTrademarkMaterialDetail', {
      data: detail,
      parentMaterial: data,
    })
  }

  const toggleDialog = () => {
    setDialogVisible(!dialogVisible)
  }

  const handleDeleteAll = () => {
    dispatch(
      removeAllChildDraft({
        type: ORDER_KEY.REGULAR,
        parentMaterialId: data.id,
        programId,
      })
    )
    setDialogVisible(false)
  }

  const handleSave = () => {
    navigation.navigate('RegularMaterialDetail', { data, editableQty: false })
  }

  return (
    <View className='bg-white flex-1'>
      <HeaderMaterial
        items={[
          { label: t('label.activity'), value: activeActivity?.name },
          { label: t('label.vendor'), value: vendor?.name },
        ]}
      />
      <ActiveMaterialHeader
        name={data.name}
        updatedAt={data.updated_at}
        qty={data.total_qty}
        min={data.min}
        max={data.max}
      />
      <MaterialList
        data={data.material_hierarchy ?? []}
        title={t('label.trademark_material_list')}
        onPressMaterial={handlePressTrademarkMaterial}
        orders={orderDraft}
      />

      {hasOrderHierarchy && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.save'),
            onPress: handleSave,
            LeftIcon: Icons.IcArrowForward,
            testID: 'btn-navigate-review-order',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            onPress: toggleDialog,
            LeftIcon: Icons.IcDelete,
            testID: 'btn-delete-all-order',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: dialogVisible,
            onConfirm: handleDeleteAll,
            onCancel: toggleDialog,
          }}
        />
      )}
    </View>
  )
}

export function ActiveMaterialHeader(props: Readonly<MaterialItemProps>) {
  const { t } = useLanguage()
  return (
    <View className='p-4 bg-lightGrey gap-y-1'>
      <Text className={AppStyles.textBold}>
        {t('label.active_ingredient_material')}
      </Text>
      <MaterialItem withUpdateLabel {...props} />
    </View>
  )
}
