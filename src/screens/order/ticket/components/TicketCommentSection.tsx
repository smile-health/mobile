import React from 'react'
import { View, Text } from 'react-native'

import { EventReportComment } from '@/models/order/EventReportDetail'
import { OrderCommentItem } from '../../component/detail'

interface TicketCommentSectionProps {
  comments: EventReportComment[]
}

export const TicketCommentSection = ({
  comments,
}: TicketCommentSectionProps) => {
  return (
    <View>
      <View className='mt-4 h-2 bg-[#F1F5F9] mx-[-14px]' />
      <Text className='text-base font-semibold mb-2 ml-4 mt-3'>
        Comment ({comments.length})
      </Text>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <OrderCommentItem
            data={comment}
            key={`comment-ticketing-${comment.id.toString()}`}
          />
        ))
      ) : (
        <Text className='text-gray-500'>-</Text>
      )}
    </View>
  )
}
