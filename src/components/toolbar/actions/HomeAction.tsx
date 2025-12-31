import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { ToolbarActions } from './ToolbarAction'

export function HomeAction() {
  const { t } = useLanguage()
  const navigation = useNavigation()

  const data = [{ label: t('common.home'), key: 'common.home' }]

  const handleNavigation = () => navigation.navigate('Home')

  return (
    <ToolbarActions
      actions={[]}
      variant='withPopup'
      Icon={Icons.IcMoreVertical}
      popupProps={{
        data,
        labelField: 'label',
        containerClassName: 'right-0 mr-2 w-1/4',
        itemContainerClassName: 'px-4 py-2',
        onPressItem: handleNavigation,
      }}
    />
  )
}
