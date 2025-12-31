import React from 'react'
import OrderReviewList from '../component/OrderReviewList'
import useRelocationFinalReview from '../hooks/relocation/useRelocationFinalReview'
import { useReasonOptions } from '../hooks/useReasonOptions'

export default function RelocationFinalReviewScreen() {
  const {
    t,
    date,
    comment,
    activity,
    vendor,
    relocations,
    message,
    dialogOpen,
    toggleCancelDialog,
    handleCreateRelocation,
    isLoading,
  } = useRelocationFinalReview()
  const { reasonRelocationOptions } = useReasonOptions()

  const headerItems = [
    { label: t('label.activity'), value: activity?.name },
    { label: t('label.vendor'), value: vendor?.name },
  ]

  return (
    <OrderReviewList
      title={t('title.review_order')}
      headerItems={headerItems}
      data={relocations}
      dataVendor={vendor}
      dataReason={reasonRelocationOptions}
      comment={comment}
      date={date}
      message={message}
      isLoading={isLoading}
      dialogOpen={dialogOpen}
      toogleCancelOrderDialog={toggleCancelDialog}
      titleButton={t('button.process_order')}
      handleConfirm={handleCreateRelocation} // Button
      handleSubmit={() => handleCreateRelocation(true)} // Dialog Button confirm
    />
  )
}
