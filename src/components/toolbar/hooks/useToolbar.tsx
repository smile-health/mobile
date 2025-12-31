import React, { useLayoutEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Toolbar, ToolbarProps } from '../Toolbar'

export function useToolbar(
  toolbarProps: ToolbarProps,
  deps: Parameters<typeof useLayoutEffect>[1] = []
) {
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <Toolbar withDefaultSubtitle {...toolbarProps} />,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, navigation])
}
