import React from 'react'
import { AppStackScreenProps } from '@/navigators'
import OrderReviewScreenBase from '@/screens/shared/OrderReviewScreenBase'

type Props = AppStackScreenProps<'DistributionReview'>
export default function DistributionReviewScreen(props: Readonly<Props>) {
  return (
    <OrderReviewScreenBase
      navigation={props.navigation}
      menuTitleKey='home.menu.make_distribution'
      pageTitleKey='order.new_distribution'
      finalReviewRoute='DistributionFinalReview'
      buttonTestID='btn-review-distribution'
    />
  )
}
