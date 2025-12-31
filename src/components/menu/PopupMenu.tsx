import React, { useState, useEffect } from 'react'
import {
  View,
  FlatList,
  FlatListProps,
  ListRenderItem,
  Modal,
  TouchableOpacity,
  Text,
  LayoutChangeEvent,
} from 'react-native'
import { Icons } from '@/assets/icons'
import { NotifResponse } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

export interface PopupMenuProps<T>
  extends Omit<FlatListProps<T>, 'renderItem' | 'ref'> {
  modalVisible: boolean
  dismissDialog: () => void
  labelField: keyof T
  onPressItem?: (item: T) => void
  itemTestIDField?: keyof T
  itemTestIDPrefix?: string
  backdropClassName?: string
  containerClassName?: string
  itemContainerClassName?: string
  itemTextClassName?: string
  children?: React.ReactNode
  notif?: NotifResponse
}

export function PopupMenu<T>(props: Readonly<PopupMenuProps<T>>) {
  const {
    children,
    modalVisible,
    dismissDialog,
    labelField,
    itemTestIDField,
    itemTestIDPrefix = '',
    backdropClassName,
    containerClassName,
    itemContainerClassName,
    itemTextClassName,
    notif,
    ...rest
  } = props

  const [childrenLayout, setChildrenLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [menuPosition, setMenuPosition] = useState({ top: 0 })

  const onChildrenLayout = (event: LayoutChangeEvent) => {
    setChildrenLayout(event.nativeEvent.layout)
  }

  useEffect(() => {
    if (modalVisible) {
      setMenuPosition({
        top: childrenLayout.y + childrenLayout.height,
      })
    }
  }, [modalVisible, childrenLayout])

  const className = {
    backdrop: cn('flex-1', backdropClassName),
    container: cn(
      'bg-white shadow shadow-black/70 rounded-sm absolute',
      containerClassName
    ),
    itemContainer: cn(
      'px-4 py-2 flex flex-row items-center',
      itemContainerClassName
    ),
    itemText: cn(AppStyles.textRegular, itemTextClassName),
  }

  const renderItem: ListRenderItem<T> = ({ item }) => {
    const onPressItem = () => {
      if (rest.onPressItem) {
        rest.onPressItem(item)
      }
      dismissDialog()
    }
    const testID = itemTestIDField
      ? `${itemTestIDPrefix}${String(item[itemTestIDField])}`
      : undefined

    const notifCount =
      item.id === 'order.purpose.sales'
        ? (notif?.as_vendor ?? 0)
        : (notif?.as_customer ?? 0)

    return (
      <TouchableOpacity
        {...getTestID(testID)}
        onPress={onPressItem}
        className={className.itemContainer}>
        <Text className={className.itemText}>
          {String(item[labelField] || '')}
        </Text>
        {notifCount > 0 && <Icons.IcError />}
      </TouchableOpacity>
    )
  }

  return (
    <>
      <View onLayout={onChildrenLayout}>{children}</View>
      <Modal
        animationType='fade'
        visible={modalVisible}
        onRequestClose={dismissDialog}
        transparent>
        <TouchableOpacity
          className={className.backdrop}
          activeOpacity={1}
          onPress={dismissDialog}
          {...getTestID('popup-menu-backdrop')}>
          <View
            style={{
              top: menuPosition.top,
            }}
            className={className.container}>
            <FlatList renderItem={renderItem} {...rest} />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}
