import { t } from 'i18next'
import * as yup from 'yup'
import { EMAIL_REGEX } from '@/utils/Constants'

export const editProfileSchema = () =>
  yup.object().shape({
    firstname: yup.string().required(t('validation.required')),
    lastname: yup.string().nullable(),
    gender: yup.number(),
    date_of_birth: yup.string(),
    mobile_phone: yup
      .string()
      .nullable()
      .test(
        'len',
        t('validation.phone_max_length'),
        (val) => !val || val.length <= 15
      ),
    email: yup
      .string()
      .required(t('validation.required'))
      .matches(EMAIL_REGEX, {
        message: t('validation.email'),
      }),
    address: yup.string().nullable(),
  })
