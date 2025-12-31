import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import MaterialList from '@/components/list/MaterialList'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { removeAllChildDraft } from '@/services/features/order.slice'
import { orderState, useAppDispatch, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import { ActiveMaterialHeader } from '../../regular/RegularTrademarkMaterialScreen'

interface Props extends AppStackScreenProps<'OrderItemTrademarkMaterial'> {}

export default function OrderItemTrademarkMaterialScreen({
  route,
  navigation,
}: Props) {
  const [dialogVisible, setDialogVisible] = useState(false)

  const { data } = route.params

  const { t } = useLanguage()
  const dispatch = useAppDispatch()

  const { drafts, detailOrder } = useAppSelector(orderState)

  const programId = useProgramId()

  const orderDraft = useMemo(
    () => (programId ? (drafts.regular?.[programId] ?? []) : []),
    [drafts.regular, programId]
  )

  useToolbar({ title: t('button.add_item') })

  const handlePressTrademarkMaterial = (detail) => {
    navigation.navigate('OrderItemTrademarkMaterialDetail', {
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
    navigation.navigate('OrderItemMaterialDetail', { data, editableQty: false })
  }

  const hasChildHierarchy = useMemo(
    () =>
      orderDraft.some(
        (item) =>
          Array.isArray(item.material_hierarchy) &&
          item.material_hierarchy.length > 0
      ),
    [orderDraft]
  )

  return (
    <View className='bg-white flex-1'>
      <HeaderMaterial
        items={[
          { label: t('label.activity'), value: detailOrder?.activity.name },
          { label: t('label.vendor'), value: detailOrder?.vendor?.name },
        ]}
      />
      <ActiveMaterialHeader
        min={data.min}
        max={data.max}
        name={data.name}
        updatedAt={data.updated_at}
        qty={data.total_qty}
      />
      <MaterialList
        title={t('label.trademark_material_list')}
        data={data.material_hierarchy ?? []}
        orders={orderDraft}
        onPressMaterial={handlePressTrademarkMaterial}
      />

      {hasChildHierarchy && (
        <View className='border-t gap-x-2 flex-row p-4 border-whiteTwo '>
          <Button
            preset='outlined'
            textClassName='text-main'
            containerClassName='flex-1 border-main gap-x-2'
            LeftIcon={Icons.IcDelete}
            leftIconColor={colors.main()}
            text={t('button.delete_all')}
            onPress={toggleDialog}
            {...getTestID('btn-delete-all-order')}
          />
          <Button
            preset='filled'
            textClassName={cn(AppStyles.textMedium, 'text-mainText ml-1')}
            text={t('button.save')}
            containerClassName='flex-1 bg-main gap-x-2'
            LeftIcon={Icons.IcArrowForward}
            onPress={handleSave}
            {...getTestID('btn-navigate-review-order')}
          />
        </View>
      )}
      <ConfirmationDialog
        message={t('dialog.delete_all')}
        modalVisible={dialogVisible}
        dismissDialog={toggleDialog}
        onCancel={toggleDialog}
        onConfirm={handleDeleteAll}
        cancelProps={{
          containerClassName: 'rounded-md border border-deepBlue px-3 py-2',
          textClassName: 'text-deepBlue px-2',
          ...getTestID('btn-cancel-delete-all'),
        }}
        confirmProps={{
          containerClassName: 'rounded-md border bg-deepBlue px-3 py-2',
          textClassName: 'text-white',
          ...getTestID('btn-confirm-delete-all'),
        }}
      />
    </View>
  )
}
