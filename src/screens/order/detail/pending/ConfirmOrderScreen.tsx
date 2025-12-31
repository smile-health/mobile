import React, { useCallback } from 'react'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { authState, useAppSelector } from '@/services/store'
import OrderEditList from '../../component/OrderEditList'
import OrderHeaderSection from '../../component/section/OrderHeaderSection'
import { useConfirmOrder } from '../../hooks/useConfirmOrder'
import { useReasonOptions } from '../../hooks/useReasonOptions'

interface Props extends AppStackScreenProps<'ConfirmOrder'> {}

export default function ConfirmOrderScreen({ route }: Props) {
  const { data, orderId } = route.params
  const { t } = useLanguage()
  const { user } = useAppSelector(authState)

  const {
    control,
    comment,
    errors,
    orderItems,
    isLoading,
    dialogOpen,
    toggleConfirmOrderDialog,
    updateItem,
    updateChildrenQty,
    onPressConfirmOrder,
  } = useConfirmOrder({ data, orderId, t })
  const { reasonRegularOptions } = useReasonOptions()

  useToolbar({
    title: `${t('button.confirm_order')}: ${orderId}`,
  })

  const renderHeader = useCallback(
    () => (
      <OrderHeaderSection
        t={t}
        headerItems={[
          { label: t('label.activity'), value: data?.activity?.name },
          { label: t('label.vendor'), value: user?.entity?.name },
        ]}
        activityName={user?.entity?.name}
        vendorName={data?.activity?.name}
        totalItem={data.order_items?.length}
        containerClassName='p-0 m-0'
        date={null}
        showDivider={false}
      />
    ),
    [t, user, data]
  )

  return (
    <OrderEditList
      type='confirm'
      data={orderItems}
      dataReason={reasonRegularOptions}
      comment={comment}
      updateQuantity={(index, field, value) => {
        updateItem(index, 'qty', value)
      }}
      updateReason={(index, field, value) => {
        updateItem(index, 'reason_id', value)
      }}
      updateChildQuantity={(parentIndex, childId, value) => {
        updateChildrenQty(parentIndex, childId, value)
      }}
      updateOtherReasonText={(index, _, value) => {
        updateItem(index, 'other_reason_text', value)
      }}
      t={t}
      control={control}
      errors={errors}
      isLoading={isLoading}
      modalVisible={dialogOpen}
      dismissDialog={toggleConfirmOrderDialog}
      onCancel={toggleConfirmOrderDialog}
      onConfirm={onPressConfirmOrder}
      renderHeader={renderHeader}
      onPress={toggleConfirmOrderDialog}
      showReasonDropdown={false}
    />
  )
}
