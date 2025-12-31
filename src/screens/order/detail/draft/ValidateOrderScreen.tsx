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

export default function ValidateOrderScreen({ route }: Props) {
  const { data, orderId } = route.params
  const { user } = useAppSelector(authState)
  const { t } = useLanguage()

  const {
    control,
    errors,
    comment,
    orderItems,
    isLoadingValidate,
    dialogOpen,
    toggleConfirmOrderDialog,
    updateItem,
    updateChildrenQty,
    onPressValidateOrder,
  } = useConfirmOrder({ data, orderId, t })
  const { reasonRegularOptions } = useReasonOptions()

  useToolbar({
    title: `${t('button.validate_order')}: ${orderId}`,
  })

  const renderHeader = useCallback(
    () => (
      <OrderHeaderSection
        t={t}
        containerClassName='p-0 m-0'
        date={null}
        showDivider={false}
        headerItems={[
          { label: t('label.activity'), value: data?.activity?.name },
          { label: t('label.vendor'), value: user?.entity?.name },
        ]}
        activityName={user?.entity?.name}
        vendorName={data?.activity?.name}
        totalItem={data.order_items?.length}
      />
    ),
    [t, user, data]
  )

  return (
    <OrderEditList
      type='validate'
      data={orderItems}
      dataReason={reasonRegularOptions}
      showReasonDropdown={false}
      updateQuantity={(index, field, value) => {
        updateItem(index, 'qty', value)
      }}
      updateReason={(index, field, value) => {
        updateItem(index, 'reason_id', value)
      }}
      updateChildQuantity={(parentIndex, childId, value) => {
        updateChildrenQty(parentIndex, childId, value.toString())
      }}
      updateOtherReasonText={(index, _, value) => {
        updateItem(index, 'other_reason_text', value)
      }}
      t={t}
      control={control}
      comment={comment}
      errors={errors}
      isLoading={isLoadingValidate}
      renderHeader={renderHeader}
      modalVisible={dialogOpen}
      dismissDialog={toggleConfirmOrderDialog}
      onCancel={toggleConfirmOrderDialog}
      onPress={onPressValidateOrder}
    />
  )
}
