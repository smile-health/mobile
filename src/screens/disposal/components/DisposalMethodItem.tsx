import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Icons } from '@/assets/icons'
import AppStyles from '@/theme/AppStyles'

interface DisposalMethodItemProps {
  name: string
  onPress: () => void
}

const DisposalMethodItem: React.FC<DisposalMethodItemProps> = ({
  name,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className='flex-row items-center justify-between px-2 py-3 bg-white border border-gray-200 rounded mx-4'
      onPress={onPress}>
      <Text className={AppStyles.textMedium}>{name}</Text>
      <Icons.IcChevronRight height={16} width={16} />
    </TouchableOpacity>
  )
}

export default React.memo(DisposalMethodItem)
