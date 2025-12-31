import React, { useCallback } from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import ProgramCard from '@/components/cards/ProgramCard'
import { TransferStockProgram } from '@/models/transaction/TransferStock'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  item: TransferStockProgram
  showFlag?: boolean
  onPress: (item: TransferStockProgram) => void
}

function TransferStockProgramItem({
  item,
  showFlag,
  onPress,
}: Readonly<Props>) {
  const handlePressItem = useCallback(() => {
    onPress(item)
  }, [item, onPress])

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className='flex-row items-center mb-1.5 py-0.5 pl-0.5 pr-2 border border-lightGreyMinimal rounded-sm gap-x-2'
      onPress={handlePressItem}
      {...getTestID(`program-item-${item.key}`)}>
      <ProgramCard
        name={item.name}
        color={item.color}
        programKey={item.key}
        iconClassName='w-10 h-10'
        className='h-10 w-10 rounded'
        textClassName='text-sm'
      />
      <Text className={AppStyles.textMedium} style={flexStyle}>
        {item.name}
      </Text>
      {showFlag && <Icons.IcFlag height={16} width={16} />}
      <Icons.IcChevronRight height={16} width={16} />
    </TouchableOpacity>
  )
}

export default React.memo(TransferStockProgramItem)
