import React, { useMemo } from 'react'
import { Image, View, Text } from 'react-native'
import { ProgramImage } from '@/assets/images/program'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getInitials, getReadableTextColor } from '@/utils/CommonUtils'

interface Props {
  name: string
  programKey: string
  color: string
  iconClassName?: string
  className?: string
  textClassName?: string
}

const getTextColor = (backgroundColor: string) => {
  return getReadableTextColor(backgroundColor) === 'light'
    ? 'text-white'
    : 'text-marine'
}

const ProgramCard: React.FC<Props> = (props) => {
  const Icon = ProgramImage[props.programKey]

  const textColor = useMemo(() => getTextColor(props.color), [props.color])

  if (Icon) {
    return (
      <Image
        source={Icon}
        resizeMode='contain'
        resizeMethod='scale'
        className={cn('w-12 h-12', props.iconClassName)}
      />
    )
  }

  return (
    <View
      testID={`program-card-${props.programKey}`}
      style={{ backgroundColor: props.color }}
      className={cn(
        AppStyles.rowCenter,
        'w-12 h-12 rounded-md',
        props.className
      )}>
      <Text
        className={cn(AppStyles.textBoldLarge, textColor, props.textClassName)}>
        {getInitials(props.name)}
      </Text>
    </View>
  )
}

export default React.memo(ProgramCard)
