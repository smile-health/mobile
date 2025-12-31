import React from 'react'
import { Icons } from '@/assets/icons'
import LoadingDialog from '@/components/LoadingDialog'
import { AppDataType } from '@/models'
import { ToolbarActions } from './ToolbarAction'
import { useAppDataAction } from '../hooks/useAppDataAction'

export interface AppDataActionProps {
  type: AppDataType
  onRefresh?: () => void
  isLoading?: boolean
}

export function AppDataAction({
  type,
  onRefresh,
  isLoading,
}: Readonly<AppDataActionProps>) {
  const { popupProps, showLoading, toolbarActions } = useAppDataAction(
    type,
    onRefresh,
    isLoading
  )

  return (
    <React.Fragment>
      <ToolbarActions
        actions={toolbarActions}
        variant='withPopup'
        Icon={Icons.IcMoreVertical}
        popupProps={popupProps}
      />
      <LoadingDialog
        modalVisible={showLoading}
        testID='loadingdialog-app-data'
      />
    </React.Fragment>
  )
}
