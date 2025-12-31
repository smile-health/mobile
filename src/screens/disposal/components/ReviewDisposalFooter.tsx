import React from 'react'
import { View, Text } from 'react-native'
import { Control } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { ItemSeparator } from '@/components/list/ItemSeparator'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  control: Control<any>
}
const ReviewDisposalFooter: React.FC<Props> = ({ control }) => {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <ItemSeparator className='h-2 bg-lightBlueGray' />
      <View className='bg-white p-4'>
        <Text className={AppStyles.textBold}>{t('label.comment')}</Text>
        <TextField
          control={control}
          name='comment'
          label={t('label.comment')}
          placeholder={t('label.comment')}
          containerClassName='mb-0'
          {...getTestID('textfield-comment')}
        />
      </View>
    </React.Fragment>
  )
}

export default React.memo(ReviewDisposalFooter)
