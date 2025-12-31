import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { AppNotifActivity } from '@/models/notif/AppNotifMaterial'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import MaterialAlert from '../accordion/MaterialAlert'

export interface ActivityMaterialItemProps {
  testID: string
  onPress: () => void
  title: string
  showFlag: boolean
  activityMaterialAlert?: AppNotifActivity
}

function ActivityMaterialItem(props: Readonly<ActivityMaterialItemProps>) {
  const { testID, onPress, title, showFlag, activityMaterialAlert } = props
  const { expired, expired_in_30_day } = activityMaterialAlert ?? {}

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        AppStyles.border,
        'bg-white rounded-sm px-2 py-3 mb-1 gap-y-1'
      )}
      {...getTestID(testID)}>
      <View className={cn(AppStyles.rowCenterAlign)}>
        <Text className={cn(AppStyles.textMedium, 'flex-1')}>{title}</Text>
        {showFlag && <Icons.IcFlag height={16} width={16} />}
        <Icons.IcChevronRight height={16} width={16} />
      </View>
      {activityMaterialAlert && (
        <MaterialAlert
          expiredBatch={expired}
          nearExpiredBatch={expired_in_30_day}
          className='gap-y-1'
        />
      )}
    </TouchableOpacity>
  )
}

export default React.memo(ActivityMaterialItem)
