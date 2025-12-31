import React from 'react'
import { Text, View } from 'react-native'
import { TFunction } from 'i18next'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getStatusColor } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { disposalStatusNames } from '../../disposal-constant'

interface Props {
  t: TFunction
  status?: number
  updatedAt?: string
}

function DisposalShipmentStatus({ t, status, updatedAt }: Readonly<Props>) {
  if (!status || !updatedAt) return null

  const color = getStatusColor(status)

  return (
    <View className={cn('flex-row px-4 py-2 items-center', color.background)}>
      <Text className={cn('flex-1', AppStyles.labelRegular, color.text)}>
        {t(disposalStatusNames[status])}
      </Text>
      <Text className={AppStyles.textBoldSmall}>
        {convertString(updatedAt, SHORT_DATE_TIME_FORMAT)}
      </Text>
    </View>
  )
}

export default React.memo(DisposalShipmentStatus)
