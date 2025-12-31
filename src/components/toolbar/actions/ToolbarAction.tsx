import React, { ComponentType, useMemo, useState } from 'react'
import { View } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { ImageButton, ImageButtonProps } from '@/components/buttons'
import { PopupMenu, PopupMenuProps } from '@/components/menu/PopupMenu'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'

type ConditionalActionProps<T> =
  | {
      variant: 'withPopup'
      popupProps: Omit<PopupMenuProps<T>, 'dismissDialog' | 'modalVisible'>
      Icon: ComponentType<SvgProps>
    }
  | { variant?: never; popupProps?: never; Icon?: never }

interface CommonToolbarActionProps {
  actions: ImageButtonProps[]
}

export type ToolbarActionProps<T> = CommonToolbarActionProps &
  ConditionalActionProps<T>

export function ToolbarActions<T>({
  actions,
  variant,
  popupProps,
  Icon,
}: ToolbarActionProps<T>) {
  const [modalVisible, setModalVisible] = useState(false)

  const showPopup = () => setModalVisible(true)
  const dismissPopup = () => setModalVisible(false)

  const renderActions = useMemo(
    () =>
      actions.map(({ size = 24, color = colors.mainText(), ...props }) => (
        <ImageButton key={props.testID} size={size} color={color} {...props} />
      )),
    [actions]
  )

  return (
    <View className='flex-row items-center gap-x-2'>
      {renderActions}
      {variant === 'withPopup' && (
        <PopupMenu
          modalVisible={modalVisible}
          dismissDialog={dismissPopup}
          {...popupProps}>
          <ImageButton
            onPress={showPopup}
            Icon={Icon}
            color={colors.mainText()}
            size={24}
            {...getTestID('btn-toolbar-menu')}
          />
        </PopupMenu>
      )}
    </View>
  )
}
