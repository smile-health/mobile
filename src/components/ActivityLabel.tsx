import React from 'react'
import { Text } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface ActivityLabelProps {
  name: string | null
  className?: string
}

export default function ActivityLabel({
  name,
  className,
}: Readonly<ActivityLabelProps>) {
  return (
    <Text
      className={cn(
        AppStyles.textRegularSmall,
        'px-4 py-1 text-greenPrimary',
        'border border-greenPrimary rounded-xl',
        className
      )}
      {...getTestID(`ActivityLabel-${name}`)}>
      {name}
    </Text>
  )
}
