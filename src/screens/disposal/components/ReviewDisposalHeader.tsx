import React from 'react'
import { View, Text } from 'react-native'
import { Control } from 'react-hook-form'
import { TextField } from '@/components/forms'
import { ItemSeparator } from '@/components/list/ItemSeparator'
import ListTitle from '@/components/list/ListTitle'
import { useLanguage } from '@/i18n/useLanguage'
import { BaseEntity } from '@/models'
import AppStyles from '@/theme/AppStyles'

interface Props {
  control: Control<any>
  totalItem: number
  title: string
  receiver?: BaseEntity
}
const ReviewDisposalHeader: React.FC<Props> = ({
  control,
  totalItem,
  title,
  receiver,
}) => {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <View className=' bg-white p-4 gap-y-2'>
        <Text className={AppStyles.textBold}>{title}</Text>
        {receiver && (
          <View className='border border-quillGrey p-2 rounded-sm gap-y-1'>
            <Text className={AppStyles.labelBold}>
              {t('disposal.receiver')}
            </Text>
            <Text className={AppStyles.textBoldSmall}>{receiver.name}</Text>
            <Text className={AppStyles.labelRegular}>{receiver.address}</Text>
          </View>
        )}
        <TextField
          control={control}
          name='disposalReportNumber'
          label={t('disposal.disposal_report_number')}
          placeholder={t('disposal.disposal_report_number')}
          containerClassName='mb-0'
          isMandatory
        />
      </View>
      <ItemSeparator className='h-2 bg-lightBlueGray' />
      <ListTitle title={t('label.item')} itemCount={totalItem} />
    </React.Fragment>
  )
}

export default React.memo(ReviewDisposalHeader)
