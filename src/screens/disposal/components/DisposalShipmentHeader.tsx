import React, { useMemo } from 'react'
import { TFunction } from 'i18next'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { disposalState, useAppSelector } from '@/services/store'

interface Props {
  t: TFunction
}

const DisposalShipmentHeader: React.FC<Props> = ({ t }) => {
  const { activity, receiver } = useAppSelector(disposalState)
  const headerItems = useMemo(
    () => [
      { label: t('label.activity'), value: activity.name },
      ...(receiver
        ? [{ label: t('disposal.receiver'), value: receiver.name }]
        : []),
    ],
    [activity.name, receiver, t]
  )
  return <HeaderMaterial items={headerItems} />
}

export default React.memo(DisposalShipmentHeader)
