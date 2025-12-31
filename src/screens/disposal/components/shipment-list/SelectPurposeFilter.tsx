import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { PopupMenu } from '@/components/menu/PopupMenu'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import { DisposalPurpose, disposalPurposeNames } from '../../disposal-constant'

interface Props {
  data: Array<{ label: string; value: string }>
  purpose: DisposalPurpose
  onSelect: (purpose: { value: string }) => void
  t: TFunction
}

function SelectPurposeFilter({ data, purpose, t, onSelect }: Readonly<Props>) {
  const [purposePopupVisible, setPurposePopupVisible] = useState(false)

  const togglePurposePopup = () => {
    setPurposePopupVisible((prev) => !prev)
  }
  return (
    <View className='bg-white border-b border-b-whiteTwo px-4 py-3'>
      <PopupMenu
        modalVisible={purposePopupVisible}
        dismissDialog={togglePurposePopup}
        onPressItem={onSelect}
        labelField='label'
        containerClassName='ml-4'
        itemTextClassName='mr-1'
        data={data}
        {...getTestID('popup-disposal-purpose')}>
        <Button
          onPress={togglePurposePopup}
          containerClassName='justify-start'
          textClassName='flex-row items-center gap-x-2'
          {...getTestID('btn-disposal-purpose')}>
          <Text className={AppStyles.textRegular}>
            {t(disposalPurposeNames[purpose])}
          </Text>
          <Icons.IcExpandMore height={24} width={24} />
        </Button>
      </PopupMenu>
    </View>
  )
}

export default SelectPurposeFilter
