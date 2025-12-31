/* eslint-disable unicorn/no-thenable */
import { t } from 'i18next'
import * as yup from 'yup'

interface DependentValidationParams {
  dependentFields: string[]
}

const createDependentValidation = ({
  dependentFields,
}: DependentValidationParams) => {
  return function (this: yup.TestContext, value: any) {
    const parent = this.parent
    const hasAnyDependentValue = dependentFields.some(
      (field) => parent[field] !== null
    )

    if (hasAnyDependentValue) {
      return value !== null
    }

    return true
  }
}

// Helper function to transform string or non-numeric values to number or null
const transformToNumberOrNull = (_: any, originalValue: any) => {
  if (
    originalValue === '' ||
    (typeof originalValue !== 'number' && Number.isNaN(Number(originalValue)))
  ) {
    return null
  }
  return Number(originalValue)
}

export type AssetFormData = yup.InferType<
  ReturnType<typeof AssetInventorySchema>
>

// Validation schema for asset inventory form
export const AssetInventorySchema = () => {
  return yup.object().shape({
    asset_type_id: yup.number().required(t('validation.required')),
    serial_number: yup.string().required(t('validation.required')),
    asset_model_id: yup.number().required(t('validation.required')),
    manufacture_id: yup.number().required(t('validation.required')),
    asset_working_status_id: yup
      .number()
      .min(1, t('validation.required'))
      .required(t('validation.required')),
    // Ownership section
    ownership_qty: yup
      .number()
      .transform(transformToNumberOrNull)
      .required(t('validation.required')),
    ownership_status: yup
      .number()
      .min(1, t('validation.required'))
      .required(t('validation.required')),
    borrowed_from_entity_id: yup
      .number()
      .nullable()
      .when('ownership_status', {
        is: 2,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    // Budget section
    production_year: yup
      .number()
      .min(1, t('validation.required'))
      .required(t('validation.required'))
      .test(
        'production-year-validation',
        t('asset.validation_production_year'),
        function (value) {
          const { budget_year } = this.parent
          if (!value || !budget_year) return true
          return value <= budget_year
        }
      ),
    budget_year: yup
      .number()
      .min(1, t('validation.required'))
      .required(t('validation.required'))
      .test(
        'budget-year-validation',
        t('asset.validation_budget_year'),
        function (value) {
          const { production_year } = this.parent
          if (!value || !production_year) return true
          return value >= production_year
        }
      ),
    budget_source_id: yup.number().required(t('validation.required')),
    // Electricity section
    asset_electricity_id: yup.number().nullable(),
    // Warranty section
    warranty_start_date: yup
      .date()
      .nullable()
      .test(
        'warranty-start-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: ['warranty_end_date', 'warranty_asset_vendor_id'],
        })
      ),
    warranty_end_date: yup
      .date()
      .nullable()
      .test(
        'warranty-end-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: ['warranty_start_date', 'warranty_asset_vendor_id'],
        })
      ),
    warranty_asset_vendor_id: yup
      .number()
      .nullable()
      .test(
        'warranty-vendor-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: ['warranty_start_date', 'warranty_end_date'],
        })
      ),
    // Calibration section
    calibration_last_date: yup
      .date()
      .nullable()
      .test(
        'calibration-last-date-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: [
            'calibration_schedule_id',
            'calibration_asset_vendor_id',
          ],
        })
      ),
    calibration_schedule_id: yup
      .number()
      .nullable()
      .test(
        'calibration-schedule-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: [
            'calibration_last_date',
            'calibration_asset_vendor_id',
          ],
        })
      ),
    calibration_asset_vendor_id: yup
      .number()
      .nullable()
      .test(
        'calibration-vendor-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: ['calibration_last_date', 'calibration_schedule_id'],
        })
      ),
    // Maintenance section
    maintenance_last_date: yup
      .date()
      .nullable()
      .test(
        'maintenance-last-date-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: [
            'maintenance_schedule_id',
            'maintenance_asset_vendor_id',
          ],
        })
      ),
    maintenance_schedule_id: yup
      .number()
      .nullable()
      .test(
        'maintenance-schedule-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: [
            'maintenance_last_date',
            'maintenance_asset_vendor_id',
          ],
        })
      ),
    maintenance_asset_vendor_id: yup
      .number()
      .nullable()
      .test(
        'maintenance-vendor-required',
        t('validation.complete_all_fields'),
        createDependentValidation({
          dependentFields: ['maintenance_last_date', 'maintenance_schedule_id'],
        })
      ),
    // Entity section
    entity_id: yup.number().nullable(),
    entity_name: yup.string().nullable(),
    contact_person_user_1_name: yup.string().required(t('validation.required')),
    contact_person_user_1_number: yup
      .string()
      .required(t('validation.required')),
    contact_person_user_2_name: yup.string().nullable(),
    contact_person_user_2_number: yup.string().nullable(),
    contact_person_user_3_name: yup.string().nullable(),
    contact_person_user_3_number: yup.string().nullable(),
    // optional other
    other_asset_type_name: yup
      .string()
      .nullable()
      .when('asset_type_id', {
        is: 0,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    other_min_temperature: yup
      .number()
      .nullable()
      .when('asset_type_id', {
        is: 0,
        then: (schema) =>
          schema
            .transform(transformToNumberOrNull)
            .required(t('validation.required'))
            .test(
              'lessThanMax',
              t('asset.validation_min_temperature'),
              function (value) {
                const { other_max_temperature } = this.parent
                if (value === 0) return true
                return value <= other_max_temperature
              }
            ),
        otherwise: (schema) => schema.nullable(),
      }),
    other_max_temperature: yup
      .number()
      .nullable()
      .when('asset_type_id', {
        is: 0,
        then: (schema) =>
          schema
            .transform(transformToNumberOrNull)
            .required(t('validation.required'))
            .test(
              'greaterThanMin',
              t('asset.validation_max_temperature'),
              function (value) {
                const { other_min_temperature } = this.parent
                if (value === 0) return true
                return value >= other_min_temperature
              }
            ),
        otherwise: (schema) => schema.nullable(),
      }),
    other_asset_model_name: yup
      .string()
      .nullable()
      .when('asset_model_id', {
        is: 0,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    other_net_capacity: yup
      .number()
      .nullable()
      .when('asset_model_id', {
        is: 0,
        then: (schema) =>
          schema
            .transform(transformToNumberOrNull)
            .required(t('validation.required'))
            .test(
              'lessThanGross',
              t('asset.validation_net_capacity'),
              function (value) {
                const { other_gross_capacity } = this.parent
                if (value === null || other_gross_capacity === null) return true
                return value <= other_gross_capacity
              }
            ),
        otherwise: (schema) => schema.nullable(),
      }),
    other_gross_capacity: yup
      .number()
      .nullable()
      .when('asset_model_id', {
        is: 0,
        then: (schema) =>
          schema
            .transform(transformToNumberOrNull)
            .required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    other_manufacture_name: yup
      .string()
      .nullable()
      .when('manufacture_id', {
        is: 0,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    other_budget_source_name: yup
      .string()
      .nullable()
      .when('budget_source_id', {
        is: 0,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
    other_borrowed_from_entity_name: yup
      .string()
      .nullable()
      .when('borrowed_from_entity_id', {
        is: 0,
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.nullable(),
      }),
  })
}
