import { DATA_TYPES } from '@/utils/Constants'

export * from './ErrorResponse'
export * from './account/Profile'
export * from './workspace/Workspace'
export * from './auth/Auth'
export * from './home/Home'
export * from './order/Order'
export * from './notif/Notif'
export * from './app-data/Cva'
export * from './app-data/TransactionTypes'
export * from './app-data/BaseEntity'

export type AppDataType = (typeof DATA_TYPES)[keyof typeof DATA_TYPES]
