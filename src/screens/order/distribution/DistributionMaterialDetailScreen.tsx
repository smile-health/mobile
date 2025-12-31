import React from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { MaterialDetailDistReturnScreenBase } from '@/screens/shared/MaterialDetailDistReturnScreenBase'
import { useDraftManagement } from '../hooks/useDraftManagement'

interface Props extends AppStackScreenProps<'DistributionMaterialDetail'> {}

export default function DistributionMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const { setDraftItem } = useDraftManagement('distribution')

  const { t } = useLanguage()

  return (
    <MaterialDetailDistReturnScreenBase
      t={t}
      data={route.params.data}
      navigation={navigation}
      title={t('order.add_distribution')}
      dispatchAction={setDraftItem}
      orderType='distribution'
    />
  )
}
