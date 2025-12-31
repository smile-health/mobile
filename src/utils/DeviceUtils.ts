import Constants, { ExecutionEnvironment } from 'expo-constants'

const isTestEnvironment = process.env.JEST_WORKER_ID !== undefined

export const isExpoGo = isTestEnvironment
  ? false
  : Constants.executionEnvironment === ExecutionEnvironment.StoreClient
