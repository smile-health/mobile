import { t } from 'i18next'
import * as yup from 'yup'
import { PASSWORD_REGEX } from '@/utils/Constants'

export const editPasswordSchema = () =>
  yup.object().shape({
    password: yup
      .string()
      .required(t('validation.old_password_required'))
      .matches(PASSWORD_REGEX, t('validation.password_validation_text')),
    new_password: yup
      .string()
      .required(t('validation.new_password_required'))
      .matches(PASSWORD_REGEX, t('validation.password_validation_text')),
    password_confirmation: yup
      .string()
      .required(t('validation.password_confirmation_required'))
      .oneOf(
        [yup.ref('new_password')],
        t('validation.password_confirmation_validation')
      ),
  })
