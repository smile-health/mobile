import React from 'react'
import { View } from 'react-native'
import { cn } from '@/theme/theme-config'

interface SeparatorProps {
  className?: string
}
const Separator: React.FC<SeparatorProps> = ({ className }) => {
  return (
    <View className={cn('border-b border-quillGrey mt-1 mb-2', className)} />
  )
}
export default Separator
