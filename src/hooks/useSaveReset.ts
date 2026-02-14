// Custom hook for save/reset functionality with localStorage and API
import { useState, useEffect } from 'react'
import { saveToLocalStorage, loadFromLocalStorage, deepCopy, hasChanges as checkHasChanges, confirmReset } from '@/lib/saveHelpers'

interface UseSaveResetOptions<T> {
  fetcher?: () => Promise<T>
  saver?: (data: T) => Promise<void>
}

export function useSaveReset<T>(storageKey: string, defaultValue: T, options?: UseSaveResetOptions<T>) {
  const [data, setData] = useState<T>(defaultValue)
  const [originalData, setOriginalData] = useState<T>(defaultValue)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load from API or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (options?.fetcher) {
          const apiData = await options.fetcher()
          setData(apiData)
          setOriginalData(deepCopy(apiData))
        } else {
          const saved = loadFromLocalStorage(storageKey, defaultValue)
          setData(saved)
          setOriginalData(deepCopy(saved))
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        // Fallback to localStorage
        const saved = loadFromLocalStorage(storageKey, defaultValue)
        setData(saved)
        setOriginalData(deepCopy(saved))
      }
    }
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      if (options?.saver) {
        await options.saver(data)
      }
      if (saveToLocalStorage(storageKey, data)) {
        setOriginalData(deepCopy(data))
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return true
      } else {
        alert('Хадгалахад алдаа гарлаа')
        return false
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('Хадгалахад алдаа гарлаа')
      return false
    }
  }

  const handleReset = () => {
    const changed = checkHasChanges(data, originalData)
    if (confirmReset(changed)) {
      setData(deepCopy(originalData))
    }
  }

  return {
    data,
    setData,
    saveSuccess,
    handleSave,
    handleReset,
  }
}
