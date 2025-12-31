import React from 'react'
import { View, Text } from 'react-native'
import { useFormContext } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import ShipmentWarningBox from './ShipmentWarningBox'
import { ReceiveShipmentForm } from '../../schema/ReceiveDisposalShipmentSchema'

export default function ReceiveShipmentFooter() {
  const { t } = useLanguage()
  const { control } = useFormContext<ReceiveShipmentForm>()
  return (
    <View className='bg-lightBlueGray gap-y-2 mt-4 pt-2 pb-7 flex-1'>
      <View className='bg-white p-4 gap-y-2'>
        <Text className={AppStyles.textBold}>{t('label.comment')}</Text>
        <TextField
          name='comment'
          control={control}
          label={t('label.comment')}
          placeholder={t('label.enter_comment')}
          returnKeyType='done'
          containerClassName='mt-0'
          {...getTestID('textfield-comment')}
        />
      </View>
      <ShipmentWarningBox />
    </View>
  )
}
