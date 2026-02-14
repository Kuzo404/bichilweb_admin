'use client'

import { useState, useEffect, type DragEvent, type ReactElement, type ReactNode } from 'react'
import AdminLayout from '@/components/AdminLayout'
import ImageUpload from '@/components/ImageUpload'
import Modal from '@/components/Modal'
import { Button, Input, PageHeader } from '@/components/FormElements'
import { SaveResetButtons } from '@/components/SaveResetButtons'
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type FloatingMenuCategoryType = 'loan' | 'contact' | 'other'

interface FloatingMenuIconOption {
  id: string
  label: string
  icon: ReactNode
}

interface FloatingMenuCategory {
  id: string
  name: {
    mn: string
    en: string
  }
  icon: string
  iconUrl?: string
  iconSvg?: string
  color: string
  order: number
  type?: FloatingMenuCategoryType
  font?: string
  bgColor?: string
  textColor?: string
}

interface FloatingMenuItem {
  id: string
  label: {
    mn: string
    en: string
  }
  icon: string
  iconUrl?: string
  iconSvg?: string
  href: string
  categoryId: string
  order: number
  isActive: boolean
  font?: string
  bgColor?: string
  textColor?: string
}

const loanIconExamples: FloatingMenuIconOption[] = [
  {
    id: 'loan-1',
    label: 'Хэтэвч',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 7.5h16.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H3.75A1.5 1.5 0 012.25 15V9a1.5 1.5 0 011.5-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 7.5V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v1.5" />
        <circle cx="17" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'loan-2',
    label: 'Өсөлт',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19.5h18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 15l4.5-4.5 3 3L20.25 6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6h3v3" />
      </svg>
    ),
  },
  {
    id: 'loan-3',
    label: 'Данс',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 6.75h15a1.5 1.5 0 011.5 1.5V15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 15V8.25a1.5 1.5 0 011.5-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 6.75V5.25A2.25 2.25 0 019.75 3h4.5A2.25 2.25 0 0116.5 5.25v1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 12h9" />
      </svg>
    ),
  },
]

const contactIconExamples: FloatingMenuIconOption[] = [
  {
    id: 'contact-1',
    label: 'Байршил',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a8.25 8.25 0 008.25-8.25A8.25 8.25 0 116 16.5" />
        <circle cx="12" cy="12" r="2.25" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 16.5L12 21l3-2.25" />
      </svg>
    ),
  },
  {
    id: 'contact-2',
    label: 'Утас',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5.25a2.25 2.25 0 012.25-2.25h2.4c.93 0 1.74.6 2.04 1.47l1.02 3.06a2.25 2.25 0 01-1.13 2.67l-1.2.6a11.25 11.25 0 005.16 5.16l.6-1.2a2.25 2.25 0 012.67-1.13l3.06 1.02c.87.29 1.47 1.1 1.47 2.04v2.4A2.25 2.25 0 0118.75 21H17a14 14 0 01-14-14V5.25z" />
      </svg>
    ),
  },
  {
    id: 'contact-3',
    label: 'Цахим шуудан',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 5.25h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7.5l9 5.25L21 7.5" />
      </svg>
    ),
  },
]

const otherIconExamples: FloatingMenuIconOption[] = [
  {
    id: 'other-1',
    label: 'Од',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l2.34 4.73 5.16.75-3.75 3.66.89 5.19L12 15.75 7.36 17.33l.89-5.19-3.75-3.66 5.16-.75z" />
      </svg>
    ),
  },
  {
    id: 'other-2',
    label: 'Шоо',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 7.5l7.5-4.5 7.5 4.5v9l-7.5 4.5-7.5-4.5z" />
        <circle cx="12" cy="12" r="1.2" strokeWidth={1.5} />
        <circle cx="8.25" cy="10.5" r="1" strokeWidth={1.5} />
        <circle cx="15.75" cy="10.5" r="1" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    id: 'other-3',
    label: 'Дугуй',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="6.75" strokeWidth={1.5} />
        <circle cx="12" cy="12" r="2.25" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3.75v2.25M12 18v2.25M5.75 12H3.5M20.5 12h-2.25" />
      </svg>
    ),
  },
]

const exampleIconsMap: Record<FloatingMenuCategoryType, FloatingMenuIconOption[]> = {
  loan: loanIconExamples,
  contact: contactIconExamples,
  other: otherIconExamples,
}

// SVG validation helper
const isValidSvg = (svgString: string): boolean => {
  if (!svgString.trim()) return true // empty is ok
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'text/xml')
    // Check for parsing errors
    if (doc.getElementsByTagName('parsererror').length > 0) {
      return false
    }
    // Check if root element is svg
    const rootElement = doc.documentElement
    return rootElement.tagName.toLowerCase() === 'svg' || rootElement.tagName === 'svg'
  } catch {
    return false
  }
}

// ── Icon ID → SVG string lookup map (бүх жишээ дүрсүүдийн SVG strings) ────
const iconIdToSvg: Record<string, string> = {
  'loan-1': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h16.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H3.75A1.5 1.5 0 0 1 2.25 15V9a1.5 1.5 0 0 1 1.5-1.5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 7.5V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v1.5"/><circle cx="17" cy="12" r="1" fill="currentColor"/></svg>',
  'loan-2': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 19.5h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 15l4.5-4.5 3 3L20.25 6"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6h3v3"/></svg>',
  'loan-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 6.75h15a1.5 1.5 0 0 1 1.5 1.5V15a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15V8.25a1.5 1.5 0 0 1 1.5-1.5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 6.75V5.25A2.25 2.25 0 0 1 9.75 3h4.5A2.25 2.25 0 0 1 16.5 5.25v1.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 12h9"/></svg>',
  'contact-1': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>',
  'contact-2': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5.25a2.25 2.25 0 0 1 2.25-2.25h2.4c.93 0 1.74.6 2.04 1.47l1.02 3.06a2.25 2.25 0 0 1-1.13 2.67l-1.2.6a11.25 11.25 0 0 0 5.16 5.16l.6-1.2a2.25 2.25 0 0 1 2.67-1.13l3.06 1.02c.87.29 1.47 1.1 1.47 2.04v2.4A2.25 2.25 0 0 1 18.75 21H17a14 14 0 0 1-14-14V5.25z"/></svg>',
  'contact-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5l9 5.25L21 7.5"/></svg>',
  'other-1': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l2.34 4.73 5.16.75-3.75 3.66.89 5.19L12 15.75 7.36 17.33l.89-5.19-3.75-3.66 5.16-.75z"/></svg>',
  'other-2': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 7.5l7.5-4.5 7.5 4.5v9l-7.5 4.5-7.5-4.5z"/><circle cx="12" cy="12" r="1.2" stroke-width="1.5"/><circle cx="8.25" cy="10.5" r="1" stroke-width="1.5"/><circle cx="15.75" cy="10.5" r="1" stroke-width="1.5"/></svg>',
  'other-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="6.75" stroke-width="1.5"/><circle cx="12" cy="12" r="2.25" stroke-width="1.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 3.75v2.25M12 18v2.25M5.75 12H3.5M20.5 12h-2.25"/></svg>',
}

