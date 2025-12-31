import React from 'react'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { useLanguage } from '@/i18n/useLanguage'
import { Activity } from '@/models/shared/Activity'

interface MaterialHeaderProps {
  activityName?: string
  activeActivity?: Activity | null
  vendorName?: string
  items?: { label: string; value?: string }[]
}

export const MaterialHeader: React.FC<MaterialHeaderProps> = ({
  activityName,
  activeActivity,
  vendorName,
  items,
}) => {
  const { t } = useLanguage()

  const defaultItems = [
    {
      label: t('label.activity'),
      value: activityName || activeActivity?.name,
    },
    {
      label: t('label.vendor'),
      value: vendorName,
    },
  ]

  return <HeaderMaterial items={items ?? defaultItems} />
}
