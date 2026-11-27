jest.mock('@/storage', () => ({
  loadLocalData: jest.fn(),
  saveLocalData: jest.fn(),
  loadArrayData: jest.fn(),
  updateArrayData: jest.fn(),
}))
import * as storage from '@/storage'
import { pushNotificationStorageService as svc } from '../push-notification/pushNotificationStorage.service'

const m = storage as jest.Mocked<typeof storage>
let errSpy: jest.SpyInstance
beforeEach(() => {
  jest.clearAllMocks()
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => errSpy.mockRestore())

const run = (fnMock: jest.Mock, input: any[]) => {
  const updater = fnMock.mock.calls[0][1]
  return updater(input)
}

describe('pushNotificationStorageService', () => {
  it('getNotifications / getOfflineQueue: sukses dan gagal', async () => {
    m.loadArrayData.mockResolvedValueOnce([{ id: '1' }] as any)
    expect(await svc.getNotifications()).toEqual([{ id: '1' }])
    m.loadArrayData.mockRejectedValueOnce(new Error('x'))
    expect(await svc.getNotifications()).toEqual([])
    m.loadArrayData.mockResolvedValueOnce([{ id: '2' }] as any)
    expect(await svc.getOfflineQueue()).toEqual([{ id: '2' }])
    m.loadArrayData.mockRejectedValueOnce(new Error('x'))
    expect(await svc.getOfflineQueue()).toEqual([])
  })

  it('addNotification menaruh di depan dan membatasi 100', async () => {
    await svc.addNotification({ id: 'new' } as any)
    const old = Array.from({ length: 100 }, (_, i) => ({ id: String(i) }))
    const out = run(m.updateArrayData as jest.Mock, old)
    expect(out).toHaveLength(100)
    expect(out[0].id).toBe('new')
    m.updateArrayData.mockRejectedValueOnce(new Error('x'))
    await svc.addNotification({ id: 'z' } as any)
    expect(errSpy).toHaveBeenCalled()
  })

  it('markAsRead hanya menandai id yang cocok', async () => {
    await svc.markAsRead('2')
    const out = run(m.updateArrayData as jest.Mock, [{ id: '1' }, { id: '2' }])
    expect(out).toEqual([{ id: '1' }, { id: '2', isRead: true }])
    m.updateArrayData.mockRejectedValueOnce(new Error('x'))
    await svc.markAsRead('2')
    expect(errSpy).toHaveBeenCalled()
  })

  it('incrementBadgeCount dari kosong, dari angka, dan gagal', async () => {
    m.loadLocalData.mockResolvedValueOnce(undefined as any)
    await svc.incrementBadgeCount()
    expect(m.saveLocalData.mock.calls[0][1]).toBe('1')
    m.loadLocalData.mockResolvedValueOnce('4' as any)
    await svc.incrementBadgeCount()
    expect(m.saveLocalData.mock.calls[1][1]).toBe('5')
    m.loadLocalData.mockRejectedValueOnce(new Error('x'))
    await svc.incrementBadgeCount()
    expect(errSpy).toHaveBeenCalled()
  })

  it('offline queue: add, clear, process', async () => {
    await svc.addToOfflineQueue({ id: 'q' } as any)
    expect(run(m.updateArrayData as jest.Mock, [{ id: 'old' }])[0].id).toBe('q')
    m.updateArrayData.mockRejectedValueOnce(new Error('x'))
    await svc.addToOfflineQueue({ id: 'q' } as any)

    await svc.clearOfflineQueue()
    expect(m.saveLocalData).toHaveBeenCalledWith(expect.anything(), [])
    m.saveLocalData.mockRejectedValueOnce(new Error('x'))
    await svc.clearOfflineQueue()

    m.loadArrayData.mockResolvedValueOnce([])
    m.updateArrayData.mockClear()
    await svc.processOfflineQueue()
    expect(m.updateArrayData).not.toHaveBeenCalled()

    m.loadArrayData.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }] as any)
    await svc.processOfflineQueue()
    expect(m.updateArrayData).toHaveBeenCalledTimes(2)
    expect(m.saveLocalData).toHaveBeenCalledWith(expect.anything(), [])

    m.loadArrayData.mockRejectedValueOnce(new Error('x'))
    await svc.processOfflineQueue()
    expect(errSpy).toHaveBeenCalled()
  })
})