const loanCategorySvg = iconIdToSvg['loan-1']
const contactCategorySvg = iconIdToSvg['contact-1']

// Дэлгэрэнгүй цэсийн (submenu) товчны icon SVG map
const itemIconIdToSvg: Record<string, string> = {
  'document': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>',
  'calculator': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/></svg>',
  'location': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/></svg>',
}

const defaultCategories: FloatingMenuCategory[] = [
  {
    id: 'loan',
    name: { mn: 'Зээл', en: 'Loan' },
    icon: 'loan-1',
    iconSvg: loanCategorySvg,
    color: '#3b82f6',
    order: 1,
    type: 'loan',
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#0f172a',
  },
  {
    id: 'contact',
    name: { mn: 'Холбоо барих', en: 'Contact' },
    icon: 'contact-1',
    iconSvg: contactCategorySvg,
    color: '#a855f7',
    order: 2,
    type: 'contact',
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#0f172a',
  },
]

const defaultMenus: FloatingMenuItem[] = [
  {
    id: '1',
    label: { mn: 'Зээлийн хүсэлт', en: 'Loan Application' },
    icon: 'document',
    href: '/products/loan-application',
    categoryId: 'loan',
    order: 1,
    isActive: true,
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#374151',
  },
  {
    id: '2',
    label: { mn: 'Тооцоолуур', en: 'Calculator' },
    icon: 'calculator',
    href: '/calculator',
    categoryId: 'loan',
    order: 2,
    isActive: true,
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#374151',
  },
  {
    id: '3',
    label: { mn: 'Салбарууд', en: 'Branches' },
    icon: 'location',
    href: '/branches',
    categoryId: 'contact',
    order: 3,
    isActive: true,
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#374151',
  },
]

// Migration: Convert old data structure to new structure
const migrateMenuData = (data: any[]): FloatingMenuItem[] => {
  return data.map(item => {
    if (item.label && typeof item.label === 'object' && 'mn' in item.label) {
      return item // Already migrated
    }
    // Migrate old structure to new structure
    return {
      ...item,
      label: {
        mn: item.label_mn || item.label || '',
        en: item.label_en || '',
      },
    }
  })
}

