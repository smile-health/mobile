import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  StorageSchema,
  StorageKey,
  NonArrayStorageKey,
  ArrayStorageKey,
  MultiLoadResult,
  StorageError,
} from './types'

async function handleStorageOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new StorageError(message, errorMessage)
  }
}

export async function saveLocalData<K extends StorageKey>(
  key: K,
  value: StorageSchema[K]
): Promise<void> {
  await handleStorageOperation(
    () => AsyncStorage.setItem(key, JSON.stringify(value)),
    'save'
  )
}

export async function loadLocalData<K extends NonArrayStorageKey>(
  key: K
): Promise<StorageSchema[K] | null> {
  return handleStorageOperation(async () => {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }, 'load')
}

export async function loadArrayData<K extends ArrayStorageKey>(
  key: K
): Promise<StorageSchema[K]> {
  return handleStorageOperation(async () => {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : []
  }, 'loadArray')
}

export async function loadMultipleLocalData<K extends StorageKey[]>(
  keys: K
): Promise<MultiLoadResult<K>> {
  return handleStorageOperation(async () => {
    const items = await AsyncStorage.multiGet(keys)
    return items.map(([, value]) =>
      value ? JSON.parse(value) : undefined
    ) as MultiLoadResult<K>
  }, 'loadMultiple')
}

export async function updateLocalData<K extends NonArrayStorageKey>(
  key: K,
  value: Partial<StorageSchema[K]>
): Promise<void> {
  await handleStorageOperation(async () => {
    const current = await loadLocalData(key)
    const newValue =
      current && typeof current === 'object' ? { ...current, ...value } : value
    await AsyncStorage.setItem(key, JSON.stringify(newValue))
  }, 'update')
}

export async function updateArrayData<K extends ArrayStorageKey>(
  key: K,
  updater: (data: StorageSchema[K]) => StorageSchema[K]
): Promise<void> {
  await handleStorageOperation(async () => {
    const current = await loadArrayData(key)
    const newValue = updater(current)
    await AsyncStorage.setItem(key, JSON.stringify(newValue))
  }, 'updateArray')
}

export async function removeLocalData(key: StorageKey): Promise<void> {
  await handleStorageOperation(() => AsyncStorage.removeItem(key), 'remove')
}

export async function removeMultipleLocalData(
  keys: StorageKey[]
): Promise<void> {
  await handleStorageOperation(
    () => AsyncStorage.multiRemove(keys),
    'removeMultiple'
  )
}

export async function clearLocalData(): Promise<void> {
  await handleStorageOperation(() => AsyncStorage.clear(), 'clear')
}
