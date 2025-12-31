import { Activity } from '@/models'
import { StockMaterial } from '@/models/shared/Material'
import { CreateTransactionStock } from '@/models/transaction/TransactionCreate'
import { DEFAULT_TRANSACTION_VALUES } from '../constant/transaction.constant'
import { AddNewBatchFormField } from '../schema/AddNewBatchSchema'

export const createNewBatchTrx = (
  activity: Activity,
  material: StockMaterial,
  data: AddNewBatchFormField
): CreateTransactionStock => {
  return {
    ...DEFAULT_TRANSACTION_VALUES,
    activity: {
      id: activity.id,
      name: activity.name,
    },
    batch: {
      code: data.code.toUpperCase(),
      expired_date: data.expired_date,
      production_date: data.production_date,
      manufacture: data.manufacture,
      id: 0,
    },
    material_id: material.id,
    is_temperature_sensitive: !!material.is_temperature_sensitive,
    is_open_vial: !!material.is_open_vial,
    unit: material.unit_of_consumption ?? '',
    piece_per_unit: material.consumption_unit_per_distribution_unit ?? 1,
  }
}
