import React, { useCallback } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { ORDER_TYPE } from '@/utils/Constants'
import OrderEditList from '../../component/OrderEditList'
import OrderHeaderSection from '../../component/section/OrderHeaderSection'
import { useConfirmOrder } from '../../hooks/useConfirmOrder'
import { useReasonOptions } from '../../hooks/useReasonOptions'

interface Props extends AppStackScreenProps<'EditOrder'> {}
export default function EditOrderScreen({ route, navigation }: Props) {
  const { data, orderId } = route.params
  const orderType = data?.type
  const { t } = useLanguage()

  const {
    control,
    comment,
    errors,
    orderItems,
    updateItem,
    handleDateChange,
    formattedDate,
    onPressReviewOrder,
    updateChildrenQty,
  } = useConfirmOrder({ data, orderId, t, navigation })
  const { reasonRegularOptions, reasonRelocationOptions } = useReasonOptions()
  const dataReason =
    orderType === ORDER_TYPE.RELOCATION
      ? reasonRelocationOptions
      : reasonRegularOptions

  const renderHeader = useCallback(
    () => (
      <OrderHeaderSection
        t={t}
        title={t('order.new_order')}
        activityName={data?.activity?.name}
        vendorName={data?.vendor?.name}
        vendorAddress={data?.vendor?.address}
        date={formattedDate}
        onDateChange={handleDateChange}
        headerItems={[
          { label: t('label.activity'), value: data?.activity?.name },
          { label: t('label.vendor'), value: data?.vendor?.name },
        ]}
        totalItem={data.order_items?.length}
        showDate
        isMandatoryDate={false}
        disabledDate
      />
    ),
    [t, data, formattedDate, handleDateChange]
  )

  return (
    <OrderEditList
      data={orderItems}
      dataReason={dataReason}
      comment={comment}
      updateQuantity={(index, _, value) => {
        updateItem(index, 'qty', value)
      }}
      updateReason={(index, _, value) => {
        updateItem(index, 'reason_id', value)
      }}
      updateOtherReasonText={(index, _, value) => {
        updateItem(index, 'other_reason_text', value)
      }}
      updateChildQuantity={(parentIndex, childId, value) => {
        updateChildrenQty(parentIndex, childId, value)
      }}
      t={t}
      control={control}
      errors={errors}
      renderHeader={renderHeader}
      onPress={onPressReviewOrder}
      withComment={false}
      type='edit'
    />
  )
}
