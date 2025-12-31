/* eslint-disable unicorn/no-thenable */
import { TFunction } from 'i18next'
import * as yup from 'yup'
import { IDENTITY_TYPE } from '../constant/transaction.constant'

export const PatientInfoSchema = (t: TFunction) =>
  yup.object().shape({
    is_sequence: yup.bool().required(),
    is_need_patient: yup.bool().required(),
    is_temperature_sensitive: yup.bool().required(),
    is_open_vial: yup.bool().required(),
    available_qty: yup.number().required(),
    piece_per_unit: yup.number().required(),
    min_qty_vaccine: yup.number().optional(),
    max_qty_vaccine: yup.number().optional(),
    patient_ids: yup.object().shape({
      nik: yup.array(),
      non_nik: yup.array(),
    }),
    change_qty: yup
      .number()
      .required()
      .min(1, () => t('validation.zero_quantity'))
      .when(
        [
          'piece_per_unit',
          'available_qty',
          'min_qty_vaccine',
          'max_qty_vaccine',
          'is_sequence',
        ],
        (
          [
            piecePerUnit,
            availableQty = 0,
            minQtyVaccine = 0,
            maxQtyVaccine = 0,
            isSequence,
          ],
          schema
        ) => {
          return schema
            .test(
              'multiple',
              t('transaction.validation.multiply_qty', {
                number: piecePerUnit,
              }),
              (changeQty) => {
                return (
                  !changeQty ||
                  (changeQty > 0 && changeQty % piecePerUnit === 0)
                )
              }
            )
            .test(
              'min-available',
              () =>
                t('transaction.validation.min_qty_vaccine', {
                  number: minQtyVaccine ?? '',
                }),
              function (changeQty) {
                if (!changeQty || changeQty <= 0 || !isSequence) return true

                return changeQty >= (isSequence ? minQtyVaccine : 1)
              }
            )
            .test(
              'max-available',
              () =>
                t(
                  isSequence
                    ? 'transaction.validation.max_qty_vaccine'
                    : 'transaction.validation.max_qty',
                  { number: maxQtyVaccine ?? '' }
                ),
              function (changeQty) {
                if (!changeQty || changeQty <= 0) return true

                return changeQty <= (isSequence ? maxQtyVaccine : availableQty)
              }
            )
        }
      ),
    open_vial_qty: yup.number().required().default(0),
    close_vial_qty: yup.number().required().default(0),
    stock_quality_id: yup
      .number()
      .required()
      .nullable()
      .when(
        ['change_qty', 'is_temperature_sensitive'],
        ([change_qty, is_temperature_sensitive], schema) => {
          if (is_temperature_sensitive && change_qty > 0) {
            return schema.required(t('validation.required'))
          }
          return schema.nullable()
        }
      ),
    stock_quality: yup
      .object({
        value: yup.number().required(),
        label: yup.string().required(),
      })
      .required()
      .nullable(),
    vaccine_type_id: yup
      .number()
      .when(['is_sequence'], ([isNeedSequence], schema) => {
        if (isNeedSequence) {
          return schema.required(t('validation.required'))
        }
        return schema.nullable()
      }),
    vaccine_method_id: yup
      .number()
      .when(
        ['vaccine_type_id', 'is_sequence'],
        ([vaccineTypeId, isSequence], schema) => {
          if (vaccineTypeId || isSequence) {
            return schema.required(t('validation.required'))
          }
          return schema.optional()
        }
      ),
    patients: yup
      .array()
      .of(
        yup.object({
          identity_type: yup.number().test(
            'required',
            () => t('validation.required'),
            function (value) {
              const from = this.from
              const rootValues = from && from.length > 1 ? from[1].value : null
              const { vaccine_method_id, vaccine_type_id, is_sequence } =
                rootValues

              const haveValue = value !== undefined && value !== null

              if (!is_sequence) {
                return haveValue
              }
              return haveValue && vaccine_method_id && vaccine_type_id
            }
          ),
          patient_id: yup
            .string()
            .when(['identity_type'], ([identityType], schema) => {
              schema = schema.required(t('validation.required'))
              const isNIK = identityType === IDENTITY_TYPE.NIK
              schema = isNIK
                ? schema.matches(
                    /^\d{16}$/,
                    t('transaction.validation.patient_id')
                  )
                : schema

              return schema.test(
                'unique-patient-id',
                t('transaction.validation.uniq_patient_id'),
                function (value) {
                  const from = this.from
                  const rootValues =
                    from && from.length > 1 ? from[1].value : null
                  const { patients = [], patient_ids } = rootValues

                  const currentIndex = Number.parseInt(
                    this.path.match(/\d+/)?.[0] || '-1'
                  )

                  if (!value || !identityType) return true

                  const isDuplicateInForm = patients.some(
                    (item: any, index: number) => {
                      return (
                        index !== currentIndex &&
                        item.patient_id === value &&
                        item.identity_type === identityType
                      )
                    }
                  )

                  const isDuplicateInAll = isNIK
                    ? patient_ids.nik.includes(value)
                    : patient_ids.non_nik.includes(value)

                  return !(isDuplicateInForm || isDuplicateInAll)
                }
              )
            }),
          vaccine_sequence: yup.number().test(
            'required',
            () => t('validation.required'),
            function (value) {
              const from = this.from
              const rootValues = from && from.length > 1 ? from[1].value : null
              const { is_sequence } = rootValues

              if (is_sequence) {
                return value !== undefined && value !== null
              }
              return true
            }
          ),
          phone_number: yup
            .string()
            .optional()
            .test(
              'min',
              t('transaction.validation.phone_min'),
              (val) => !val || val.length >= 8
            )
            .test(
              'max',
              t('transaction.validation.phone_max'),
              (val) => !val || val.length <= 15
            ),
        })
      )
      .required(),
  })

export type PatientInfoForm = yup.InferType<
  ReturnType<typeof PatientInfoSchema>
>
