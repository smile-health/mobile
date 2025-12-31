import React from 'react'
import { Text, View } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipmentComment } from '@/models/disposal/DisposalShipmentList'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { disposalStatusNames } from '../../disposal-constant'

interface Props {
  item: IDisposalShipmentComment
}

function DisposalCommentItem({ item }: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    id,
    created_at,
    user,
    comment,
    disposal_shipment_status: status,
  } = item
  const name = [user?.firstname, user?.lastname].join(' ').trim()

  return (
    <View className='px-4 pb-2 bg-white'>
      <View className={AppStyles.card} {...getTestID(`comment-item-${id}`)}>
        <View className='flex-row items-start gap-x-1'>
          <Text className={AppStyles.textBoldSmall} style={flexStyle}>
            {name}
          </Text>
          <Text className={cn(AppStyles.labelMedium, 'uppercase')}>
            {convertString(created_at, SHORT_DATE_TIME_FORMAT)}
          </Text>
        </View>
        <Text className={cn(AppStyles.labelRegular, 'mb-2')}>
          {t('order.status_at_posting')} {t(disposalStatusNames[status])}
        </Text>
        <Text className={AppStyles.textRegular}>
          {!!comment && typeof comment === 'object'
            ? JSON.stringify(comment)
            : (comment ?? '-')}
        </Text>
      </View>
    </View>
  )
}

export default React.memo(DisposalCommentItem)
