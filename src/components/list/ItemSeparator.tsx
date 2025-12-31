import React from 'react'
import { View } from 'react-native'

interface ItemSeparatorProps {
  className?: string
}

export const ItemSeparator: React.FC<ItemSeparatorProps> = ({
  className = 'h-2',
}) => {
  return <View className={className} />
}
