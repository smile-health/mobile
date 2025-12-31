import React from 'react'
import { Text, TouchableOpacity, Dimensions } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import ProgramCard from './ProgramCard'

interface CardWorkspaceProps {
  backgroundColor: string
  name: string
  programKey: string
  containerClassName?: string
  titleClassName?: string
  onPress: () => void
  testID: string
}

const { width } = Dimensions.get('window')
const PADDING = 16
const GAP = 24
const NUM_COLUMNS = 3
const cardWidth = (width - PADDING * 2 - GAP) / NUM_COLUMNS

export default function CardWorkspace(props: Readonly<CardWorkspaceProps>) {
  const {
    testID,
    onPress,
    name,
    programKey,
    containerClassName,
    titleClassName,
    backgroundColor,
  } = props

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'items-center px-2 py-4 border border-quillGrey rounded-lg gap-2',
        containerClassName
      )}
      style={{ width: cardWidth }}
      {...getTestID(testID)}>
      <ProgramCard
        name={name}
        color={backgroundColor}
        programKey={programKey}
      />
      <Text
        className={cn(AppStyles.textMedium, `text-center  ${titleClassName}`)}
        numberOfLines={2}
        ellipsizeMode='tail'>
        {name}
      </Text>
    </TouchableOpacity>
  )
}
