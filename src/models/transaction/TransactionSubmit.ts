import { Dispatch, SetStateAction } from 'react'
import { ParseKeys } from 'i18next'
import { CreateTransaction } from './TransactionCreate'
import { BaseEntity } from '../app-data/BaseEntity'
import { Activity } from '../app-data/Cva'
import { Workspace } from '../workspace/Workspace'

export interface TransactionSubmitResponse {
  data: string
}

export type TransactionSubmitHandler = (
  program: Workspace,
  transactions: CreateTransaction[],
  activity: Activity,
  customer?: BaseEntity
) => Promise<TransactionSubmitResponse>

export interface TransactionTypeHandler {
  submit: TransactionSubmitHandler
  isLoading: boolean
  additionalProps?: {
    actualDateLabel: ParseKeys
    actualDate: string
    setActualDate: Dispatch<SetStateAction<string>>
  }
}

export interface TransactionTypeUseCase {
  [key: string]: TransactionTypeHandler
}
