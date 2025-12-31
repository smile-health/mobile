import React from 'react'
import { Image, Text, View } from 'react-native'
import { Images } from '@/assets/images'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

function HelpDeskQRCode() {
  const { t } = useLanguage()
  return (
    <View className='bg-catskillWhite rounded-[5px] items-center py-6 px-5 gap-y-2.5'>
      <Text className={AppStyles.textBold}>
        {t('help_center.smile_help_desk')}
      </Text>
      <Image
        source={Images.ImgQRHelpDesk}
        className='w-full'
        resizeMode='contain'
      />
      <Text className={cn(AppStyles.textRegular, 'text-warmGrey text-center')}>
        {t('help_center.scan_barcode_message')}
      </Text>
    </View>
  )
}

export default React.memo(HelpDeskQRCode)
