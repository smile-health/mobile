import React from 'react'
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native'
import ProgramCard from '@/components/cards/ProgramCard'
import { useLocalizedName } from '@/i18n/useLocalizedName'
import { Workspace } from '@/models'
import AppStyles from '@/theme/AppStyles'

export interface WorkspaceItemProps extends TouchableOpacityProps {
  item: Workspace
}
export function WorkspaceItem(props: Readonly<WorkspaceItemProps>) {
  const { item, ...rest } = props
  const { programName } = useLocalizedName()

  return (
    <TouchableOpacity className='flex-row items-center gap-x-2' {...rest}>
      <ProgramCard
        name={item.name}
        color={item.config.color}
        programKey={item.key}
        iconClassName='h-8 w-8'
        className='h-8 w-8 rounded'
        textClassName='text-sm'
      />
      <Text className={AppStyles.textMedium}>{programName(item)}</Text>
    </TouchableOpacity>
  )
}
