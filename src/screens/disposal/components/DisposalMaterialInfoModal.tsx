import React from 'react'
import { Modal, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface Props {
  isOpenInfoModal: boolean
  handleCloseInfoModal: () => void
}

export const DisposalMaterialInfoModal: React.FC<Props> = ({
  isOpenInfoModal,
  handleCloseInfoModal,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      visible={isOpenInfoModal}
      onRequestClose={handleCloseInfoModal}
      animationType='fade'
      transparent>
      <View className={cn(AppStyles.modalOverlay, 'px-4')}>
        <View className='bg-white p-4 rounded-sm gap-y-2 self-center'>
          <View className={AppStyles.rowBetween}>
            <Text className={AppStyles.textBold}>
              {t('disposal.material_info')}
            </Text>
            <ImageButton
              onPress={handleCloseInfoModal}
              Icon={Icons.IcDelete}
              color={colors.mediumGray}
              size={20}
            />
          </View>
          <Text>{t('disposal.material_create_info_message')}</Text>
        </View>
      </View>
    </Modal>
  )
}
