// Shared save/reset helpers for admin pages

export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
    return false
  }
}

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
    return defaultValue
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error)
    return defaultValue
  }
}

export const deepCopy = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj
  }
  try {
    const stringified = JSON.stringify(obj)
    if (stringified === undefined || stringified === 'undefined') {
      return obj
    }
    return JSON.parse(stringified)
  } catch (error) {
    console.error('Error in deepCopy:', error)
    return obj
  }
}

export const hasChanges = <T>(current: T, original: T): boolean => {
  return JSON.stringify(current) !== JSON.stringify(original)
}

export const confirmReset = (hasChanges: boolean): boolean => {
  if (!hasChanges) return true
  
  return window.confirm(
    'Та өөрчлөлтүүдийг хадгалаагүй байна. Буцах уу?\n\nХадгалаагүй өөрчлөлтүүд устах болно.'
  )
}
