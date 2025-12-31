import React, { useCallback } from 'react'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import { ordersState, useAppSelector } from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'
import { OrderBatchReviewItem } from '../component/OrderBatchReviewItem'
import OrderReviewList from '../component/OrderReviewList'
import { useOrderFinalReview } from '../hooks/useOrderFinalReview'

interface Props extends AppStackScreenProps<'ReturnFinalReview'> {}

export default function ReturnFinalReviewScreen({ route }: Props) {
  const {
    t,
    date,
    comment,
    isLoadingCreateReturn,
    activeActivity,
    message,
    entities,
    handleCreateReturnOrder,
  } = useOrderFinalReview(route, ORDER_KEY.RETURN)

  const { orders } = useAppSelector(ordersState)

  useToolbar({
    title: t('home.menu.make_return'),
  })

  const renderItem = useCallback(
    ({ item }) => <OrderBatchReviewItem item={item} />,
    []
  )

  return (
    <OrderReviewList
      title={t('title.review_return')}
      labelDateKey='label.return_date'
      headerItems={[
        { label: t('label.activity'), value: activeActivity?.name },
        { label: t('label.customer'), value: entities?.return.name },
      ]}
      data={orders}
      comment={comment}
      date={date}
      message={message}
      isLoading={isLoadingCreateReturn}
      titleButton={t('button.process_return')}
      handleConfirm={handleCreateReturnOrder}
      renderItem={renderItem}
    />
  )
}
