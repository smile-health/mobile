import React from 'react'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import { ORDER_KEY } from '@/utils/Constants'
import OrderReviewList from '../component/OrderReviewList'
import { useOrderFinalReview } from '../hooks/useOrderFinalReview'
import { useReasonOptions } from '../hooks/useReasonOptions'

interface Props extends AppStackScreenProps<'RegularFinalReview'> {}

export default function RegularFinalReviewScreen({ route }: Props) {
  const {
    t,
    date,
    comment,
    dialogOpen,
    isLoadingCreateOrder,
    entities,
    activeActivity,
    orderDraft,
    message,
    isHierarchy,
    handleProcessOrder,
    handleCreateOrder,
    toogleCancelOrderDialog,
  } = useOrderFinalReview(route, ORDER_KEY.REGULAR)
  const { reasonRegularOptions } = useReasonOptions()

  useToolbar({
    title: t('title.review_order'),
  })

  return (
    <OrderReviewList
      title={t('title.review_order')}
      headerItems={[
        { label: t('label.activity'), value: activeActivity?.name },
        { label: t('label.vendor'), value: entities?.regular.name },
      ]}
      data={orderDraft}
      comment={comment}
      dataReason={reasonRegularOptions}
      date={date}
      message={message}
      isHierarchy={isHierarchy}
      isLoading={isLoadingCreateOrder}
      dialogOpen={dialogOpen}
      toogleCancelOrderDialog={toogleCancelOrderDialog}
      titleButton={t('button.process_order')}
      handleConfirm={handleProcessOrder}
      handleSubmit={handleCreateOrder}
    />
  )
}
