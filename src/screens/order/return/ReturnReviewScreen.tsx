import React from 'react'
import { AppStackScreenProps } from '@/navigators'
import OrderReviewScreenBase from '@/screens/shared/OrderReviewScreenBase'

type Props = AppStackScreenProps<'ReturnReview'>
export default function ReturnReviewScreen(props: Props) {
  return (
    <OrderReviewScreenBase
      navigation={props.navigation}
      menuTitleKey='home.menu.make_return'
      pageTitleKey='order.new_return'
      labelDateKey='label.return_date'
      finalReviewRoute='ReturnFinalReview'
      buttonTestID='btn-review-return'
    />
  )
}
