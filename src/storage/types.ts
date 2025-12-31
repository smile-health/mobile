import { TxCode } from '@/i18n'
import {
  Activity,
  BaseEntity,
  DraftOrderDetail,
  OrderDraft,
  ProfileResponse,
  RelocationDraft,
} from '@/models'
import { TransactionDetail } from '@/models/transaction/TransactionCreate'
import {
  CVAState,
  MaterialsState,
  TransactionTypesState,
} from '@/services/features'
import {
  PushNotificationItem,
  NotificationSettings,
} from '@/types/pushNotification'

export type TrxDraftStorageKey = `trxDraft-${number}`
export type OrderDraftStorageKey = `orderDraft-${number}`
export type RelocationDraftStorageKey = `relocationDraft-${number}`

export interface StorageSchema {
  user_login: ProfileResponse
  settings: {
    language: TxCode
  }
  regularDraft: OrderDraft
  distributionDraft: OrderDraft
  returnDraft: OrderDraft
  [draftKey: `regularDraft-${number}`]: OrderDraft
  [draftKey: `distributionDraft-${number}`]: OrderDraft
  [draftKey: `returnDraft-${number}`]: OrderDraft
  [activityKey: `regularActivity-${number}`]: Activity
  [activityKey: `distributionActivity-${number}`]: Activity
  [activityKey: `returnActivity-${number}`]: Activity
  [entityKey: `regularEntity-${number}`]: BaseEntity
  [entityKey: `distributionEntity-${number}`]: BaseEntity
  [entityKey: `returnEntity-${number}`]: BaseEntity
  access_token: string
  refresh_token: string
  [key: OrderDraftStorageKey]: DraftOrderDetail
  [key: TrxDraftStorageKey]: TransactionDetail
  [key: `material-${number}`]: MaterialsState
  [key: `transactionType-${number}`]: TransactionTypesState
  [key: `cva-${number}`]: CVAState
  [key: RelocationDraftStorageKey]: RelocationDraft
  // Push Notification Storage
  '@push_notifications': PushNotificationItem[]
  '@push_notification_settings': NotificationSettings
  '@notification_badge_count': string
  '@offline_notification_queue': PushNotificationItem[]
  '@last_notification_sync': string
  '@fcm_token': string
}

type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends Array<any> ? K : never
}[keyof T]

type NonArrayKeys<T> = {
  [K in keyof T]: T[K] extends Array<any> ? never : K
}[keyof T]

export type StorageKey = keyof StorageSchema
export type NonArrayStorageKey = NonArrayKeys<StorageSchema>
export type ArrayStorageKey = ArrayKeys<StorageSchema>

export type MultiLoadResult<Keys extends StorageKey[]> = {
  [K in keyof Keys]: Keys[K] extends keyof StorageSchema
    ? StorageSchema[Keys[K]] | undefined
    : undefined
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string
  ) {
    super(message)
    this.name = 'StorageError'
  }
}
