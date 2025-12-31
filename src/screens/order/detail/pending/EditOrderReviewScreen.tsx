import React from 'react'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import { ORDER_KEY, ORDER_TYPE } from '@/utils/Constants'
import OrderReviewList from '../../component/OrderReviewList'
import { useOrderFinalReview } from '../../hooks/useOrderFinalReview'
import { useReasonOptions } from '../../hooks/useReasonOptions'

interface Props extends AppStackScreenProps<'EditOrderReview'> {}

export default function EditOrderReviewScreen({ route }: Props) {
  const { datas, activityName, orderType } = route.params

  const {
    t,
    date,
    comment,
    isLoadingEditOrderItem,
    handleEditOrderItem,
    isHierarchy,
  } = useOrderFinalReview(route, ORDER_KEY.REGULAR)
  const { reasonRegularOptions, reasonRelocationOptions } = useReasonOptions()
  const dataReason =
    orderType === ORDER_TYPE.RELOCATION
      ? reasonRelocationOptions
      : reasonRegularOptions
  useToolbar({
    title: `${t('title.review_order')}`,
  })

  return (
    <OrderReviewList
      dataReason={dataReason}
      title={t('title.review_order')}
      data={datas.order_items || []}
      dataVendor={datas.vendor}
      comment={comment}
      date={date}
      headerItems={[
        { label: t('label.activity'), value: activityName },
        { label: t('label.vendor'), value: datas.vendor?.name },
      ]}
      titleButton={t('button.send')}
      isLoading={isLoadingEditOrderItem}
      handleConfirm={handleEditOrderItem}
      isHierarchy={isHierarchy}
      withComment={false}
    />
  )
}
