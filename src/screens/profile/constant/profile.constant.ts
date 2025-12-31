import { SectionListData } from 'react-native'
import { ParseKeys, TFunction } from 'i18next'
import { ProfileResponse } from '@/models'
import {
  DATE_TIME_FORMAT,
  deviceTypes,
  entityTypeNames,
  genderNames,
  LONG_DATE_FORMAT,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

export type SectionData = {
  label: string
  value?: string | number | null
  id: string
}
export type Section = { title: ParseKeys; data: SectionData[]; id: string }
export type SectionHeader = (info: {
  section: SectionListData<SectionData, Section>
}) => React.ReactElement

export const getDetailSection = (data: ProfileResponse, t: TFunction) => {
  const {
    username,
    firstname,
    lastname,
    role_label,
    date_of_birth,
    gender,
    mobile_phone,
    email,
    address,
    status,
    last_login,
    last_device,
    entity,
  } = data

  return [
    {
      title: 'section.user_info',
      id: 'section-title-user-info',
      data: [
        { label: t('label.username'), value: username, id: 'detail-username' },
        {
          label: t('label.name'),
          value: `${firstname} ${lastname || ''}`,
          id: 'detail-name',
        },
        {
          label: t('label.role'),
          value: role_label,
          id: 'role',
        },
        {
          label: t('label.birthdate'),
          value: convertString(date_of_birth, LONG_DATE_FORMAT),
          id: 'detail-birthdate',
        },
        {
          label: t('label.gender'),
          value: t(genderNames[gender], ''),
          id: 'detail-gender',
        },
        {
          label: t('label.phone_number'),
          value: mobile_phone,
          id: 'detail-phonenumber',
        },
        { label: t('label.email'), value: email, id: 'detail-email' },
        {
          label: t('label.address'),
          value: address,
          id: 'detail-address',
        },
      ],
    },
    {
      title: 'section.user_activity_info',
      id: 'section-title-user-activity-info',
      data: [
        {
          label: t('label.status'),
          value: status ? t('status.active') : t('status.inactive'),
          id: 'detail-status',
        },
        {
          label: t('label.last_login'),
          value: convertString(last_login, DATE_TIME_FORMAT),
          id: 'detail-last-login',
        },
        {
          label: t('label.last_device_access'),
          value: deviceTypes[last_device],
          id: 'detail-last-device-access',
        },
      ],
    },
    {
      title: 'section.workspace_entity_info',
      id: 'section-title-workspace-entity-info',
      data: [
        {
          label: t('label.entity'),
          value: entity.name,
          id: 'detail-entity-name',
        },
        {
          label: t('label.entity_address'),
          value: entity.address,
          id: 'detail-entity-address',
        },
        {
          label: t('label.type'),
          value: entityTypeNames[entity.type],
          id: 'detail-entity-type',
        },
        {
          label: t('label.tag'),
          value: entity.tag,
          id: 'detail-entity-tag',
        },
      ],
    },
  ] as Section[]
}
