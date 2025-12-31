import React, { useMemo } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppDataType } from '@/models'
import { homeState, useAppSelector } from '@/services/store'
import { AppDataAction } from './actions/AppDataAction'
import { Toolbar, ToolbarProps } from './Toolbar'

interface ToolbarMenuProps extends ToolbarProps {
  type?: AppDataType
}

export function ToolbarMenu({
  type,
  ...toolbarProps
}: Readonly<ToolbarMenuProps>) {
  const { activeMenu } = useAppSelector(homeState)

  const { t } = useLanguage()
  const title = useMemo(
    () => t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    [activeMenu?.key, activeMenu?.name, t]
  )
  const actions = useMemo(
    () => (type ? <AppDataAction type={type} /> : undefined),
    [type]
  )

  return (
    <Toolbar
      title={title}
      withDefaultSubtitle
      actions={actions}
      {...toolbarProps}
    />
  )
}
