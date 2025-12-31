import React, { useMemo } from 'react'
import { Pressable, View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipment } from '@/models/disposal/DisposalShipmentList'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import {
  disposalStatusDate,
  disposalStatusDateKey,
} from '../../disposal-constant'

interface Props {
  item: IDisposalShipment
  isSender: boolean
  onPress: () => void
}

function DisposalShipmentItem({ item, isSender, onPress }: Readonly<Props>) {
  const { t } = useLanguage()
  const { id, activity, customer, vendor, status, disposal_items } = item

  const entityName = isSender ? customer.name : vendor.name
  const dateString = useMemo(() => {
    const dateLabel = disposalStatusDateKey[item.status]
    return convertString(item[dateLabel], SHORT_DATE_TIME_FORMAT).toUpperCase()
  }, [item])

  return (
    <Pressable
      className='bg-white border-b border-quillGrey px-4 py-3 gap-y-0.5'
      onPress={onPress}
      {...getTestID(`disposal-KPM-${id}`)}>
      <View className='flex-row gap-x-4'>
        <View className='flex-1 gap-y-1'>
          <Text className={AppStyles.textRegular}>KPM-{id}</Text>
          <Text className={AppStyles.textBold}>{entityName}</Text>
        </View>
        <Icons.IcChevronRightActive fill={colors.main()} />
      </View>
      <Text className={AppStyles.textMediumSmall}>
        {t('label.activity')}: {activity?.name}
      </Text>
      <View className='flex-row items-center gap-x-1'>
        <Text className={AppStyles.labelRegular} style={flexStyle}>
          {t(disposalStatusDate[status], { date: dateString })}
        </Text>
        <Text className={AppStyles.labelRegular}>
          {t('disposal.total_item')}
        </Text>
        <Text className={AppStyles.textBold}>
          {disposal_items?.length ?? 0}
        </Text>
      </View>
    </Pressable>
  )
}

export default React.memo(DisposalShipmentItem)
