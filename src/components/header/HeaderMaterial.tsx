import React from 'react'
import { Text, View } from 'react-native'
import { cn } from '@/theme/theme-config'

export interface HeaderItem {
  label: string
  value?: string
}

export interface HeaderMaterialProps {
  items: HeaderItem[]
  containerClassName?: string
}

export default function HeaderMaterial({
  items,
  containerClassName,
}: Readonly<HeaderMaterialProps>) {
  return (
    <View className={cn('bg-paleBlue px-4 py-2', containerClassName)}>
      {items.map((item) => (
        <View
          key={item.label}
          className='flex-row justify-between items-center mt-1'>
          <Text className='font-mainRegular text-midnightBlue text-[12px]'>
            {item.label}
          </Text>
          <Text className='font-mainBold text-midnightBlue text-[12px]'>
            {item.value ?? '-'}
          </Text>
        </View>
      ))}
    </View>
  )
}
