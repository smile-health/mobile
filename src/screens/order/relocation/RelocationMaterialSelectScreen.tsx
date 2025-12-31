import React from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import MaterialList from '@/components/list/MaterialList'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import useRelocationMaterials from '../hooks/relocation/useRelocationMaterials'

export default function RelocationMaterialSelectScreen() {
  const {
    activity,
    vendor,
    relocations,
    materials,
    handlePressMaterial,
    showDeleteAllDialog,
    openDeleteAllDialog,
    dismissDeleteAllDialog,
    handleDeleteRelocation,
    handleNavigateToReview,
  } = useRelocationMaterials()

  const hasRelocation = relocations.length > 0

  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1'>
      <EntityActivityHeader
        activityName={activity.name}
        entityLabel='label.vendor'
        entityName={vendor?.name}
      />
      <MaterialList
        type={MATERIAL_LIST_TYPE.NORMAL}
        data={materials}
        orders={relocations}
        onPressMaterial={handlePressMaterial}
      />

      {hasRelocation && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.review'),
            onPress: handleNavigateToReview,
            LeftIcon: Icons.IcArrowForward,
            testID: 'btn-navigate-to-relocation-review',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            onPress: openDeleteAllDialog,
            LeftIcon: Icons.IcDelete,
            testID: 'btn-delete-all-relocation',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: showDeleteAllDialog,
            onConfirm: handleDeleteRelocation,
            onCancel: dismissDeleteAllDialog,
          }}
        />
      )}
    </View>
  )
}
