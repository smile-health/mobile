import React from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { MaterialDetailDistReturnScreenBase } from '@/screens/shared/MaterialDetailDistReturnScreenBase'
import { ORDER_KEY } from '@/utils/Constants'
import { useDraftManagement } from '../hooks/useDraftManagement'

interface Props extends AppStackScreenProps<'ReturnMaterialDetail'> {}

export default function ReturnMaterialDetailScreen({
  route,
  navigation,
}: Props) {
  const { setDraftItem } = useDraftManagement(ORDER_KEY.RETURN)

  const { t } = useLanguage()

  return (
    <MaterialDetailDistReturnScreenBase
      data={route.params.data}
      navigation={navigation}
      title={t('home.menu.make_return')}
      t={t}
      dispatchAction={setDraftItem}
      orderType={ORDER_KEY.RETURN}
    />
  )
}