const migrateCategoryData = (data: any[]): FloatingMenuCategory[] => {
  return data.map(item => {
    if (item.name && typeof item.name === 'object' && 'mn' in item.name) {
      return item // Already migrated
    }
    // Migrate old structure to new structure
    return {
      ...item,
      name: {
        mn: item.name_mn || '',
        en: item.name_en || '',
      },
    }
  })
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Combined fetcher for both menus and categories (single API call)
const fetchMenuData = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/floating-menu/`)
    const json = await res.json()
    return {
      menus: migrateMenuData(json.items),
      categories: migrateCategoryData(json.categories),
    }
  } catch {
    return {
      menus: defaultMenus,
      categories: defaultCategories,
    }
  }
}

export default function FloatingMenuPage() {
  // Local state for both menus and categories
  const [menus, setMenus] = useState<FloatingMenuItem[]>(defaultMenus)
  const [categories, setCategories] = useState<FloatingMenuCategory[]>(defaultCategories)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load both menus and categories from API on mount (single call)
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMenuData()
      setMenus(data.menus)
      setCategories(data.categories)
    }
    loadData()
  }, [])

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'category' | 'details'>('category')
  const [editingMenu, setEditingMenu] = useState<FloatingMenuItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<FloatingMenuCategory | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FloatingMenuCategory | null>(null)
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)

  // Preview states
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null)

  // Loading and error states
  const [error, setError] = useState<string | null>(null)

  // Form data for menu item
  const [formData, setFormData] = useState({
    label: { mn: '', en: '' },
    icon: 'document',
    iconUrl: '',
    iconSvg: itemIconIdToSvg['document'] || '',
    href: '',
    // TODO: Backend generates IDs and manages order sequences (no manual order input from frontend)
    order: 1,
    isActive: true,
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#374151',
  })

  // Form data for new category
  const [newCategoryData, setNewCategoryData] = useState({
    name: { mn: '', en: '' },
    icon: 'loan-1',
    iconUrl: '',
    iconSvg: '',
    color: '#3b82f6',
    type: 'loan' as 'loan' | 'contact' | 'other',
    font: 'font-sans',
    bgColor: '#ffffff',
    textColor: '#374151',
  })

  const handleOpenCreate = () => {
    setError(null)
    setEditingMenu(null)
    setSelectedCategory(null)
    setShowNewCategoryForm(false)
    setModalStep('category')
    setFormData({
      label: { mn: '', en: '' },
      icon: 'document',
      iconUrl: '',
      iconSvg: itemIconIdToSvg['document'] || '',
      href: '',
      order: menus.length + 1,
      isActive: true,
      font: 'font-sans',
      bgColor: '#ffffff',
      textColor: '#374151',
    })
    setNewCategoryData({
      name: { mn: '', en: '' },
      icon: 'loan-1',
      iconUrl: '',
      iconSvg: '',
      color: '#3b82f6',
      type: 'loan',
      font: 'font-sans',
      bgColor: '#ffffff',
      textColor: '#374151',
    })
    setModalOpen(true)
  }

  const handleSaveWithErrorHandling = async () => {
    try {
      setError(null)
      // Save both categories and items together to API
      const response = await fetch(`${API_BASE}/api/admin/floating-menu/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories,
          items: menus,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Хадгалсны дараа DB-ийн шинэ state-ийг ачаалах (ID-нүүд зөрөхгүй)
      if (result.categories && result.items) {
        setCategories(migrateCategoryData(result.categories))
        setMenus(migrateMenuData(result.items))
      }
      
      // Show success message
      setSaveSuccess(true)
      setError(null)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Хадгалахад алдаа гарлаа'
      setError(message)
      console.error('Save error:', err)
    }
  }

  const handleEdit = (menu: FloatingMenuItem) => {
    setEditingMenu(menu)
    const category = categories.find(c => c.id === menu.categoryId)
    setSelectedCategory(category || null)
    setShowNewCategoryForm(false)
    setModalStep('details')
    setFormData({
      label: menu.label,
      icon: menu.icon,
      iconUrl: menu.iconUrl || '',
      iconSvg: menu.iconSvg || itemIconIdToSvg[menu.icon] || '',
      href: menu.href,
      order: menu.order,
      isActive: menu.isActive,
      font: menu.font || 'font-sans',
      bgColor: menu.bgColor || '#ffffff',
      textColor: menu.textColor || '#374151',
    })
    setModalOpen(true)
  }

  const handleCategorySelect = (category: FloatingMenuCategory) => {
    setSelectedCategory(category)
    setShowNewCategoryForm(false)
    setModalStep('details')
  }

  const handleCreateNewCategory = () => {
    if (!newCategoryData.name.mn || !newCategoryData.name.en) {
      alert('Бүлгийн нэр оруулна уу')
      return
    }
    if (newCategoryData.iconSvg && !isValidSvg(newCategoryData.iconSvg)) {
      setError('SVG код хүчинтэй биш. Зөв SVG кодыг оруулна уу.')
      return
    }

    const trimmedSvg = newCategoryData.iconSvg.trim()

    const newCategory: FloatingMenuCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryData.name,
      icon: newCategoryData.icon,
      iconUrl: newCategoryData.iconUrl || undefined,
      iconSvg: trimmedSvg ? trimmedSvg : undefined,
      color: newCategoryData.color,
      order: categories.length + 1,
      type: newCategoryData.type,
      font: newCategoryData.font,
      bgColor: newCategoryData.bgColor,
      textColor: newCategoryData.textColor,
    }

    setCategories([...categories, newCategory])
    setSelectedCategory(newCategory)
    setShowNewCategoryForm(false)
    setModalStep('details')
  }

  const handleDeleteCategory = (id: string) => {
    const orphanMenus = menus.filter(m => m.categoryId === id)
    const message = orphanMenus.length > 0
      ? `${orphanMenus.length} цэс идэвхгүй болно. Категорийг устгах уу?`
      : 'Категорийг устгах уу?'
    
    if (!confirm(message)) return
    
    // Remove category
    setCategories(categories.filter(c => c.id !== id))
    // Remove orphan menus to prevent data inconsistency
    setMenus(menus.filter(m => m.categoryId !== id))
    setSelectedCategory(null)
  }

  const handleEditCategory = (category: FloatingMenuCategory) => {
    setEditingCategory(category)
    setNewCategoryData({
      name: category.name,
      icon: category.icon,
      iconUrl: category.iconUrl || '',
      iconSvg: category.iconSvg || '',
      color: category.color,
      type: category.type || 'loan',
      font: category.font || 'font-sans',
      bgColor: category.bgColor || '#ffffff',
      textColor: category.textColor || '#374151',
    })
    setModalStep('category')
    setShowNewCategoryForm(true)
    setModalOpen(true)
  }

  const handleUpdateCategory = () => {
    if (!newCategoryData.name.mn || !newCategoryData.name.en) {
      alert('Бүлгийн нэр оруулна уу')
      return
    }
    if (newCategoryData.iconSvg && !isValidSvg(newCategoryData.iconSvg)) {
      setError('SVG код хүчинтэй биш. Зөв SVG кодыг оруулна уу.')
      return
    }

    if (editingCategory) {
      const trimmedSvg = newCategoryData.iconSvg.trim()

      const updatedCategory: FloatingMenuCategory = {
        ...editingCategory,
        name: newCategoryData.name,
        icon: newCategoryData.icon,
        iconUrl: newCategoryData.iconUrl || undefined,
        iconSvg: trimmedSvg ? trimmedSvg : undefined,
        color: newCategoryData.color,
        type: newCategoryData.type,
        font: newCategoryData.font,
        bgColor: newCategoryData.bgColor,
        textColor: newCategoryData.textColor,
      }

      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? updatedCategory
          : c
      ))
      if (selectedCategory?.id === editingCategory.id) {
        setSelectedCategory(updatedCategory)
      }
      setModalOpen(false)
      setEditingCategory(null)
      setShowNewCategoryForm(false)
      setNewCategoryData({
        name: { mn: '', en: '' },
        icon: 'loan-1',
        iconUrl: '',
        iconSvg: '',
        color: '#3b82f6',
        type: 'loan',
        font: 'font-sans',
        bgColor: '#ffffff',
        textColor: '#374151',
      })
    }
  }

  const handleSave = () => {
    if (!selectedCategory) {
      alert('Бүлэг сонгоно уу')
      return
    }

    if (!formData.label.mn || !formData.label.en || !formData.href) {
      alert('Нэр (MN/EN) болон холбоос оруулна уу')
      return
    }

    if (formData.iconSvg && !isValidSvg(formData.iconSvg)) {
      setError('SVG код хүчинтэй биш. Зөв SVG кодыг оруулна уу.')
      return
    }

    const sanitizedFormData = {
      ...formData,
      iconSvg: formData.iconSvg.trim(),
    }

    if (editingMenu) {
      setMenus(menus.map(m => 
        m.id === editingMenu.id 
          ? { ...m, ...sanitizedFormData, categoryId: selectedCategory.id }
          : m
      ))
    } else {
      const newMenu: FloatingMenuItem = {
        id: Date.now().toString(),
        ...sanitizedFormData,
        categoryId: selectedCategory.id,
      }
      setMenus([...menus, newMenu])
    }

    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Устгах уу?')) return
    setMenus(menus.filter(m => m.id !== id))
  }

  const handleMoveUp = (id: string) => {
    const sortedMenus = [...menus].sort((a, b) => a.order - b.order)
    const index = sortedMenus.findIndex(m => m.id === id)
    if (index <= 0) return
    
    const newMenus = [...sortedMenus]
    const temp = newMenus[index].order
    newMenus[index].order = newMenus[index - 1].order
    newMenus[index - 1].order = temp
    
    setMenus(newMenus.sort((a, b) => a.order - b.order))
  }

  const handleMoveDown = (id: string) => {
    const sortedMenus = [...menus].sort((a, b) => a.order - b.order)
    const index = sortedMenus.findIndex(m => m.id === id)
    if (index >= sortedMenus.length - 1) return
    
    const newMenus = [...sortedMenus]
    const temp = newMenus[index].order
    newMenus[index].order = newMenus[index + 1].order
    newMenus[index + 1].order = temp
    
    setMenus(newMenus.sort((a, b) => a.order - b.order))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const sortedMenus = [...menus].sort((a, b) => a.order - b.order)
    const draggedMenu = sortedMenus[draggedIndex]
    const targetMenu = sortedMenus[index]
    
    const newMenus = sortedMenus.map(menu => {
      if (menu.id === draggedMenu.id) {
        return { ...menu, order: targetMenu.order }
      }
      if (draggedIndex < index) {
        if (menu.order > draggedMenu.order && menu.order <= targetMenu.order) {
          return { ...menu, order: menu.order - 1 }
        }
      } else {
        if (menu.order >= targetMenu.order && menu.order < draggedMenu.order) {
          return { ...menu, order: menu.order + 1 }
        }
      }
      return menu
    })
    
    setMenus(newMenus.sort((a, b) => a.order - b.order))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Category reordering functions
  const handleMoveCategoryUp = (id: string) => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
    const index = sortedCategories.findIndex(c => c.id === id)
    if (index <= 0) return
    
    const newCategories = [...sortedCategories]
    const temp = newCategories[index].order
    newCategories[index].order = newCategories[index - 1].order
    newCategories[index - 1].order = temp
    
    setCategories(newCategories.sort((a, b) => a.order - b.order))
  }

  const handleMoveCategoryDown = (id: string) => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
    const index = sortedCategories.findIndex(c => c.id === id)
    if (index >= sortedCategories.length - 1) return
    
    const newCategories = [...sortedCategories]
    const temp = newCategories[index].order
    newCategories[index].order = newCategories[index + 1].order
    newCategories[index + 1].order = temp
    
    setCategories(newCategories.sort((a, b) => a.order - b.order))
  }

  const handleDragCategoryStart = (index: number) => {
    setDraggedCategoryIndex(index)
  }

  const handleDragCategoryOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedCategoryIndex === null || draggedCategoryIndex === index) return
    
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
    const draggedCategory = sortedCategories[draggedCategoryIndex]
    const targetCategory = sortedCategories[index]
    
    const newCategories = sortedCategories.map(category => {
      if (category.id === draggedCategory.id) {
        return { ...category, order: targetCategory.order }
      }
      if (draggedCategoryIndex < index) {
        if (category.order > draggedCategory.order && category.order <= targetCategory.order) {
          return { ...category, order: category.order - 1 }
        }
      } else {
        if (category.order >= targetCategory.order && category.order < draggedCategory.order) {
          return { ...category, order: category.order + 1 }
        }
      }
      return category
    })
    
    setCategories(newCategories.sort((a, b) => a.order - b.order))
    setDraggedCategoryIndex(index)
  }

  const handleDragCategoryEnd = () => {
    setDraggedCategoryIndex(null)
  }

  return (
    <AdminLayout title="Хөвөгч цэс">
      <div className="max-w-5xl mx-auto">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-900">Амжилттай хадгалагдлаа!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">Өөрчлөлтүүд хадгалагдсан.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">Алдаа гарлаа</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}
        
        <PageHeader
          title="Хөвөгч цэс удирдлага"
          description="Дэлгэцийн доод хэсэгт харагдах хурдан холбоосууд · 🖋️ Чирж байршил солино"
          action={
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  handleOpenCreate()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-md text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Шинэ цэс нэмэх
              </button>
              <SaveResetButtons 
                onSave={handleSaveWithErrorHandling}
                onReset={() => {
                  if (window.confirm('Та үүний өмнөх төлөвт эргүүлэхдээ итгэлтэй байна уу?')) {
                    window.location.reload()
                  }
                }}
                showSuccess={saveSuccess}
                confirmMessage="Та хадгалахдаа итгэлтэй байна уу?"
              />
            </div>
          }
        />

        {/* Live Preview */}
        {categories.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-linear-to-b from-slate-100 to-slate-50">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Live Preview - Dropdown
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    onClick={() => setPreviewLang('mn')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      previewLang === 'mn'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    MN
                  </button>
                  <button
                    onClick={() => setPreviewLang('en')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      previewLang === 'en'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    EN
                  </button>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  🖱️ Hover хийнэ үү
                </span>
              </div>
            </div>
            
            <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-[350px] relative">
              {/* Floating Menu Preview - Center Bottom with Dropdowns */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-3">
                  {/* Group menus by category — бүх категориуд харагдана */}
                  {categories
                    .map((category, groupIndex) => {
                      const categoryMenus = menus.filter(m => m.isActive && m.categoryId === category.id)
                      
                      const isHovered = hoveredMenu === (previewLang === 'mn' ? category.name.mn : category.name.en)
                      
                      return (
                        <div 
                          key={category.id}
                          className="relative"
                          onMouseEnter={() => setHoveredMenu(previewLang === 'mn' ? category.name.mn : category.name.en)}
                          onMouseLeave={() => setHoveredMenu(null)}
                        >
                          {/* Main Button */}
                          <button 
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all border hover:scale-105 ${category.font || 'font-sans'}`}
                            style={{
                              backgroundColor: category.bgColor || '#ffffff',
                              color: category.textColor || '#374151',
                              opacity: 0.95
                            }}
                          >
                            {category.iconSvg ? (
                              <div
                                className="w-5 h-5 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: category.iconSvg }}
                              />
                            ) : category.iconUrl ? (
                              <img src={category.iconUrl} alt="Category icon" className="w-5 h-5 object-contain" />
                            ) : category.icon ? (
                              <div className="w-5 h-5 flex items-center justify-center" style={{ color: category.color }}>
                                {(category.type ? exampleIconsMap[category.type] : exampleIconsMap['loan'])?.find(i => i.id === category.icon)?.icon}
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded" style={{ backgroundColor: category.color }}></div>
                            )}
                            <span className="text-sm font-medium">
                              {previewLang === 'mn' ? category.name.mn : category.name.en}
                            </span>
                            <svg className={`w-4 h-4 transition-transform ${isHovered ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Dropdown — зөвхөн items байвал харуулна */}
                          {categoryMenus.length > 0 && (
                          <div className={`absolute bottom-full ${groupIndex === 0 ? 'left-0' : 'right-0'} mb-2 transition-all duration-200 ${
                            isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
                          }`}>
                            <div className="bg-white rounded-xl shadow-xl p-2 min-w-[200px] border border-gray-100">
                              {categoryMenus.map((menu) => {
                                const iconMap: Record<string, ReactElement> = {
                                  document: (
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  ),
                                  calculator: (
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                  ),
                                  location: (
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  ),
                                }
                                
                                return (
                                  <div
                                    key={menu.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer ${menu.font || 'font-sans'}`}
                                    style={{ color: menu.textColor || '#374151' }}
                                  >
                                    {menu.iconSvg ? (
                                      <div
                                        className="w-5 h-5 flex items-center justify-center"
                                        dangerouslySetInnerHTML={{ __html: menu.iconSvg }}
                                      />
                                    ) : menu.iconUrl ? (
                                      <img src={menu.iconUrl} alt="Custom icon" className="w-5 h-5 object-contain" />
                                    ) : (
                                      iconMap[menu.icon] || iconMap.document
                                    )}
                                    <span className="text-sm font-medium">
                                      {previewLang === 'mn' ? menu.label.mn : menu.label.en}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          )}
                        </div>
                      )
                    })}
                
                </div>
              </div>
              
              <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                   Товч дээр hover хийхэд dropdown харагдана
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Cards */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {menus
            .sort((a, b) => a.order - b.order)
            .map((menu, index) => (
              <div
                key={menu.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative bg-white rounded-xl border-2 p-5 transition-all cursor-move ${
                  draggedIndex === index 
                    ? 'border-teal-500 shadow-lg scale-105 opacity-50' 
                    : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                }`}
              >
                {/* Drag Handle Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full">
                      #{menu.order}
                    </span>
                    {categories.find(c => c.id === menu.categoryId) && (
                      <span 
                        className="px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 text-white"
                        style={{ backgroundColor: categories.find(c => c.id === menu.categoryId)?.color }}
                      >
                        {categories.find(c => c.id === menu.categoryId)?.name.mn}
                      </span>
                    )}
                    {!menu.isActive && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-500 rounded-full">
                        Идэвхгүй
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(menu.id)}
                      className="p-1.5 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                      title="Дээш"
                    >
                      <ChevronUpIcon className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(menu.id)}
                      className="p-1.5 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                      title="Доош"
                    >
                      <ChevronDownIcon className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      {menu.iconSvg ? (
                        <div
                          className="w-8 h-8 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: menu.iconSvg }}
                        />
                      ) : menu.iconUrl ? (
                        <img src={menu.iconUrl} alt="Custom icon" className="w-8 h-8 object-contain" />
                      ) : (
                        <>
                          {menu.icon === 'document' && (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {menu.icon === 'calculator' && (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {menu.icon === 'location' && (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </>
                      )}
                      <h3 className="text-base font-semibold text-slate-900">
                        {menu.label.mn}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{menu.label.en}</p>

                    {/* Link */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <code className="bg-slate-50 px-2 py-0.5 rounded">{menu.href}</code>
                    </div>
                    
                    {/* Font & Colors */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                        {menu.font || 'font-sans'}
                      </span>
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-5 h-5 rounded border-2 border-slate-200 shadow-sm"
                          style={{ backgroundColor: menu.bgColor }}
                          title={`Арын өнгө: ${menu.bgColor}`}
                        />
                        <div 
                          className="w-5 h-5 rounded border-2 border-slate-200 shadow-sm"
                          style={{ backgroundColor: menu.textColor }}
                          title={`Текст: ${menu.textColor}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Засах"
                    >
                      <PencilIcon className="h-4 w-4 text-teal-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Устгах"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Management */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Бүлгүүдийн удирдлага</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {categories
              .sort((a, b) => a.order - b.order)
              .map((category, index) => (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragCategoryStart(index)}
                  onDragOver={(e) => handleDragCategoryOver(e, index)}
                  onDragEnd={handleDragCategoryEnd}
                  className={`group relative bg-white rounded-xl border-2 p-4 transition-all cursor-move ${
                    draggedCategoryIndex === index 
                      ? 'border-teal-500 shadow-lg scale-105 opacity-50' 
                      : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                  }`}
                >
                  {/* Drag Handle Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab active:cursor-grabbing">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                        #{category.order}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveCategoryUp(category.id)}
                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                        title="Дээш"
                      >
                        <ChevronUpIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleMoveCategoryDown(category.id)}
                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                        title="Доош"
                      >
                        <ChevronDownIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-teal-50 transition-colors"
                        title="Засах"
                      >
                        <PencilIcon className="h-4 w-4 text-teal-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-red-50 transition-colors"
                        title="Устгах"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Icon and Name */}
                      <div className="flex items-center gap-3 mb-2">
                        {category.iconSvg ? (
                          <div
                            className="w-10 h-10 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: category.iconSvg }}
                          />
                        ) : category.iconUrl ? (
                          <img src={category.iconUrl} alt="Category icon" className="w-10 h-10 object-contain" />
                        ) : category.type && exampleIconsMap[category.type]?.[0] ? (
                          <div className="text-xl" style={{ color: category.color }}>
                            {exampleIconsMap[category.type][0].icon}
                          </div>
                        ) : (
                          <div 
                            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.mn.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">
                            {category.name.mn}
                          </h4>
                          <p className="text-sm text-slate-500">{category.name.en}</p>
                        </div>
                      </div>

                      {/* Color & Menu Count */}
                      <div className="flex items-center gap-3 mt-3">
                        <div 
                          className="w-5 h-5 rounded border-2 border-slate-200 shadow-sm"
                          style={{ backgroundColor: category.color }}
                          title={`Өнгө: ${category.color}`}
                        />
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                          {menus.filter(m => m.categoryId === category.id).length} цэс
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Helper Text */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Хэрэглэгчийн заавар</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Цэсний эрэмбэ тоогоор тодорхойлогдоно</li>
                <li>• Хөвөгч цэс нь дэлгэцийн доод талд харагдана</li>
                <li>• Холбоосууд dropdown-оор бүлэглэгдэнэ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCategory(null)
          setShowNewCategoryForm(false)
        }}
        title={modalStep === 'category' ? (editingMenu ? 'Цэс засах' : 'Шинэ цэс нэмэх - Алхам 1: Бүлэг сонгох') : (editingMenu ? 'Цэс засах' : editingCategory ? 'Бүлэг засах' : 'Шинэ цэс нэмэх - Алхам 2: Дэлгэрэнгүй')}
      >
        {modalStep === 'category' ? (
          // Step 1: Category Selection
          <div className="space-y-4">
            {!showNewCategoryForm ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Одоо байгаа бүлэг сонгох
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          selectedCategory?.id === category.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {category.iconSvg ? (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: category.iconSvg }}
                          />
                        ) : category.iconUrl ? (
                          <img src={category.iconUrl} alt="Category icon" className="w-8 h-8 object-contain" />
                        ) : (
                          <div style={{ color: category.color }}>
                            {exampleIconsMap[category.type ?? 'loan']?.[0]?.icon}
                          </div>
                        )}
                        <div className="text-center">
                          <p className={`text-sm font-semibold ${selectedCategory?.id === category.id ? 'text-teal-700' : 'text-slate-700'}`}>
                            {category.name.mn}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {category.name.en}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500">эсвэл</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(true)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-700 transition-colors text-sm font-medium"
                >
                  + Шинэ бүлэг үүсгэх
                </button>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setModalOpen(false)
                      setEditingCategory(null)
                      setShowNewCategoryForm(false)
                    }}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Болих
                  </button>
                  <Button 
                    variant="dark" 
                    onClick={() => selectedCategory && setModalStep('details')}
                    disabled={!selectedCategory}
                  >
                    Үргэлжүүлэх
                  </Button>
                </div>
              </>
            ) : (
              // New Category Form
              <>
                {/* Preview section - LIVE DROPDOWN DISPLAY */}
                <div className="mb-6 p-5 bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 rounded-xl border-2 border-teal-300 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-teal-700 uppercase tracking-widest"> Live Preview - Dropdown</label>
                    <span className="text-xs px-2 py-1 bg-teal-200 text-teal-800 rounded-full font-semibold">Real-time</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap p-4 bg-white rounded-lg border border-teal-100">
                    <button 
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all border hover:scale-105 ${newCategoryData.font || 'font-sans'}`}
                      style={{
                        backgroundColor: newCategoryData.bgColor || '#ffffff',
                        color: newCategoryData.textColor || '#374151',
                        opacity: 0.95,
                        borderColor: '#d1d5db'
                      }}
                    >
                      {newCategoryData.iconUrl ? (
                        <img src={newCategoryData.iconUrl} alt="Category icon" className="w-5 h-5 object-contain" />
                      ) : newCategoryData.icon ? (
                        <div className="w-5 h-5 flex items-center justify-center" style={{ color: newCategoryData.color }}>
                          {(newCategoryData.type ? exampleIconsMap[newCategoryData.type] : exampleIconsMap['loan'])?.find(i => i.id === newCategoryData.icon)?.icon}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: newCategoryData.color }}></div>
                      )}
                      <span className="text-sm font-medium">
                        {newCategoryData.name.mn || 'Бүлэг нэр'}
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="text-lg text-teal-400 font-bold">→</div>
                    <div className="bg-white rounded-xl shadow-lg p-3 min-w-[220px] border border-gray-100">
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                        {newCategoryData.iconUrl ? (
                          <img src={newCategoryData.iconUrl} alt="Menu icon" className="w-5 h-5 object-contain" />
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        <span className="text-sm font-semibold">Sample Menu Item</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview section */}
                <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Урьдчилсан үзүүлэлт</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                    {newCategoryData.iconUrl ? (
                      <img src={newCategoryData.iconUrl} alt="Preview" className="w-12 h-12 object-contain" />
                    ) : newCategoryData.icon ? (
                      <div className="w-12 h-12 flex items-center justify-center text-2xl" style={{ color: newCategoryData.color }}>
                        {(newCategoryData.type ? exampleIconsMap[newCategoryData.type] : exampleIconsMap['loan'])?.find(i => i.id === newCategoryData.icon)?.icon}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: newCategoryData.color }}>
                        {(newCategoryData.name.mn || 'N').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{newCategoryData.name.mn || 'Нэр оруулна уу'}</p>
                      <p className="text-xs text-slate-500">{newCategoryData.name.en || 'Name'}</p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded border-2 border-slate-300 shrink-0"
                      style={{ backgroundColor: newCategoryData.color }}
                      title={`Өнгө: ${newCategoryData.color}`}
                    />
                  </div>
                </div>

                <Input
                  label="Бүлгийн нэр (Монгол)"
                  value={newCategoryData.name.mn}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: { ...newCategoryData.name, mn: e.target.value } })}
                  placeholder="Зээл"
                />

                <Input
                  label="Бүлгийн нэр (English)"
                  value={newCategoryData.name.en}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: { ...newCategoryData.name, en: e.target.value } })}
                  placeholder="Loan"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Бүлгийн өнгө
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newCategoryData.color}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                      className="w-16 h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-slate-600">{newCategoryData.color}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Фонт
                    </label>
                    <select
                      value={newCategoryData.font}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, font: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="font-sans">Sans Serif</option>
                      <option value="font-serif">Serif</option>
                      <option value="font-mono">Monospace</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Арын өнгө
                    </label>
                    <input
                      type="color"
                      value={newCategoryData.bgColor}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, bgColor: e.target.value })}
                      className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Текстийн өнгө
                    </label>
                    <input
                      type="color"
                      value={newCategoryData.textColor}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, textColor: e.target.value })}
                      className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Дүрс оруулах / сонгох
                  </label>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Өөрийн дүрс оруулах
                    </label>
                    <div className={`rounded-lg border-2 transition-all ${
                      newCategoryData.iconUrl 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-slate-200'
                    }`}>
                      <ImageUpload
                        label=""
                        value={newCategoryData.iconUrl}
                        onChange={(url) => setNewCategoryData({ ...newCategoryData, iconUrl: url, iconSvg: '' })}
                      />
                    </div>
                    {newCategoryData.iconUrl && (
                      <div className="mt-2 p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={newCategoryData.iconUrl} 
                            alt="Custom icon" 
                            className="w-8 h-8 object-contain"
                          />
                          <span className="text-sm text-teal-700">Сонгосон дүрс</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewCategoryData({ ...newCategoryData, iconUrl: '' })}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                        >
                          Цэвэрлэх
                        </button>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-xs font-medium text-slate-600 mb-2">
                        SVG код оруулах
                      </label>
                      <textarea
                        value={newCategoryData.iconSvg}
                        onChange={(e) => {
                          const svgValue = e.target.value
                          setNewCategoryData({
                            ...newCategoryData,
                            iconSvg: svgValue,
                            iconUrl: '',
                          })
                        }}
                        placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; ...>...</svg>"
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        SVG кодыг шууд буулгаж оруулна. Скрипт болон гаднын аттрибутуудыг автоматаар хадгалахгүй гэдгийг анхаарна уу.
                      </p>
                      {newCategoryData.iconSvg?.trim() && (
                        <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-teal-200 bg-white">
                              <div
                                className="w-8 h-8 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: newCategoryData.iconSvg }}
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-teal-700">SVG дүрс идэвхтэй</p>
                              <p className="text-xs text-teal-600">Энэ дүрс бүлэг дээр харагдана</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewCategoryData({
                              ...newCategoryData,
                              iconSvg: '',
                            })}
                            className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                          >
                            SVG арилгах
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-slate-500">эсвэл жишээ сонгох</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Бүлгийн төрөл сонгох (жишээ авахын тулд)
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setNewCategoryData({ ...newCategoryData, type: 'loan', icon: 'loan-1', iconUrl: '', iconSvg: iconIdToSvg['loan-1'] || '' })}
                        className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          newCategoryData.type === 'loan'
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        Зээл
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCategoryData({ ...newCategoryData, type: 'contact', icon: 'contact-1', iconUrl: '', iconSvg: iconIdToSvg['contact-1'] || '' })}
                        className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          newCategoryData.type === 'contact'
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        Холбоо барих
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Дүрс сонгох (3 жишээ)
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(newCategoryData.type ? exampleIconsMap[newCategoryData.type] : exampleIconsMap['loan'])?.map((iconOption) => (
                        <button
                          key={iconOption.id}
                          type="button"
                          onClick={() => setNewCategoryData({ ...newCategoryData, icon: iconOption.id, iconUrl: '', iconSvg: iconIdToSvg[iconOption.id] || '' })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            newCategoryData.icon === iconOption.id && !newCategoryData.iconUrl && !newCategoryData.iconSvg
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {iconOption.icon}
                          <span className="text-xs font-medium text-center">{iconOption.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowNewCategoryForm(false)
                      if (editingCategory) {
                        setEditingCategory(null)
                        setModalOpen(false)
                      }
                    }}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Буцах
                  </button>
                  <Button 
                    variant="dark" 
                    onClick={editingCategory ? handleUpdateCategory : handleCreateNewCategory}
                  >
                    {editingCategory ? 'Шинэчлэх' : 'Үүсгэх'}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          // Step 2: Menu Item Details
          <div className="space-y-4">
            {selectedCategory && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600">Сонгогдсон бүлэг:</p>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <p className="font-medium text-slate-700">{selectedCategory.name.mn}</p>
                </div>
              </div>
            )}

            {/* Live Preview - Dropdown for Menu Editing */}
            <div className="mb-6 p-5 bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 rounded-xl border-2 border-teal-300 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-teal-700 uppercase tracking-widest">Live Preview - Dropdown</label>
                <span className="text-xs px-2 py-1 bg-teal-200 text-teal-800 rounded-full font-semibold">Real-time</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap p-4 bg-white rounded-lg border border-teal-100">
                <button 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all border hover:scale-105 ${selectedCategory?.font || 'font-sans'}`}
                  style={{
                    backgroundColor: selectedCategory?.bgColor || '#ffffff',
                    color: selectedCategory?.textColor || '#374151',
                    opacity: 0.95,
                    borderColor: '#d1d5db'
                  }}
                >
                  {selectedCategory?.iconSvg ? (
                    <div
                      className="w-5 h-5 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: selectedCategory.iconSvg }}
                    />
                  ) : selectedCategory?.iconUrl ? (
                    <img src={selectedCategory.iconUrl} alt="Category icon" className="w-5 h-5 object-contain" />
                  ) : selectedCategory?.icon ? (
                    <div className="text-lg" style={{ color: selectedCategory.color }}>
                      {(selectedCategory.type ? exampleIconsMap[selectedCategory.type] : exampleIconsMap['loan'])?.find(i => i.id === selectedCategory.icon)?.icon}
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: selectedCategory?.color }} />
                  )}
                  <span className="text-sm font-medium">
                    {selectedCategory?.name.mn || 'Бүлэг'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="text-lg text-teal-400 font-bold">→</div>
                <div className={`bg-white rounded-xl shadow-lg p-3 min-w-[220px] border border-gray-100 ${formData.font || 'font-sans'}`}>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: formData.textColor || '#374151', backgroundColor: formData.bgColor || '#ffffff' }}>
                    {formData.iconSvg ? (
                      <div
                        className="w-5 h-5 shrink-0 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: formData.iconSvg }}
                      />
                    ) : formData.iconUrl ? (
                      <img src={formData.iconUrl} alt="Menu icon" className="w-5 h-5 object-contain shrink-0" />
                    ) : formData.icon === 'document' ? (
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : formData.icon === 'calculator' ? (
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ) : formData.icon === 'location' ? (
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{formData.label.mn || 'Цэсний нэр'}</p>
                      <p className="text-xs opacity-75">{formData.label.en || 'Menu label'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Нэр (Монгол)"
              value={formData.label.mn}
              onChange={(e) => setFormData({ ...formData, label: { ...formData.label, mn: e.target.value } })}
              placeholder="Зээлийн хүсэлт"
            />

            <Input
              label="Нэр (English)"
              value={formData.label.en}
              onChange={(e) => setFormData({ ...formData, label: { ...formData.label, en: e.target.value } })}
              placeholder="Loan Application"
            />

            <Input
              label="Холбоос"
              value={formData.href}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              placeholder="/products/loan-application"
            />

            {/* Icon Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Дүрс сонгох
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { value: 'document', label: 'Баримт', icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )},
                  { value: 'calculator', label: 'Тооцоолуур', icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )},
                  { value: 'location', label: 'Байршил', icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  )},
                ].map((iconOption) => (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconOption.value, iconUrl: '', iconSvg: itemIconIdToSvg[iconOption.value] || '' })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.icon === iconOption.value && !formData.iconUrl && !formData.iconSvg
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {iconOption.icon}
                    <span className="text-xs font-medium">{iconOption.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-500">эсвэл</span>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Өөрийн дүрс оруулах
                </label>
                <div className={`rounded-lg border-2 transition-all ${
                  formData.iconUrl 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-slate-200'
                }`}>
                  <ImageUpload
                    label=""
                    value={formData.iconUrl}
                    onChange={(url) => setFormData({ ...formData, iconUrl: url, icon: 'custom', iconSvg: '' })}
                  />
                </div>
                {formData.iconUrl && (
                  <div className="mt-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center gap-2">
                      <img 
                        src={formData.iconUrl} 
                        alt="Custom icon" 
                        className="w-8 h-8 object-contain"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-teal-700">Өөрийн дүрс сонгогдсон</p>
                        <p className="text-xs text-teal-600">Энэ дүрс ашиглагдана</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, iconUrl: '', iconSvg: '', icon: 'document' })}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SVG код оруулах
                  </label>
                  <textarea
                    value={formData.iconSvg}
                    onChange={(e) => {
                      const svgValue = e.target.value
                      setFormData({
                        ...formData,
                        iconSvg: svgValue,
                        iconUrl: '',
                      })
                    }}
                    placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; ...>...</svg>"
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    SVG кодыг шууд холбож болно. Хэт том эсвэл script агуулсан SVG-г ашиглахгүй байхыг зөвлөе.
                  </p>
                  {formData.iconSvg?.trim() && (
                    <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-teal-200 bg-white">
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: formData.iconSvg }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-teal-700">SVG дүрс сонгогдсон</p>
                          <p className="text-xs text-teal-600">Энэ дүрс модулиудад харагдана</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, iconSvg: '' })}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          SVG арилгах
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Category Styling */}
              <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                   Бүлгийн тохиргоо
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-900 mb-1">
                      Бүлгийн Фонт
                    </label>
                    <div className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-amber-900 text-sm">
                      {selectedCategory?.font === 'font-serif' ? 'Serif' : selectedCategory?.font === 'font-mono' ? 'Monospace' : 'Sans Serif'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-900 mb-1">
                      Бүлгийн Арын өнгө
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-8 h-8 border border-amber-300 rounded"
                        style={{ backgroundColor: selectedCategory?.bgColor || '#ffffff' }}
                      />
                      <span className="text-xs text-amber-900">{selectedCategory?.bgColor || '#ffffff'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-900 mb-1">
                      Бүлгийн Текст өнгө
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-8 h-8 border border-amber-300 rounded"
                        style={{ backgroundColor: selectedCategory?.textColor || '#374151' }}
                      />
                      <span className="text-xs text-amber-900">{selectedCategory?.textColor || '#374151'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Item Styling */}
              <div className="p-4 bg-linear-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                <h3 className="text-sm font-bold text-teal-900 mb-3 flex items-center gap-2">
                   Цэсний тохиргоо
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Цэсний Фонт
                    </label>
                    <select
                      value={formData.font}
                      onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="font-sans">Sans Serif</option>
                      <option value="font-serif">Serif</option>
                      <option value="font-mono">Monospace</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Цэсний Арын өнгө
                    </label>
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Цэс  Текст өнгө
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order is managed via drag/moveUp/moveDown only, not manually editable */}
            {/* 
            <Input
              label="Эрэмбэ"
              type="number"
              value={formData.order.toString()}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
              }
            />
            */}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setModalStep('category')
                  setSelectedCategory(null)
                  setShowNewCategoryForm(false)
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Буцах
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Болих
              </button>
              <Button variant="dark" onClick={handleSave}>
                Хадгалах
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

