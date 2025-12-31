import * as yup from 'yup'

export const addOrderSchema = yup.object().shape({
  quantity: yup.string().required('validation.required'),
})
