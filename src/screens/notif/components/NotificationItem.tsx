import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import ProgramCard from '@/components/cards/ProgramCard'
import { NotificationData } from '@/models/notif/NotificationList'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface Props {
  item: NotificationData
  testID: string
  onPress: (item: NotificationData) => void
}

function NotificationItem({ item, testID, onPress }: Readonly<Props>) {
  const {
    type,
    read_at,
    created_at,
    message,
    entity,
    user,
    program,
    mobile_phone,
  } = item

  const handlePressNotification = () => {
    onPress(item)
  }
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePressNotification}
      className={cn(
        'p-4 border-b border-quillGrey gap-y-1',
        read_at ? 'bg-white' : 'bg-iceBlue'
      )}
      {...getTestID(testID)}>
      <View className='flex-row items-center'>
        <Text className={cn(AppStyles.textBoldSmall, 'flex-1')}>
          {type.title}
        </Text>
        <Text className={cn(AppStyles.labelRegular, 'uppercase text-xxs')}>
          {convertString(created_at, SHORT_DATE_TIME_FORMAT)}
        </Text>
      </View>
      <Text className={AppStyles.textRegularSmall}>{message}</Text>
      <Text className={cn(AppStyles.labelMedium, 'text-xxs')}>
        {[
          entity?.name,
          user?.username,
          mobile_phone?.replace(/(\d{4})(\d{4})(\d+)/, '$1****$3'),
        ]
          .filter(Boolean)
          .join(' • ')}
      </Text>
      {program && (
        <View className='flex-row items-center gap-x-1 mt-1 bg-white border border-quillGrey rounded-sm p-0.5 self-start'>
          <ProgramCard
            name={program.name}
            color={program.config.color}
            programKey={program.key}
            iconClassName='h-5 w-5'
            className='h-5 w-5 rounded-sm'
            textClassName='text-[10px]'
          />
          <Text className={cn(AppStyles.textMediumSmall, 'text-[10px]')}>
            {program.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default React.memo(NotificationItem)
