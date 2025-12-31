import React from 'react'
import { Pressable, PressableProps, View } from 'react-native'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface Props extends PressableProps {
  selected: boolean
  color?: string
  className?: string
  circleClassName?: string
}
function RadioButton({
  selected,
  color = colors.bluePrimary,
  className,
  circleClassName,
  ...props
}: Readonly<Props>) {
  return (
    <Pressable
      className={cn(
        'h-4 w-4 rounded-full items-center justify-center border',
        className
      )}
      style={{ borderColor: selected ? color : colors.quillGrey }}
      {...props}>
      {selected && (
        <View
          className={cn('h-2 w-2 rounded-full', circleClassName)}
          style={{ backgroundColor: color }}
        />
      )}
    </Pressable>
  )
}

export default React.memo(RadioButton)
