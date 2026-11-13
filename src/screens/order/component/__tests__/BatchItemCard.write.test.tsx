jest.mock('@expo/vector-icons', () => ({ Feather: () => null }))
jest.mock('@/services/features/ticketReason.slice', () => ({
  getReasons: 'getReasons',
}))
jest.mock('@/services/store', () => ({
  useAppSelector: () => [
    { value: '1', label: 'Rusak', children: [{ value: '11', label: 'Pecah' }] },
  ],
}))

import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import BatchItemCard from '../BatchItemCard'

const t: any = (k: string) => k
const batch: any = {
  batch_code: 'BC1',
  expired_date: '2030-05-06',
  qty: 1200,
  reason: '1',
  detail_reason: '11',
}

describe('BatchItemCard', () => {
  it('editable: tampil kode batch, label alasan dari opsi, dan edit', async () => {
    const onEdit = jest.fn()
    const { getAllByText, getByText } = await render(
      <BatchItemCard batch={batch} t={t} isSubmitted={0} onEdit={onEdit} />
    )
    expect(getAllByText('BC1')).toHaveLength(2)
    getByText('Rusak')
    getByText('Pecah')
    getByText('06 MAY 2030')
    await fireEvent.press(getAllByText('BC1')[0])
    expect(onEdit).toHaveBeenCalled()
  })

  it('editable dengan showBatchCode=false menyembunyikan kode di info', async () => {
    const { getAllByText } = await render(
      <BatchItemCard
        batch={batch}
        t={t}
        isSubmitted={0}
        showBatchCode={false}
      />
    )
    expect(getAllByText('BC1')).toHaveLength(1)
  })

  it('non-editable memakai BatchInfo tanpa tombol hapus bila tidak ada handler', async () => {
    const { queryByText, getByText } = await render(
      <BatchItemCard
        batch={{ ...batch, reason: 'x', detail_reason: 'y' }}
        t={t}
        isSubmitted={0}
        editable={false}
      />
    )
    expect(queryByText('button.delete')).toBeNull()
    getByText('x')
    getByText('y')
  })

  it('onDelete diprioritaskan', async () => {
    const onDelete = jest.fn()
    const handleDeleteMaterial = jest.fn()
    const { getByText } = await render(
      <BatchItemCard
        batch={batch}
        t={t}
        isSubmitted={0}
        onDelete={onDelete}
        handleDeleteMaterial={handleDeleteMaterial}
        materialId={4}
      />
    )
    await fireEvent.press(getByText('button.delete'))
    expect(onDelete).toHaveBeenCalled()
    expect(handleDeleteMaterial).not.toHaveBeenCalled()
  })

  it('handleDeleteMaterial menerima material yang dibentuk dari batch', async () => {
    const handleDeleteMaterial = jest.fn()
    const { getByText } = await render(
      <BatchItemCard
        batch={batch}
        t={t}
        isSubmitted={1}
        handleDeleteMaterial={handleDeleteMaterial}
        materialId={4}
      />
    )
    await fireEvent.press(getByText('button.delete'))
    expect(handleDeleteMaterial).toHaveBeenCalledWith({
      id: 4,
      name: '',
      isSubmitted: 1,
      batch_code: 'BC1',
      batches: [batch],
    })
  })

  it('handleDeleteMaterial tanpa materialId tidak melakukan apa-apa; batch_code null', async () => {
    const handleDeleteMaterial = jest.fn()
    const { getByText } = await render(
      <BatchItemCard
        batch={{ ...batch, batch_code: null }}
        t={t}
        isSubmitted={1}
        handleDeleteMaterial={handleDeleteMaterial}
      />
    )
    await fireEvent.press(getByText('button.delete'))
    expect(handleDeleteMaterial).not.toHaveBeenCalled()
  })

  it('handleDeleteMaterial dengan batch_code null memetakan undefined', async () => {
    const handleDeleteMaterial = jest.fn()
    const { getByText } = await render(
      <BatchItemCard
        batch={{ ...batch, batch_code: null }}
        t={t}
        isSubmitted={undefined}
        handleDeleteMaterial={handleDeleteMaterial}
        materialId={9}
      />
    )
    await fireEvent.press(getByText('button.delete'))
    expect(handleDeleteMaterial.mock.calls[0][0].batch_code).toBeUndefined()
  })
})
