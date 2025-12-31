import React, { useCallback, useMemo } from 'react'
import { View, Text, FlatList } from 'react-native'
import { ParseKeys } from 'i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { useCreateOrderItemStocksMutation } from '@/services/apis'
import {
  resetDraft,
  resetOrderItemDraft,
} from '@/services/features/order.slice'
import {
  useAppSelector,
  authState,
  useAppDispatch,
  orderState,
  workspaceState,
} from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, showSuccess } from '@/utils/CommonUtils'
import { ORDER_KEY, ORDER_TYPE } from '@/utils/Constants'
import { showFormattedError } from '@/utils/helpers/ErrorHelpers'
import useProgramId from '@/utils/hooks/useProgramId'
import { OrderReviewItem } from '../../component/OrderReviewItem'
import { navigateToOrderDetail } from '../../helpers/NavigationHelpers'
import { useReasonOptions } from '../../hooks/useReasonOptions'

interface Props extends AppStackScreenProps<'OrderItemReview'> {}

export default function OrderItemReviewScreen({ route }: Props) {
  const { activityName, orderId, orderType } = route.params

  const { user } = useAppSelector(authState)
  const { orderItemDraft } = useAppSelector(orderState)
  const { drafts } = useAppSelector(orderState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { reasonRegularOptions, reasonRelocationOptions } = useReasonOptions()
  const reasonOptions =
    orderType === ORDER_TYPE.RELOCATION
      ? reasonRelocationOptions
      : reasonRegularOptions
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled

  const programId = useProgramId()
  const orderDraft = useMemo(
    () => (programId ? (drafts.regular?.[programId] ?? []) : []),
    [drafts.regular, programId]
  )

  const transformChild = (child) => ({
    material_id: child.material_id,
    material_name: child.material_name,
    ordered_qty: child.ordered_qty,
  })

  const ordersToUse = useMemo(() => {
    if (!isHierarchy) return orderItemDraft

    return orderItemDraft.map((item) => {
      const match = orderDraft.find(
        (draft) => draft.material_id === item.material_id
      )
      return {
        ...item,
        children: match?.material_hierarchy?.map(transformChild) || [],
      }
    })
  }, [isHierarchy, orderItemDraft, orderDraft])

  const dispatch = useAppDispatch()

  const [createOrderItemStocks, { isLoading }] =
    useCreateOrderItemStocksMutation()

  const { t } = useLanguage()

  useToolbar({ title: t('title.review_order') })
  const onPressProcessAddItem = async () => {
    try {
      const payload = {
        id: orderId,
        order_items: ordersToUse,
      }
      const response = await createOrderItemStocks(payload).unwrap()

      if (response?.error) {
        showFormattedError(response?.error)
        return
      }
      showSuccess(
        t('order.success_add_item_order'),
        'snackbar-success-add-item-order'
      )
      navigateToOrderDetail(Number(orderId))
      dispatch(resetOrderItemDraft())
      dispatch(resetDraft({ type: ORDER_KEY.REGULAR, programId }))
    } catch (error) {
      showFormattedError(error)
    }
  }

  const renderItem = useCallback(
    ({ item }) => (
      <OrderReviewItem item={item} isReason dataReason={reasonOptions} />
    ),
    [reasonOptions]
  )

  return (
    <View className='flex-1 bg-paleGrey'>
      <HeaderMaterial
        items={[
          { label: t('label.activity'), value: activityName },
          { label: t('label.vendor'), value: user?.entity?.name },
        ]}
      />
      <View className='bg-white py-4 flex-1'>
        <View className='flex-row bg-lightestBlue p-2 mx-4 rounded-sm border-bluePrimary border gap-2'>
          <Icons.IcInfo height={16} width={16} fill={colors.marine} />
          <Text className={AppStyles.textRegularSmall}>
            {t('order.banner.order_add_item_confirmation')}
          </Text>
        </View>
        <View className={cn(AppStyles.rowBetween, 'mx-4 my-2')}>
          <Text className={AppStyles.textBold}>
            {t('label.list_added_item')}
          </Text>
          <Text className={AppStyles.textRegularSmall}>
            {t('label.total')}{' '}
            <Text className={cn(AppStyles.textBoldSmall, 'text-medium-gray')}>
              {t('label.count_items', { count: ordersToUse.length })}
            </Text>
          </Text>
        </View>
        <FlatList
          data={ordersToUse}
          keyExtractor={(index) => index.toString()}
          renderItem={renderItem}
        />
      </View>
      <View className='bg-lightBlueGray w-full h-2' />
      <View className='p-4 bg-white mt-auto border-t border-quillGrey'>
        <Button
          preset='filled'
          containerClassName='bg-main gap-x-2'
          text={t('button.process_add_item')}
          LeftIcon={Icons.IcArrowForward}
          onPress={onPressProcessAddItem}
          {...getTestID('btn-process-add-item')}
        />
      </View>
      <LoadingDialog
        modalVisible={isLoading}
        title={t('dialog.hang_tight') as ParseKeys}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-process-order'
      />
    </View>
  )
}
