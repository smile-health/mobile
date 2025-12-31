import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { TicketMaterial } from '@/models/order/Ticket'
import { getFormattedQuantity } from '../../helpers/TicketHelpers'
interface MaterialItemProps {
  item: TicketMaterial
  t: TFunction
  handlePress: () => void
}

const TicketMaterialItem: React.FC<MaterialItemProps> = ({
  item,
  t,
  handlePress,
}) => (
  <TouchableOpacity
    key={item.id}
    className='mb-2 p-3 bg-white border border-gray-200 rounded-md'
    onPress={handlePress}
    testID={`ticket-material-item-${item.id}`}>
    <View className='flex-row justify-between'>
      <Text className='font-bold text-sm'>{item.name}</Text>
      <Icons.IcChevronRight height={16} width={16} />
    </View>
    <View className='my-2 h-px bg-gray-200' />
    <View className='flex-row gap-1'>
      <Icons.IcFlag height={16} width={16} />
      <Text className='text-scienceBlue text-xs'>
        {t('label.has_been_entered', {
          qty: getFormattedQuantity(item),
        })}
      </Text>
    </View>
  </TouchableOpacity>
)

export default React.memo(TicketMaterialItem)
