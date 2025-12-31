import React from 'react'
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  Text,
} from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { ChangeHistory } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { LONG_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

export interface ChangeHistoryItemProps extends TouchableOpacityProps {
  data: ChangeHistory
}

export function ChangeHistoryItem({
  data,
  ...props
}: Readonly<ChangeHistoryItemProps>) {
  const { t } = useLanguage()
  const { id, new_value, updated_at, updated_by } = data
  const updatedCount = Object.keys(new_value).length

  return (
    <TouchableOpacity
      className='flex-row items-center px-4 py-2'
      activeOpacity={0.7}
      {...getTestID(`history-item-${id}`)}
      {...props}>
      <View className='flex-1'>
        <Text className={AppStyles.textMedium}>
          {t('profile.num_update_information', { num: updatedCount })}
        </Text>
        <Text className={cn(AppStyles.labelMedium, 'text-[13px]')}>
          {t('profile.date_change_history_by', {
            date: convertString(updated_at, LONG_DATE_TIME_FORMAT),
            by: updated_by,
          })}
        </Text>
      </View>
      <Icons.IcChevronRight />
    </TouchableOpacity>
  )
}
