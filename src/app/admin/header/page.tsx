'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Modal from '@/components/Modal'
import { Input, Select, Checkbox, Button, PageHeader } from '@/components/FormElements'
import { PlusIcon, TrashIcon, PencilIcon, SwatchIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import ImageUpload from '@/components/ImageUpload'

// ============================================================================
// API TYPES - Backend format
// ============================================================================

interface Translation {
  id?: number
  label: string
  language_id: number // 1 = English, 2 = Mongolian
}

interface TertiaryMenu {
  id?: number
  path: string
  font: string
  index: number
  visible: number
  translations: Translation[]
}

interface Submenu {
  id?: number
  path: string
  font: number | string
  index: number
  visible: number
  translations: Translation[]
  tertiary_menus: TertiaryMenu[]
}

interface Menu {
  id?: number
  path: string
  font: number | string
  index: number
  visible: number
  translations: Translation[]
  submenus: Submenu[]
}

interface HeaderStyle {
  id?: number
  bgcolor: string
  fontcolor: string
  hovercolor: string
  height: number
  sticky: number
  max_width?: string
  logo_size?: number
}

interface HeaderData {
  id?: number
  logo: string
  active: number
  styles: HeaderStyle[]
  menus: Menu[]
}

// ============================================================================
// INTERNAL TYPES - Component working format
// ============================================================================

interface MenuItem {
  id: string
  title_mn: string
  title_en: string
  href: string
  order: number
  isActive: boolean
  parentId: string | null
  font?: string
  textColor?: string
  level?: number
}

interface InternalHeaderStyle {
  backgroundColor: string
  textColor: string
  hoverColor: string
  height: string
  isSticky: boolean
  logoUrl: string
  logoText: string
  maxWidth: string
  logoSize: number
}

interface LogoHistoryItem {
  id: number
  url: string
  created_at: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Use Next.js API route instead of hardcoded backend URL
const API_BASE_URL = '/api/admin/header-menu'

const defaultHeaderStyle: InternalHeaderStyle = {
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  hoverColor: '#0d9488',
  height: '80px',
  isSticky: true,
  logoUrl: '',
  logoText: 'BichilGlobus',
  maxWidth: '1240px',
  logoSize: 44,
}

const initialMenuItem = {
  title_mn: '',
  title_en: '',
  href: '',
  order: 0,
  isActive: true,
  parentId: null as string | null,
  font: 'font-sans',
  textColor: '#1f2937',
}

// ============================================================================
// Django backend-ийн URL (Бүтээгдэхүүн, үйлчилгээ татахад ашиглана)
// ============================================================================
const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

// ============================================================================
// Өгөгдлийн сангаас татах хуудсын сонголтуудын төрлүүд
// ============================================================================
interface CategoryTranslation { language: number; label: string }
interface ProductData { id: number; translations: CategoryTranslation[] }
interface ProductTypeData { id: number; translations: CategoryTranslation[]; products: ProductData[] }
interface CategoryData { id: number; translations: CategoryTranslation[]; product_types: ProductTypeData[] }
interface ServiceTranslation { id?: number; language: number; title: string }
interface ServiceData { id: number; translations: ServiceTranslation[] }
interface PageOption { label: string; value: string; disabled?: boolean }

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HeaderPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'style' | 'logo'>('menu')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [headerStyle, setHeaderStyle] = useState<InternalHeaderStyle>(defaultHeaderStyle)
  const [headerId, setHeaderId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSavingToServer, setIsSavingToServer] = useState(false)
  // Өгөгдлийн сангаас ачаалахад алдаа гарвал хадгална
  const [fetchError, setFetchError] = useState<string | null>(null)
  // Өгөгдөл хаанаас ирснийг илэрхийлнэ: 'db' = өгөгдлийн сан, 'empty' = хоосон, 'error' = алдаа
  const [dataSource, setDataSource] = useState<'db' | 'empty' | 'error'>('empty')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState(initialMenuItem)
  const [selectedPage, setSelectedPage] = useState('')
  const [previewHover, setPreviewHover] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '11', '17']))
  const [previewLanguage, setPreviewLanguage] = useState<'mn' | 'en'>('mn')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [originalMenuItems, setOriginalMenuItems] = useState<MenuItem[]>([])
  const [originalHeaderStyle, setOriginalHeaderStyle] = useState<InternalHeaderStyle>(defaultHeaderStyle)
  // Хуудсын сонголтуудын state (өгөгдлийн сангаас ачаална)
  const [pageOptions, setPageOptions] = useState<PageOption[]>([
    { label: '-- Хуудас сонгох --', value: '' },
    { label: '# (Дэд цэстэй - линкгүй)', value: '#' },
    { label: 'Гадаад линк (өөрөө бичих)', value: 'custom' },
  ])
  const [loadingPages, setLoadingPages] = useState(false)
  const [logoHistory, setLogoHistory] = useState<LogoHistoryItem[]>([])
  const [isSavingLogo, setIsSavingLogo] = useState(false)

  // Өгөгдлийн сангаас логоны түүхийг татах
  const fetchLogoHistory = async () => {
    try {
      const res = await fetch('/api/admin/logo-history')
      if (res.ok) {
        const data = await res.json()
        setLogoHistory(data)
      }
    } catch (e) {
      console.warn('Logo history татахад алдаа:', e)
    }
  }

  useEffect(() => {
    fetchData()
    fetchLogoHistory()
  }, [])

  // ============================================================================
  // ХУУДСЫН СОНГОЛТУУДЫГ ӨГӨГДЛИЙН САНГААС ТАТАХ
  // ============================================================================
  // Бүтээгдэхүүн (categories → product_types → products) болон
  // Үйлчилгээ (services) зэргийг Django backend-аас татаж dropdown-д харуулна.
  // Тогтмол (hardcoded) утга байхгүй - бүгд DB-ээс ирнэ.
  // ============================================================================

  useEffect(() => {
    const buildPageOptions = async () => {
      setLoadingPages(true)
      try {
        // Бүтээгдэхүүний ангилал + Үйлчилгээг зэрэг татах
        const [catRes, svcRes] = await Promise.all([
          fetch(`${DJANGO_API_URL}/categories/`),
          fetch(`${DJANGO_API_URL}/services/`),
        ])

        const options: PageOption[] = [
          { label: '-- Хуудас сонгох --', value: '' },
          { label: '# (Дэд цэстэй - линкгүй)', value: '#' },
        ]

        // ── Бүтээгдэхүүн (categories → product_types → products) ──
        if (catRes.ok) {
          const categories: CategoryData[] = await catRes.json()
          if (categories.length > 0) {
            options.push({ label: '─── Бүтээгдэхүүн ───', value: '', disabled: true })
            categories.forEach((cat) => {
              // Ангиллын нэр
              const catLabel =
                cat.translations.find((t) => t.language === 2)?.label ||
                cat.translations.find((t) => t.language === 1)?.label || ''

              cat.product_types.forEach((pt) => {
                const ptLabel =
                  pt.translations.find((t) => t.language === 2)?.label ||
                  pt.translations.find((t) => t.language === 1)?.label || ''

                if (pt.products.length > 0) {
                  // Бүтээгдэхүүн бүрийг нэмэх
                  pt.products.forEach((p) => {
                    const pLabel =
                      p.translations.find((t) => t.language === 2)?.label ||
                      p.translations.find((t) => t.language === 1)?.label || ''
                    options.push({
                      label: `  ${catLabel} → ${pLabel}`,
                      value: `/products/${p.id}`,
                    })
                  })
                } else {
                  // Бүтээгдэхүүнгүй бол төрлийн хуудас
                  options.push({
                    label: `  ${catLabel} → ${ptLabel}`,
                    value: `/products/type/${pt.id}`,
                  })
                }
              })
            })
          }
        }

        // ── Үйлчилгээ (services) ──
        if (svcRes.ok) {
          const services: ServiceData[] = await svcRes.json()
          if (services.length > 0) {
            options.push({ label: '─── Үйлчилгээ ───', value: '', disabled: true })
            services.forEach((svc) => {
              const svcLabel =
                svc.translations.find((t) => t.language === 2)?.title ||
                svc.translations.find((t) => t.language === 1)?.title || ''
              options.push({ label: `  ${svcLabel}`, value: `/services/${svc.id}` })
            })
          }
        }

        // ── Танилцуулга (About) ──
        options.push({ label: '─── Танилцуулга ───', value: '', disabled: true })
        options.push({ label: '  Танилцуулга (Бидний тухай)', value: '/about' })

        // ── Салбарууд (Branches) ──
        options.push({ label: '─── Салбарууд ───', value: '', disabled: true })
        options.push({ label: '  Салбарууд', value: '/branches' })

        // ── Мэдээ (News) ──
        options.push({ label: '─── Мэдээ ───', value: '', disabled: true })
        options.push({ label: '  Мэдээ', value: '/news' })

        // ── Хүний нөөц (HR / Careers) ──
        options.push({ label: '─── Хүний нөөц ───', value: '', disabled: true })
        options.push({ label: '  Хүний нөөц', value: '/about/hr' })

        // Гадаад линк (өөрөө бичих) сонголт
        options.push({ label: '─── Бусад ───', value: '', disabled: true })
        options.push({ label: 'Гадаад линк (өөрөө бичих)', value: 'custom' })

        setPageOptions(options)
      } catch (error) {
        console.error('Хуудсын сонголтуудыг ачаалахад алдаа:', error)
      } finally {
        setLoadingPages(false)
      }
    }

    buildPageOptions()
  }, [])

  // ============================================================================
  // DATA TRANSFORMATION FUNCTIONS
  // ============================================================================

  const transformApiToInternal = (data: HeaderData): { items: MenuItem[], style: InternalHeaderStyle } => {
    const items: MenuItem[] = []
    let idCounter = 1

    // Safely handle menus if undefined
    const menus = data.menus || []
    
    menus.forEach((menu) => {
      const menuId = `menu-${menu.id || idCounter++}`
      const mnTranslation = menu.translations?.find(t => t.language_id === 2)
      const enTranslation = menu.translations?.find(t => t.language_id === 1)

      items.push({
        id: menuId,
        title_mn: mnTranslation?.label || '',
        title_en: enTranslation?.label || '',
        href: menu.path,
        order: menu.index,
        isActive: menu.visible === 1,
        parentId: null,
        font: typeof menu.font === 'number' ? 'font-sans' : menu.font,
        textColor: '#1f2937',
        level: 0,
      })

      const submenus = menu.submenus || []
      submenus.forEach((submenu) => {
        const submenuId = `submenu-${submenu.id || idCounter++}`
        const mnSubTranslation = submenu.translations?.find(t => t.language_id === 2)
        const enSubTranslation = submenu.translations?.find(t => t.language_id === 1)

        items.push({
          id: submenuId,
          title_mn: mnSubTranslation?.label || '',
          title_en: enSubTranslation?.label || '',
          href: submenu.path,
          order: submenu.index,
          isActive: submenu.visible === 1,
          parentId: menuId,
          font: typeof submenu.font === 'number' ? 'font-sans' : submenu.font.toString(),
          textColor: '#1f2937',
          level: 1,
        })

        const tertiaryMenus = submenu.tertiary_menus || []
        tertiaryMenus.forEach((tertiary) => {
          const tertiaryId = `tertiary-${tertiary.id || idCounter++}`
          const mnTerTranslation = tertiary.translations?.find(t => t.language_id === 2)
          const enTerTranslation = tertiary.translations?.find(t => t.language_id === 1)

          items.push({
            id: tertiaryId,
            title_mn: mnTerTranslation?.label || '',
            title_en: enTerTranslation?.label || '',
            href: tertiary.path,
            order: tertiary.index,
            isActive: tertiary.visible === 1,
            parentId: submenuId,
            font: tertiary.font,
            textColor: '#1f2937',
            level: 2,
          })
        })
      })
    })

    const apiStyle = (data.styles?.[0]) || {
      bgcolor: '#ffffff',
      fontcolor: '#1f2937',
      hovercolor: '#0d9488',
      height: 80,
      sticky: 1,
      max_width: '1240px',
      logo_size: 44,
    }

    const style: InternalHeaderStyle = {
      backgroundColor: apiStyle.bgcolor,
      textColor: apiStyle.fontcolor,
      hoverColor: apiStyle.hovercolor,
      height: `${apiStyle.height}px`,
      isSticky: apiStyle.sticky === 1,
      logoUrl: data.logo || '',
      logoText: 'BichilGlobus',
      maxWidth: apiStyle.max_width || '1240px',
      logoSize: apiStyle.logo_size || 44,
    }

    return { items, style }
  }

  const transformInternalToApi = (): HeaderData => {
    const rootItems = menuItems.filter(item => !item.parentId).sort((a, b) => a.order - b.order)
    
    const menus: Menu[] = rootItems.map(rootItem => {
      const submenus: Submenu[] = menuItems
        .filter(item => item.parentId === rootItem.id)
        .sort((a, b) => a.order - b.order)
        .map(submenuItem => {
          const tertiaryMenus: TertiaryMenu[] = menuItems
            .filter(item => item.parentId === submenuItem.id)
            .sort((a, b) => a.order - b.order)
            .map(tertiaryItem => ({
              id: tertiaryItem.id ? parseInt(tertiaryItem.id.replace('tertiary-', '')) : undefined,
              path: tertiaryItem.href,
              font: tertiaryItem.font || 'font-sans',
              index: tertiaryItem.order,
              visible: tertiaryItem.isActive ? 1 : 0,
              translations: [
                { label: tertiaryItem.title_en, language_id: 1 },
                { label: tertiaryItem.title_mn, language_id: 2 },
              ],
            }))

          return {
            id: submenuItem.id ? parseInt(submenuItem.id.replace('submenu-', '')) : undefined,
            path: submenuItem.href,
            font: submenuItem.font || 'font-sans',
            index: submenuItem.order,
            visible: submenuItem.isActive ? 1 : 0,
            translations: [
              { label: submenuItem.title_en, language_id: 1 },
              { label: submenuItem.title_mn, language_id: 2 },
            ],
            tertiary_menus: tertiaryMenus,
          }
        })

      return {
        id: rootItem.id ? parseInt(rootItem.id.replace('menu-', '')) : undefined,
        path: rootItem.href,
        font: rootItem.font || 'font-sans',
        index: rootItem.order,
        visible: rootItem.isActive ? 1 : 0,
        translations: [
          { label: rootItem.title_en, language_id: 1 },
          { label: rootItem.title_mn, language_id: 2 },
        ],
        submenus,
      }
    })

    return {
      id: headerId || undefined,
      logo: headerStyle.logoUrl,
      active: 1,
      styles: [
        {
          id: 1,
          bgcolor: headerStyle.backgroundColor,
          fontcolor: headerStyle.textColor,
          hovercolor: headerStyle.hoverColor,
          height: parseInt(headerStyle.height) || 80,
          sticky: headerStyle.isSticky ? 1 : 0,
          max_width: headerStyle.maxWidth || '1240px',
          logo_size: headerStyle.logoSize || 44,
        },
      ],
      menus,
    }
  }

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  // ============================================================================
  // ӨГӨГДЛИЙН САНГААС ЦЭСҮҮДИЙГ ТАТАХ
  // ============================================================================
  // Энэ функц нь /api/admin/header-menu API-г дуудаж,
  // Django backend → PostgreSQL-ээс header + меню + дэд цэс + орчуулгуудыг татна.
  // Алдаа гарвал fetchError state-д алдааны мэдээллийг хадгална.
  // ============================================================================
  const fetchData = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      console.log('📥 Өгөгдлийн сангаас header мэдээлэл татаж байна...', `${API_BASE_URL}`)
      
      const response = await fetch(`${API_BASE_URL}`)
      
      if (!response.ok) {
        throw new Error(`Backend-ээс өгөгдөл авахад алдаа: ${response.status} ${response.statusText}`)
      }

      const data: HeaderData & { _error?: string } = await response.json()
      
      // Django backend-аас алдааны мэдээлэл ирсэн эсэхийг шалгах
      if (data._error) {
        console.warn('⚠️ Django backend алдаа:', data._error)
        setFetchError(`Django серверт алдаа гарлаа: ${data._error}\n\nfix_cascade_constraints.sql файлыг production DB дээр ажиллуулна уу.`)
        setDataSource('error')
      }
      
      console.log('✅ Өгөгдлийн сангаас амжилттай авлаа:', data)
      console.log('  - Header ID:', data.id)
      console.log('  - Цэсний тоо:', data.menus?.length || 0)
      console.log('  - Лого байгаа эсэх:', !!data.logo)

      // Хэрэв цэс олдоогүй бол мэдэгдэл
      if (!data.menus || data.menus.length === 0) {
        console.warn('⚠️ Өгөгдлийн санд цэс олдсонгүй')
        setDataSource('empty')
      } else {
        setDataSource('db')
      }

      // API-ийн бүтцийг дотоод бүтэц рүү хувиргах
      const { items, style } = transformApiToInternal(data)
      console.log('✅ Хувиргалт дууслаа:', items.length, 'цэс')
      
      setHeaderId(data.id || null)
      setMenuItems(items)
      setHeaderStyle(style)
      setOriginalMenuItems(JSON.parse(JSON.stringify(items)))
      setOriginalHeaderStyle(JSON.parse(JSON.stringify(style)))
      setFetchError(null)
    } catch (error) {
      // Алдааны мэдээллийг хэрэглэгчид харуулах
      const errorMsg = error instanceof Error ? error.message : 'Тодорхойгүй алдаа'
      console.error('❌ Өгөгдлийн сангаас татахад алдаа:', errorMsg)
      setFetchError(`Өгөгдлийн сангаас цэсүүдийг татаж чадсангүй: ${errorMsg}`)
      setDataSource('error')
      // Хоосон өгөгдөл ашиглах
      setMenuItems([])
      setOriginalMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  // ── Logo-only save function ──
  const handleSaveLogo = async () => {
    try {
      setIsSavingLogo(true)
      
      if (!headerStyle.logoUrl) {
        alert('Лого URL байхгүй байна.')
        return
      }

      console.log('Logo хадгалж байна... URL:', headerStyle.logoUrl.substring(0, 50) + '...')
      
      // Only send logo and logo_size to backend
      const logoData = {
        id: headerId || undefined,
        logo: headerStyle.logoUrl,
        logo_size: headerStyle.logoSize,
        active: 1,
      }

      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logoData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error:', errorText)
        throw new Error(`Failed to save logo: ${response.status}`)
      }

      const result = await response.json()
      console.log('Logo saved successfully:', result)
      
      // Логоны түүхэнд нэмэх (DB)
      try {
        await fetch('/api/admin/logo-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: headerStyle.logoUrl }),
        })
        fetchLogoHistory()
      } catch (e) {
        console.warn('Logo history нэмэхэд алдаа:', e)
      }
      
      alert('Логог амжилттай хадгалагдлаа! 🎉')
    } catch (error) {
      console.error('Error saving logo:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      alert(`Логог хадгалахад алдаа гарлаа: ${errorMsg}`)
    } finally {
      setIsSavingLogo(false)
    }
  }

  const handleDeleteLogo = () => {
    if (!confirm('Логог устгах уу?')) return
    setHeaderStyle({ ...headerStyle, logoUrl: '' })
  }

  const handleApplyHistoryLogo = (url: string) => {
    setHeaderStyle({ ...headerStyle, logoUrl: url })
  }

  const handleDeleteHistoryLogo = async (id: number) => {
    try {
      await fetch(`/api/admin/logo-history?id=${id}`, { method: 'DELETE' })
      setLogoHistory(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      console.warn('Logo history устгахад алдаа:', e)
    }
  }

  // ============================================================================
  // ЦЭСҮҮДИЙГ ӨГӨГДЛИЙН САНД ХАДГАЛАХ
  // ============================================================================
  // Бүх цэсийн өгөгдлийг API руу илгээж, Django backend-аар дамжуулан
  // PostgreSQL-д хадгална. Хадгалсны дараа DB-ээс дахин татаж шинэчлэнэ.
  // ============================================================================
  const handleSaveAll = async () => {
    try {
      setSaving(true)

      // Дотоод бүтцийг API бүтэц рүү хувиргах
      const apiData = transformInternalToApi()
      
      if (!apiData.id && !apiData.logo) {
        console.warn('⚠️ Header ID эсвэл logo байхгүй')
      }

      // ⚠️ Хоосон цэстэй хадгалахаас сэргийлэх
      if (!apiData.menus || apiData.menus.length === 0) {
        const confirmed = confirm(
          '⚠️ Анхааруулга: Цэс хоосон байна!\n\n'
          + 'Хадгалбал одоо байгаа бүх цэснүүд устгагдана.\n'
          + 'Үргэлжлүүлэх үү?'
        )
        if (!confirmed) {
          setSaving(false)
          return
        }
      }

      console.log('📤 Өгөгдлийн санд хадгалж байна...', menuItems.length, 'цэс')
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Хадгалахад серверийн алдаа:', errorText)
        throw new Error(`Хадгалахад алдаа: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Амжилттай хадгалагдлаа:', result)
      
      // Хадгалсны дараа өгөгдлийн сангаас дахин ачаалж шинэчлэх
      await fetchData()
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
      
      alert('Цэсүүд өгөгдлийн санд амжилттай хадгалагдлаа! 🎉')
    } catch (error) {
      console.error('❌ Хадгалахад алдаа:', error)
      const errorMsg = error instanceof Error ? error.message : 'Тодорхойгүй алдаа'
      alert(`Хадгалахад алдаа гарлаа:\n\n${errorMsg}\n\nConsole-г нээж дэлгэрүүлэн үзнэ үү (F12).`)
    } finally {
      setSaving(false)
    }
  }

  // Server submission function
  const handleServerSubmit = async () => {
    setIsSavingToServer(true)
    try {
      const apiData = transformInternalToApi()

      const response = await fetch('/api/admin/header-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      await response.json()
      alert('Header өгөгдлийг серверт амжилттай илгээлээ')
    } catch (error) {
      console.error('Failed to submit header:', error)
      alert(` Илгээхэд алдаа гарлаа: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSavingToServer(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const newItem: MenuItem = { 
      id: editingItem?.id || `temp-${Date.now()}`, 
      ...formData,
      level: formData.parentId 
        ? (menuItems.find(m => m.id === formData.parentId)?.level ?? 0) + 1
        : 0
    }
    
    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? newItem : item
      ))
    } else {
      setMenuItems(prev => [...prev, newItem])
    }
    
    handleCloseModal()
    setSaving(false)
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm('Устгах уу? Дэд цэсүүд ч бас устгагдана.')) return
    
    const idsToDelete = new Set<string>()
    const collectIds = (parentId: string) => {
      idsToDelete.add(parentId)
      menuItems.filter(i => i.parentId === parentId).forEach(child => collectIds(child.id))
    }
    collectIds(item.id)

    // Шинэ жагсаалтыг бэлтгэх (устгасны дараа)
    const remainingItems = menuItems.filter(i => !idsToDelete.has(i.id))
    setMenuItems(remainingItems)

    // Өгөгдлийн сангаас автоматаар устгах (full save хийнэ)
    try {
      setSaving(true)
      
      // Үлдсэн цэснүүдийг API формат руу хөрвүүлэх
      const rootItems = remainingItems.filter(i => !i.parentId).sort((a, b) => a.order - b.order)
      const menus: Menu[] = rootItems.map(rootItem => {
        const submenus: Submenu[] = remainingItems
          .filter(i => i.parentId === rootItem.id)
          .sort((a, b) => a.order - b.order)
          .map(submenuItem => {
            const tertiaryMenus: TertiaryMenu[] = remainingItems
              .filter(i => i.parentId === submenuItem.id)
              .sort((a, b) => a.order - b.order)
              .map(tertiaryItem => ({
                id: tertiaryItem.id ? parseInt(tertiaryItem.id.replace('tertiary-', '')) : undefined,
                path: tertiaryItem.href,
                font: tertiaryItem.font || 'font-sans',
                index: tertiaryItem.order,
                visible: tertiaryItem.isActive ? 1 : 0,
                translations: [
                  { label: tertiaryItem.title_en, language_id: 1 },
                  { label: tertiaryItem.title_mn, language_id: 2 },
                ],
              }))
            return {
              id: submenuItem.id ? parseInt(submenuItem.id.replace('submenu-', '')) : undefined,
              path: submenuItem.href,
              font: submenuItem.font || 'font-sans',
              index: submenuItem.order,
              visible: submenuItem.isActive ? 1 : 0,
              translations: [
                { label: submenuItem.title_en, language_id: 1 },
                { label: submenuItem.title_mn, language_id: 2 },
              ],
              tertiary_menus: tertiaryMenus,
            }
          })
        return {
          id: rootItem.id ? parseInt(rootItem.id.replace('menu-', '')) : undefined,
          path: rootItem.href,
          font: rootItem.font || 'font-sans',
          index: rootItem.order,
          visible: rootItem.isActive ? 1 : 0,
          translations: [
            { label: rootItem.title_en, language_id: 1 },
            { label: rootItem.title_mn, language_id: 2 },
          ],
          submenus,
        }
      })

      const apiData: HeaderData = {
        id: headerId || undefined,
        logo: headerStyle.logoUrl,
        active: 1,
        styles: [{
          id: 1,
          bgcolor: headerStyle.backgroundColor,
          fontcolor: headerStyle.textColor,
          hovercolor: headerStyle.hoverColor,
          height: parseInt(headerStyle.height) || 80,
          sticky: headerStyle.isSticky ? 1 : 0,
          max_width: headerStyle.maxWidth || '1240px',
          logo_size: headerStyle.logoSize || 44,
        }],
        menus,
      }

      console.log('🗑️ Цэс устгаад DB руу хадгалж байна...', JSON.stringify(apiData.menus?.length))
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Устгаад хадгалахад алдаа:', errorText)
        throw new Error(`Save failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Устгалт амжилттай хадгалагдлаа:', result)
      
      setOriginalMenuItems(JSON.parse(JSON.stringify(remainingItems)))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Устгаад хадгалахад алдаа:', error)
      alert(`Устгахад алдаа гарлаа. Дахин оролдоно уу.`)
      // Reload to get correct state from DB
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      title_mn: item.title_mn,
      title_en: item.title_en,
      href: item.href,
      order: item.order,
      isActive: item.isActive,
      parentId: item.parentId,
      font: item.font || 'font-sans',
      textColor: item.textColor || '#1f2937',
    })
    setSelectedPage(item.href.startsWith('#') ? '#' : 
                    pageOptions.find(p => p.value === item.href)?.value || 'custom')
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setFormData(initialMenuItem)
    setSelectedPage('')
  }

  const handlePageSelect = (value: string) => {
    setSelectedPage(value)
    if (value && value !== 'custom' && value !== '#') {
      setFormData(prev => ({ ...prev, href: value }))
    } else if (value === '#') {
      setFormData(prev => ({ ...prev, href: '#' }))
    }
  }

  const handleReset = () => {
    const hasChanges = 
      JSON.stringify(menuItems) !== JSON.stringify(originalMenuItems) ||
      JSON.stringify(headerStyle) !== JSON.stringify(originalHeaderStyle)
    
    if (hasChanges) {
      const confirmed = window.confirm(
        'Та өөрчлөлтүүдийг хадгалаагүй байна. Буцах уу?\n\nХадгалаагүй өөрчлөлтүүд устах болно.'
      )
      if (!confirmed) return
    }
    
    setMenuItems(JSON.parse(JSON.stringify(originalMenuItems)))
    setHeaderStyle(JSON.parse(JSON.stringify(originalHeaderStyle)))
  }

  const rootItems = menuItems.filter(item => !item.parentId).sort((a, b) => a.order - b.order)
  const getChildren = (parentId: string) => 
    menuItems.filter(item => item.parentId === parentId).sort((a, b) => a.order - b.order)
  
  const getAllParents = () => {
    const parents: { value: string; label: string }[] = [
      { value: '', label: 'Үндсэн цэс (Root)' }
    ]
    rootItems.forEach(root => {
      parents.push({ value: root.id, label: root.title_mn })
      getChildren(root.id).forEach(child => {
        parents.push({ value: child.id, label: `  └ ${child.title_mn}` })
      })
    })
    return parents
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    menuItems.forEach(item => {
      if (getChildren(item.id).length > 0) allIds.add(item.id)
    })
    setExpandedIds(allIds)
  }

  const collapseAll = () => setExpandedIds(new Set())

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AdminLayout title="Header тохиргоо">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Header удирдлага"
          description="Цэс, загвар, лого тохиргоо"
        />

        {/* Success Notification */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-900">Амжилттай хадгалагдлаа!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">Өөрчлөлтүүд backend-д амжилттай илгээгдлээ.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1">
            {(['menu', 'style', 'logo'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'menu' ? 'Цэс удирдах' : tab === 'style' ? 'Style тохиргоо' : 'Logo'}
              </button>
            ))}
          </div>
        </div>

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* ── Алдааны мэдэгдэл (backend-тай холбогдож чадаагүй бол) ── */}
            {fetchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900">Өгөгдлийн сантай холбогдоход алдаа гарлаа</h4>
                  <p className="text-xs text-red-700 mt-0.5">{fetchError}</p>
                  <p className="text-xs text-red-500 mt-1">Django backend серверийг ажиллуулсан эсэхээ шалгана уу.</p>
                </div>
                <button
                  onClick={() => fetchData()}
                  className="px-3 py-2 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  🔄 Дахин оролдох
                </button>
              </div>
            )}

            {/* ── Өгөгдлийн сангаас амжилттай ачаалагдсан мэдэгдэл ── */}
            {dataSource === 'db' && !loading && !fetchError && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-700">
                  ✅ Цэсүүд өгөгдлийн сангаас (PostgreSQL) амжилттай ачаалагдлаа — {menuItems.length} цэс
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Цэсний удирдлага</h3>
                <p className="text-xs text-slate-500 mt-0.5">Веб сайтын navigation цэс — өгөгдлийн сангаас</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Өгөгдлийн сангаас дахин ачаалах товч */}
                <button
                  onClick={() => fetchData()}
                  disabled={loading}
                  className="px-4 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  title="Өгөгдлийн сангаас дахин татах"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Ачаалж байна...' : 'DB-ээс ачаалах'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Буцах
                </button>
                <Button 
                  variant="dark" 
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Хадгалж байна...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Хадгалах
                    </span>
                  )}
                </Button>
                <Button 
                  variant="dark" 
                  onClick={() => setModalOpen(true)}
                  icon={<PlusIcon className="h-5 w-5" />}
                >
                  Цэс нэмэх
                </Button>
              </div>
            </div>

            {/* Preview - bichilweb frontend-тэй яг адилхан */}
            <div className="rounded-2xl overflow-visible border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50">
              <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Preview</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">🖱️ Hover хийнэ үү</span>
                  <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 shadow-sm border border-slate-200">
                    <button
                      onClick={() => setPreviewLanguage('mn')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        previewLanguage === 'mn' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🇲🇳 MN
                    </button>
                    <button
                      onClick={() => setPreviewLanguage('en')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        previewLanguage === 'en' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🇺🇸 EN
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pb-32 overflow-visible min-h-[200px]">
                {/* Floating header - яг bichilweb frontend шиг */}
                <div 
                  className="rounded-2xl border bg-white/70 backdrop-blur-lg shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-white/40 mx-auto"
                  style={{ maxWidth: headerStyle.maxWidth }}
                >
                  <div className="px-4 sm:px-5">
                    <div className="flex items-center justify-between h-12 lg:h-14">

                      {/* Logo + Desktop Nav */}
                      <div className="flex items-center gap-5 lg:gap-6">
                        {/* Logo */}
                        <div className="flex items-center">
                          <div className="flex items-center justify-center" style={{ width: `${Math.round(headerStyle.logoSize * 0.8)}px`, height: `${Math.round(headerStyle.logoSize * 0.8)}px` }}>
                            {headerStyle.logoUrl ? (
                              <img 
                                src={headerStyle.logoUrl} 
                                alt="Logo" 
                                style={{ width: `${Math.round(headerStyle.logoSize * 0.8)}px`, height: `${Math.round(headerStyle.logoSize * 0.8)}px` }} 
                                className="object-cover" 
                              />
                            ) : (
                              <img 
                                src="/images/logo.jpg" 
                                alt="Default Logo" 
                                style={{ width: `${Math.round(headerStyle.logoSize * 0.8)}px`, height: `${Math.round(headerStyle.logoSize * 0.8)}px` }} 
                                className="object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement
                                  img.style.display = 'none'
                                  img.parentElement!.innerHTML = '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-md">BG</div>'
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center gap-0.5">
                          {rootItems.filter(i => i.isActive).map(item => {
                            const children = getChildren(item.id).filter(c => c.isActive)
                            const isHovered = previewHover === item.id
                            
                            return (
                              <div 
                                key={item.id}
                                className="relative"
                                onMouseEnter={() => setPreviewHover(item.id)}
                                onMouseLeave={() => setPreviewHover(null)}
                              >
                                <button 
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isHovered
                                      ? 'bg-gray-100 text-teal-600'
                                      : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                                  } ${children.length === 0 && item.href === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {previewLanguage === 'mn' ? item.title_mn : item.title_en}
                                  {children.length > 0 && (
                                    <svg className={`w-3 h-3 transition-transform ${isHovered ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </button>
                                
                                {/* 2-р түвшний dropdown */}
                                {isHovered && children.length > 0 && (
                                  <div className="absolute top-full left-0 pt-1.5 w-56 z-[9999]">
                                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5">
                                      {children.map(child => {
                                        const grandChildren = getChildren(child.id).filter(c => c.isActive)
                                        
                                        return (
                                          <div key={child.id} className="relative group/sub">
                                            <div className={`flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}>
                                              <span className="text-xs font-medium text-gray-900">{previewLanguage === 'mn' ? child.title_mn : child.title_en}</span>
                                              {grandChildren.length > 0 && (
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                              )}
                                            </div>
                                            
                                            {/* 3-р түвшний dropdown */}
                                            {grandChildren.length > 0 && (
                                              <div className="absolute left-full top-0 pl-1.5 w-48 hidden group-hover/sub:block z-[10000]">
                                                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5">
                                                  {grandChildren.map(gc => (
                                                    <div key={gc.id} className="px-3 py-2 mx-1 rounded-lg text-xs text-gray-700 hover:bg-gray-50 hover:text-teal-600 cursor-pointer">
                                                      {previewLanguage === 'mn' ? gc.title_mn : gc.title_en}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </nav>
                      </div>

                      {/* Right Side - Language Selector */}
                      <div className="flex items-center gap-1.5">
                        <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          <span className="text-xs font-medium text-gray-700">{previewLanguage === 'mn' ? 'MN' : 'EN'}</span>
                          <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Цэсний жагсаалт — өгөгдлийн сангаас */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="font-semibold text-slate-900">Цэсний жагсаалт</span>
                  <span className="text-xs text-slate-400">({menuItems.length} цэс)</span>
                  {/* Өгөгдлийн эх сурвалжийг харуулах */}
                  {dataSource === 'db' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">PostgreSQL</span>
                  )}
                  {dataSource === 'error' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Холболтын алдаа</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={expandAll} className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    Бүгдийг нээх
                  </button>
                  <span className="text-slate-300">|</span>
                  <button onClick={collapseAll} className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    Бүгдийг хаах
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-slate-500">Өгөгдлийн сангаас цэсүүдийг татаж байна...</p>
                  </div>
                </div>
              ) : rootItems.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {fetchError ? 'Өгөгдлийн сантай холбогдож чадсангүй' : 'Өгөгдлийн санд цэс олдсонгүй'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {fetchError 
                          ? 'Django backend серверийг ажиллуулаад "DB-ээс ачаалах" товчийг дарна уу' 
                          : 'Эхний цэсээ нэмж эхлээрэй'}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {/* Өгөгдлийн сангаас дахин татах */}
                      <button onClick={() => fetchData()} className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 text-sm rounded-lg hover:bg-teal-100 transition-colors">
                        🔄 DB-ээс дахин ачаалах
                      </button>
                      <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors">
                        ➕ Цэс нэмэх
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-1">
                  {rootItems.map(item => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      level={0}
                      getChildren={getChildren}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      expandedIds={expandedIds}
                      onToggle={toggleExpand}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            {/* Color Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <SwatchIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Өнгөний тохиргоо</h3>
                    <p className="text-sm text-gray-500">Header-ийн өнгө, фонт</p>
                  </div>
                </div>
                <button
                  onClick={() => setHeaderStyle(prev => ({
                    ...prev,
                    backgroundColor: defaultHeaderStyle.backgroundColor,
                    textColor: defaultHeaderStyle.textColor,
                    hoverColor: defaultHeaderStyle.hoverColor,
                  }))}
                  className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Анхний тохиргоо
                </button>
              </div>
              
              <div className="space-y-5">
                <ColorField
                  label="Арын өнгө"
                  description="Header-ийн дэвсгэр өнгө"
                  value={headerStyle.backgroundColor}
                  onChange={(v) => setHeaderStyle({ ...headerStyle, backgroundColor: v })}
                  preview={<div className="w-12 h-12 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: headerStyle.backgroundColor }} />}
                />
                
                <ColorField
                  label="Текстийн өнгө"
                  description="Цэсний үсгийн өнгө"
                  value={headerStyle.textColor}
                  onChange={(v) => setHeaderStyle({ ...headerStyle, textColor: v })}
                  preview={
                    <div className="w-12 h-12 rounded-lg border-2 border-white shadow-md flex items-center justify-center text-sm font-bold" style={{ backgroundColor: headerStyle.backgroundColor, color: headerStyle.textColor }}>
                      Аа
                    </div>
                  }
                />
                
                <ColorField
                  label="Hover өнгө"
                  description="Хулгана дээр ирэхэд текст өнгө"
                  value={headerStyle.hoverColor}
                  onChange={(v) => setHeaderStyle({ ...headerStyle, hoverColor: v })}
                  preview={
                    <div className="w-12 h-12 rounded-lg border-2 border-white shadow-md flex items-center justify-center text-sm font-bold" style={{ backgroundColor: headerStyle.backgroundColor, color: headerStyle.hoverColor }}>
                      Аа
                    </div>
                  }
                />
              </div>
            </div>

            {/* Size Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16M4 19h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Хэмжээ тохиргоо</h3>
                  <p className="text-sm text-gray-500">Урт, өндөр болон sticky</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Header өндөр</label>
                  <p className="text-xs text-slate-500 mb-3">Header-ийн босоо хэмжээ</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={headerStyle.height}
                      onChange={(e) => setHeaderStyle({ ...headerStyle, height: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-mono"
                      placeholder="80px"
                    />
                    <div className="flex gap-2">
                      {['64px', '80px', '96px'].map((h, i) => (
                        <button
                          key={h}
                          onClick={() => setHeaderStyle({ ...headerStyle, height: h })}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            headerStyle.height === h ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-300 hover:border-teal-500'
                          }`}
                        >
                          {['Бага', 'Дунд', 'Том'][i]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Header урт (max-width)</label>
                  <p className="text-xs text-slate-500 mb-3">Header-ийн хэвтээ уртын хэмжээ</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={headerStyle.maxWidth}
                      onChange={(e) => setHeaderStyle({ ...headerStyle, maxWidth: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-mono"
                      placeholder="1240px"
                    />
                    <div className="flex gap-2">
                      {['1024px', '1240px', '1440px', '100%'].map((w, i) => (
                        <button
                          key={w}
                          onClick={() => setHeaderStyle({ ...headerStyle, maxWidth: w })}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            headerStyle.maxWidth === w ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-300 hover:border-teal-500'
                          }`}
                        >
                          {['Бага', 'Дунд', 'Том', 'Дүүрэн'][i]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Sticky Header</label>
                      <p className="text-xs text-slate-500">Scroll хийхэд header дээд талд наалдсан үлдэх</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={headerStyle.isSticky}
                        onChange={(e) => setHeaderStyle({ ...headerStyle, isSticky: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 rounded-full peer peer-checked:bg-teal-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={handleReset} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Буцах
              </button>
              <Button variant="dark" onClick={handleSaveAll}>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Хадгалах
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* LOGO TAB */}
        {activeTab === 'logo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Logo тохиргоо</h3>
                  <p className="text-sm text-gray-500">Компанийн лого оруулах</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Logo зураг оруулах</label>
                  <p className="text-xs text-slate-500 mb-4">PNG, SVG эсвэл JPG файл оруулна уу.</p>
                  <ImageUpload
                    label=""
                    value={headerStyle.logoUrl}
                    onChange={(url) => setHeaderStyle({ ...headerStyle, logoUrl: url })}
                  />
                  {headerStyle.logoUrl && headerStyle.logoUrl !== '' && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 font-medium mb-3">Урьдчилан харах:</p>
                      <div className="flex items-center justify-center p-6 bg-slate-100 rounded-lg min-h-24">
                        <div style={{ width: `${headerStyle.logoSize}px`, height: `${headerStyle.logoSize}px` }} className="flex items-center justify-center overflow-hidden">
                          <img 
                            src={headerStyle.logoUrl} 
                            alt="Logo Preview" 
                            style={{ 
                              height: `${headerStyle.logoSize}px`,
                              maxWidth: '100%',
                              objectFit: 'contain'
                            }} 
                            className="w-full"
                            onError={(e) => {
                              console.warn('Logo preview error:', headerStyle.logoUrl)
                              const img = e.target as HTMLImageElement
                              img.style.display = 'none'
                            }}
                            onLoad={() => {
                              console.log('Logo loaded successfully:', headerStyle.logoUrl)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {logoHistory.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-900 mb-3">Хадгалагдсан логонууд</label>
                    <p className="text-xs text-slate-500 mb-3">Өгөгдлийн санд хадгалагдсан логонууд (дарж сонгоно):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {logoHistory.map((item) => (
                        <div key={item.id} className="relative group">
                          <button
                            onClick={() => handleApplyHistoryLogo(item.url)}
                            className="w-full h-16 rounded-lg border border-slate-200 hover:border-teal-500 overflow-hidden flex items-center justify-center bg-white hover:bg-slate-50 transition-colors"
                          >
                            <img
                              src={item.url}
                              alt={`Logo ${item.id}`}
                              className="max-h-12 max-w-full object-contain"
                              onError={() => {}}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteHistoryLogo(item.id)}
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Logo хэмжээ</label>
                  <p className="text-xs text-slate-500 mb-3">Логоны өндрийн хэмжээ (px). Том жижиг болгох.</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={20}
                      max={120}
                      step={2}
                      value={headerStyle.logoSize}
                      onChange={(e) => setHeaderStyle({ ...headerStyle, logoSize: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={20}
                        max={120}
                        value={headerStyle.logoSize}
                        onChange={(e) => setHeaderStyle({ ...headerStyle, logoSize: Number(e.target.value) || 44 })}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-sm font-mono text-center"
                      />
                      <span className="text-xs text-slate-500">px</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[28, 36, 44, 56, 72].map((s, i) => (
                      <button
                        key={s}
                        onClick={() => setHeaderStyle({ ...headerStyle, logoSize: s })}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          headerStyle.logoSize === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-300 hover:border-teal-500'
                        }`}
                      >
                        {['XS', 'S', 'M', 'L', 'XL'][i]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {headerStyle.logoUrl && (
                <button
                  onClick={handleDeleteLogo}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Устгах
                </button>
              )}
              <button onClick={handleReset} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Буцах
              </button>
              <Button
                variant="dark"
                onClick={handleSaveLogo}
                disabled={isSavingLogo}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isSavingLogo ? 'Хадгалж байна...' : 'Логог хадгалах'}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingItem ? 'Цэс засварлах' : 'Шинэ цэс нэмэх'} size="sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800 leading-relaxed">
                  <strong>Зөвлөмж:</strong> Дэд цэс үүсгэхийн тулд холбоос дээр <span className="px-1 py-0.5 bg-blue-100 rounded font-mono">#</span> сонгоод, дараа нь "Эцэг цэс" дээр тухайн цэсийг сонгоно уу.
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-slate-700">Цэсний нэр</span>
                <span className="text-xs text-slate-400">(хоёр хэл дээр оруулна)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-600 mb-1.5">
                    <span className="text-base">🇲🇳</span><span>Монгол</span>
                  </label>
                  <Input value={formData.title_mn} onChange={(e) => setFormData({ ...formData, title_mn: e.target.value })} placeholder="жнь: Бүтээгдэхүүн" required />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-600 mb-1.5">
                    <span className="text-base">🇺🇸</span><span>English</span>
                  </label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="eg: Products" required />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Холбоос <span className="ml-2 text-xs font-normal text-slate-400">(Хаашаа хандах вэ?)</span>
              </label>
              <select value={selectedPage} onChange={(e) => handlePageSelect(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" disabled={loadingPages}>
                {loadingPages ? (
                  <option value="">Ачааллаж байна...</option>
                ) : (
                  pageOptions.map((page, i) => (
                    <option key={i} value={page.value} disabled={page.disabled}>{page.label}</option>
                  ))
                )}
              </select>
            </div>

            {selectedPage === 'custom' && (
              <div className="animate-in slide-in-from-top-2">
                <Input label="URL хаяг" value={formData.href} onChange={(e) => setFormData({ ...formData, href: e.target.value })} placeholder="https://example.com" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Эцэг цэс</label>
                <Select value={formData.parentId || ''} onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })} options={getAllParents()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Дараалал</label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} placeholder="0" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="text-sm font-medium text-slate-700">Идэвхжүүлэх</div>
                <div className="text-xs text-slate-500 mt-0.5">Веб сайт дээр харагдах эсэх</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-teal-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                ← Буцах
              </button>
              <Button variant="dark" type="submit" disabled={saving}>
                {saving ? 'Хадгалж байна...' : '✓ Хадгалах'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

interface MenuItemRowProps {
  item: MenuItem
  level: number
  getChildren: (parentId: string) => MenuItem[]
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

function MenuItemRow({ item, level, getChildren, onEdit, onDelete, expandedIds, onToggle }: MenuItemRowProps) {
  const children = getChildren(item.id)
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(item.id)
  
  const levelColors = [
    'border-l-teal-500 bg-white',
    'border-l-blue-400 bg-slate-50/70',
    'border-l-purple-400 bg-slate-100/50',
  ]
  
  return (
    <>
      <div className={`flex items-center justify-between px-3 py-2.5 hover:bg-slate-100/80 border-l-4 transition-colors ${levelColors[level] || levelColors[2]}`} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button onClick={() => onToggle(item.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 transition-colors">
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-6 h-6 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            </span>
          )}
          
          <span className={`font-medium ${item.isActive ? 'text-slate-900' : 'text-slate-400 line-through'} ${item.font || 'font-sans'}`} style={{ color: item.isActive && item.textColor ? item.textColor : undefined }}>
            {item.title_mn}
          </span>
          
          {item.href === '#' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">dropdown</span>}
          {hasChildren && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">{children.length}</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {item.href !== '#' && <span className="text-xs text-slate-400 truncate max-w-[150px] hidden sm:block">{item.href}</span>}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <div className="flex items-center">
            <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Засах">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(item)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Устгах">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {children.map(child => (
            <MenuItemRow key={child.id} item={child} level={level + 1} getChildren={getChildren} onEdit={onEdit} onDelete={onDelete} expandedIds={expandedIds} onToggle={onToggle} />
          ))}
        </div>
      )}
    </>
  )
}

interface ColorFieldProps {
  label: string
  description: string
  value: string
  onChange: (v: string) => void
  preview: React.ReactNode
}

function ColorField({ label, description, value, onChange, preview }: ColorFieldProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="block text-sm font-semibold text-slate-900">{label}</label>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        {preview}
      </div>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-16 h-10 rounded-lg border border-slate-300 cursor-pointer" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono" placeholder="#ffffff" />
      </div>
    </div>
  )
}