import React, { useCallback } from 'react'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import { ordersState, useAppSelector } from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'
import { OrderBatchReviewItem } from '../component/OrderBatchReviewItem'
import OrderReviewList from '../component/OrderReviewList'
import { useOrderFinalReview } from '../hooks/useOrderFinalReview'

interface Props extends AppStackScreenProps<'DistributionFinalReview'> {}

export default function DistributionFinalReviewScreen({ route }: Props) {
  const {
    t,
    date,
    comment,
    isLoadingAllocation,
    activeActivity,
    message,
    entities,
    handleCreateDistributionOrder,
  } = useOrderFinalReview(route, ORDER_KEY.DISTRIBUTION)

  const { orders } = useAppSelector(ordersState)

  useToolbar({
    title: t('home.menu.make_distribution'),
  })

  const renderItem = useCallback(
    ({ item }) => <OrderBatchReviewItem item={item} />,
    []
  )

  return (
    <OrderReviewList
      title={t('title.review_distribution')}
      headerItems={[
        { label: t('label.activity'), value: activeActivity?.name },
        { label: t('label.customer'), value: entities?.distribution.name },
      ]}
      data={orders}
      comment={comment}
      date={date}
      message={message}
      isLoading={isLoadingAllocation}
      titleButton={t('button.process_distribution')}
      handleConfirm={handleCreateDistributionOrder}
      renderItem={renderItem}
    />
  )
}
