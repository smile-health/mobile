import React, { memo } from 'react'
import { FlatList, ListRenderItem, Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { ChangeHistory } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { genderNames, LONG_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

export interface ChangeHistoryBottomSheetProps extends BottomSheetProps {
  data?: ChangeHistory
}

interface ChangeDetail {
  label: ParseKeys
  value?: string | null | number
}

const ChangeHistoryBottomSheet = ({
  data,
  toggleSheet,
  ...props
}: ChangeHistoryBottomSheetProps) => {
  const { t } = useLanguage()

  if (!data) {
    return null
  }

  const getGenderLabel = (id?: number) => {
    if (!id) return
    return t(genderNames[id])
  }

  const getPasswordLabel = (pass?: number) => {
    if (typeof pass !== 'number') return

    return pass ? t('common.yes') : t('common.no')
  }

  const { new_value, updated_at, updated_by } = data
  const changeItems: ChangeDetail[] = [
    { label: 'label.firstname', value: new_value.firstname },
    { label: 'label.lastname', value: new_value.lastname },
    { label: 'label.gender', value: getGenderLabel(new_value.gender) },
    { label: 'label.phone_number', value: new_value.mobile_phone },
    { label: 'label.email', value: new_value.email },
    { label: 'label.password', value: getPasswordLabel(new_value.password) },
  ]

  const renderHeader = () => (
    <View className='p-4'>
      <Text className={AppStyles.textBold}>{t('common.change_history')}</Text>
      <Text className={AppStyles.textRegular}>
        {t('profile.date_change_history_by', {
          date: convertString(updated_at, LONG_DATE_TIME_FORMAT),
          by: updated_by,
        })}
      </Text>
    </View>
  )

  const renderItem: ListRenderItem<ChangeDetail> = ({ item }) => {
    if (!item.value && typeof item.value !== 'string') return null

    return (
      <View className='px-4 mb-4'>
        <Text className={cn(AppStyles.textMedium, 'text-[13px] text-warmGrey')}>
          {t(item.label)}
        </Text>
        <Text className={AppStyles.textMedium}>
          {item.label === 'label.password' ? (
            item.value
          ) : (
            <>
              {t('profile.change_to')}
              <Text className={AppStyles.textBold}> {item.value}</Text>
            </>
          )}
        </Text>
      </View>
    )
  }

  return (
    <BottomSheet toggleSheet={toggleSheet} {...props}>
      <View>
        <FlatList
          data={changeItems}
          keyExtractor={(item) => item.label}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          contentContainerClassName='bg-white rounded-t'
        />
        <View className='p-4 border-t border-t-whiteTwo'>
          <Button
            preset='outlined'
            text={t('button.close')}
            containerClassName='border-whiteTwo'
            onPress={toggleSheet}
            {...getTestID('btn-close-change-history-sheet')}
          />
        </View>
      </View>
    </BottomSheet>
  )
}

export default memo(ChangeHistoryBottomSheet)
