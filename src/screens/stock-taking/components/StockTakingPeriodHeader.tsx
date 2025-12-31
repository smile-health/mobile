import React, { useState } from 'react'
import { Pressable, View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { useLanguage } from '@/i18n/useLanguage'
import { Period } from '@/models/stock-taking/StockTakingPeriod'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import SelectPeriodBottomSheet from './SelectPeriodBottomSheet'

interface Props {
  period?: Period
  periodList: Period[]
  onSelectPeriod: (item: Period) => void
}

function StockTakingPeriodHeader({
  period,
  periodList,
  onSelectPeriod,
}: Readonly<Props>) {
  const { t } = useLanguage()

  const [isOpenPeriodBottomSheet, setIsOpenPeriodBottomSheet] = useState(false)

  const togglePeriodBottomSheet = () => {
    setIsOpenPeriodBottomSheet((prev) => !prev)
  }

  return (
    <React.Fragment>
      {period ? (
        <HeaderMaterial
          items={[{ label: t('label.period'), value: period.name }]}
        />
      ) : (
        <View className='px-4 py-3 items-start bg-white border-b border-quillGrey'>
          <Pressable
            onPress={togglePeriodBottomSheet}
            className='flex-row px-2 py-1 gap-x-1 rounded-3xl bg-catskillWhite border border-quillGrey'
            {...getTestID('filter-select-period')}>
            <Text className={AppStyles.textMediumSmall}>
              {t('label.select_period')}
            </Text>
            <Icons.IcExpandMore width={16} height={16} />
          </Pressable>
        </View>
      )}
      <SelectPeriodBottomSheet
        data={periodList}
        isOpen={isOpenPeriodBottomSheet}
        onSelect={onSelectPeriod}
        toggleSheet={togglePeriodBottomSheet}
      />
    </React.Fragment>
  )
}

export default React.memo(StockTakingPeriodHeader)
