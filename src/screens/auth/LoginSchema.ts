import * as Yup from 'yup'

export const loginSchema = Yup.object().shape({
  username: Yup.string().required('validation.username_required'),
  password: Yup.string().required('validation.password_required'),
})
