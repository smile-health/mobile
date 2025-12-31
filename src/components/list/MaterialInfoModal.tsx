import React from 'react'
import { Modal, View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import { MaterialListType } from './MaterialList'
import { ImageButton } from '../buttons'

const materialColorGuideList = [
  {
    indicatorStyle: 'border-lavaRed bg-softPink',
    title: 'material.color_guide.empty',
  },
  {
    indicatorStyle: 'border-vividOrange bg-softIvory',
    title: 'material.color_guide.low',
  },
  {
    indicatorStyle: 'border-greenPrimary bg-mintGreen',
    title: 'material.color_guide.on_range',
  },
  {
    indicatorStyle: 'border-dodgerBlue bg-aliceBlue',
    title: 'material.color_guide.over',
  },
]

interface Props {
  isOpen: boolean
  type: MaterialListType
  onClose: () => void
}

const getTitleByType = (t: TFunction, type: MaterialListType) => {
  const titleTypes = {
    [MATERIAL_LIST_TYPE.NORMAL]: t('material.material_color_guide'),
    [MATERIAL_LIST_TYPE.VIEW_STOCK]: t('material.material_info'),
    [MATERIAL_LIST_TYPE.VIEW_DISPOSAL_TRADEMARK_STOCK]: t(
      'material.material_info'
    ),
    [MATERIAL_LIST_TYPE.VIEW_DISPOSAL_SUBSTANCE_STOCK]: t(
      'material.material_info'
    ),
  }
  return titleTypes[type]
}

function MaterialInfoModal({
  isOpen,
  type = MATERIAL_LIST_TYPE.NORMAL,
  onClose,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const renderItem = (item) => {
    return (
      <View
        key={item.title}
        className='flex-row items-center gap-x-2 border-b border-quillGrey pb-2 mb-2'>
        <View
          className={cn('h-2.5 w-2.5 rounded-sm border', item.indicatorStyle)}
        />
        <Text className={AppStyles.textRegular}>{t(item.title)}</Text>
      </View>
    )
  }

  return (
    <Modal
      visible={isOpen}
      animationType='fade'
      statusBarTranslucent
      transparent>
      <View className={cn(AppStyles.modalOverlay, 'px-4')}>
        <View className='bg-white p-4 rounded-sm gap-y-2 self-center'>
          <View className={AppStyles.rowBetween}>
            <Text className={AppStyles.textBold}>
              {getTitleByType(t, type)}
            </Text>
            <ImageButton
              onPress={onClose}
              Icon={Icons.IcDelete}
              color={colors.mediumGray}
              size={20}
              {...getTestID('btn-close-modal-info')}
            />
          </View>
          {type === MATERIAL_LIST_TYPE.NORMAL &&
            materialColorGuideList.map((item) => renderItem(item))}
          {type === MATERIAL_LIST_TYPE.VIEW_STOCK && (
            <Text className={AppStyles.textRegular}>
              {t('material.material_info_detail')}
            </Text>
          )}
          {type === MATERIAL_LIST_TYPE.VIEW_DISPOSAL_SUBSTANCE_STOCK && (
            <Text className={AppStyles.textRegular}>
              {t('disposal.material_substance_info_message')}
            </Text>
          )}
          {type === MATERIAL_LIST_TYPE.VIEW_DISPOSAL_TRADEMARK_STOCK && (
            <Text className={AppStyles.textRegular}>
              {t('disposal.material_trademark_info_message')}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default MaterialInfoModal
