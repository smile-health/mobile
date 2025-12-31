import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { ImageButtonProps } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { getTestID } from '@/utils/CommonUtils'
import { ToolbarActions } from './ToolbarAction'

export interface SearchToolbarAction {
  onRefresh: () => void
  onSearch: () => void
}

export function SearchToolbarAction({
  onRefresh,
  onSearch,
}: Readonly<SearchToolbarAction>) {
  const { t } = useLanguage()
  const navigation = useNavigation()

  const data = [{ label: t('common.home'), key: 'common.home' }]

  const toolbarActions: ImageButtonProps[] = [
    {
      Icon: Icons.IcSearch,
      onPress: onSearch,
      ...getTestID('btn-toolbar-search'),
    },
    {
      Icon: Icons.IcRefresh,
      onPress: onRefresh,
      ...getTestID('btn-toolbar-refresh'),
    },
  ]

  return (
    <ToolbarActions
      actions={toolbarActions}
      variant='withPopup'
      Icon={Icons.IcMoreVertical}
      popupProps={{
        data,
        labelField: 'label',
        containerClassName: 'right-0 mr-2 w-1/4',
        itemContainerClassName: 'px-4 py-2',
        onPressItem: navigation.goBack,
      }}
    />
  )
}
