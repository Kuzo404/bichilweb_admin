'use client'
import { useState, useRef, useEffect } from 'react'
import ImageUpload from '@/components/ImageUpload'
import Modal from '@/components/Modal'
import { axiosInstance } from '@/lib/axios'

// ============ TYPES ============

interface TitleTranslation {
  id?: number
  language: number
  language_code?: string
  language_name?: string
  title: string
  fontcolor: string
  fontsize: number
  fontweight: string
  fontfamily: string
  letterspace: string
}

interface DescTranslation {
  id?: number
  language: number
  language_code?: string
  language_name?: string
  desc: string
  fontcolor: string
  fontsize: number
  fontweight: string
  fontfamily: string
  letterspace: string
}

interface CoreValueAPI {
  id?: number
  file?: string | null
  file_ratio?: string
  index: number
  visible: boolean
  title_translations: TitleTranslation[]
  desc_translations: DescTranslation[]
}

interface Value {
  id: string
  title_mn: string
  title_en: string
  desc_mn: string
  desc_en: string
  image_url?: string
  image_aspect_ratio?: string
  // Title styling
  title_color: string
  title_size: number
  title_weight: string
  title_family: string
  title_letter_spacing: number
  // Description styling
  desc_color: string
  desc_size: number
  desc_weight: string
  desc_family: string
  desc_letter_spacing: number
  // Backend fields
  backend_id?: number
  index?: number
  visible?: boolean
}

// ValuesTab is self-contained — fetches + saves to /core-value/ API

const apiToFrontend = (apiData: CoreValueAPI): Value | null => {
  // Skip if no title translations
  if (!apiData.title_translations || apiData.title_translations.length === 0) {
    console.warn(`CoreValue ${apiData.id} has no title translations, skipping...`)
    return null
  }

  const mnTitleTranslation = apiData.title_translations.find(t => t.language === 2)
  const enTitleTranslation = apiData.title_translations.find(t => t.language === 1)
  const fallbackTitleTranslation = apiData.title_translations[0]
  const titleTranslation = mnTitleTranslation || enTitleTranslation || fallbackTitleTranslation

  const mnDescTranslation = apiData.desc_translations?.find(t => t.language === 2)
  const enDescTranslation = apiData.desc_translations?.find(t => t.language === 1)
  const fallbackDescTranslation = apiData.desc_translations?.[0]
  const descTranslation = mnDescTranslation || enDescTranslation || fallbackDescTranslation

  return {
    id: apiData.id?.toString() || Date.now().toString(),
    backend_id: apiData.id,
    index: apiData.index,
    visible: apiData.visible,
    title_mn: mnTitleTranslation?.title || titleTranslation?.title || 'Нэргүй',
    title_en: enTitleTranslation?.title || titleTranslation?.title || 'Untitled',
    desc_mn: mnDescTranslation?.desc || descTranslation?.desc || '',
    desc_en: enDescTranslation?.desc || descTranslation?.desc || '',
    image_url: apiData.file || '',
    image_aspect_ratio: apiData.file_ratio || '1 / 1',
    title_color: titleTranslation?.fontcolor || '#059669',
    title_size: titleTranslation?.fontsize || 18,
    title_weight: titleTranslation?.fontweight || 'semibold',
    title_family: titleTranslation?.fontfamily || 'sans-serif',
    title_letter_spacing: parseFloat(titleTranslation?.letterspace || '0'),
    desc_color: descTranslation?.fontcolor || '#6b7280',
    desc_size: descTranslation?.fontsize || 14,
    desc_weight: descTranslation?.fontweight || 'normal',
    desc_family: descTranslation?.fontfamily || 'sans-serif',
    desc_letter_spacing: parseFloat(descTranslation?.letterspace || '0')
  }
}

const frontendToApi = (value: Value): Omit<CoreValueAPI, 'id'> => {
  const apiData: Omit<CoreValueAPI, 'id'> = {
    file: value.image_url || null,
    file_ratio: value.image_aspect_ratio || '16 / 9',
    index: value.index || 0,
    visible: value.visible !== false,
    title_translations: [
      {
        language: 1,
        title: value.title_en,
        fontcolor: value.title_color,
        fontsize: value.title_size,
        fontweight: value.title_weight,
        fontfamily: value.title_family,
        letterspace: value.title_letter_spacing.toString()
      },
      {
        language: 2,
        title: value.title_mn,
        fontcolor: value.title_color,
        fontsize: value.title_size,
        fontweight: value.title_weight,
        fontfamily: value.title_family,
        letterspace: value.title_letter_spacing.toString()
      }
    ],
    desc_translations: []
  }

  // Add desc_translations if descriptions exist
  if (value.desc_en || value.desc_mn) {
    apiData.desc_translations = [
      {
        language: 1,
        desc: value.desc_en,
        fontcolor: value.desc_color,
        fontsize: value.desc_size,
        fontweight: value.desc_weight,
        fontfamily: value.desc_family,
        letterspace: value.desc_letter_spacing.toString()
      },
      {
        language: 2,
        desc: value.desc_mn,
        fontcolor: value.desc_color,
        fontsize: value.desc_size,
        fontweight: value.desc_weight,
        fontfamily: value.desc_family,
        letterspace: value.desc_letter_spacing.toString()
      }
    ]
  }

  return apiData
}

export default function ValuesTab() {
  const [values, setValues] = useState<Value[]>([])
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingValueId, setEditingValueId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const valuesGridRef = useRef<HTMLDivElement | null>(null)
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())

  const editingValue = values.find(v => v.id === editingValueId)

  // ============ API FUNCTIONS ============

  const fetchCoreValues = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get<CoreValueAPI[]>('/core-value/')

      const allValues = response.data
        .map(apiToFrontend)
        .filter((v): v is Value => v !== null)
        .sort((a, b) => (a.index || 0) - (b.index || 0))

      setValues(allValues)
      setVisibleCards(new Set(allValues.map(v => v.id)))
    } catch (error) {
      console.error('❌ Error fetching values:', error)
      setValues([])
      setVisibleCards(new Set())
    } finally {
      setLoading(false)
    }
  }

  const createCoreValue = async (value: Value) => {
    try {
      setLoading(true)
      const apiData = frontendToApi(value)
      const response = await axiosInstance.post<CoreValueAPI>('/core-value/', apiData)
      
      const newValue = apiToFrontend(response.data)
      if (newValue) {
        setValues(prev => [...prev, newValue].sort((a, b) => {
          // Keep vision and mission at top
          if (a.id === 'vision') return -1
          if (b.id === 'vision') return 1
          if (a.id === 'mission') return -1
          if (b.id === 'mission') return 1
          return (a.index || 0) - (b.index || 0)
        }))
        setVisibleCards(prev => new Set([...prev, newValue.id]))
        
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        
        return newValue
      }
    } catch (error) {
      console.error('❌ Error creating value:', error)
      alert('Алдаа гарлаа! Үнэт зүйлс нэмэгдсэнгүй.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateCoreValue = async (value: Value) => {
    try {
      setLoading(true)
      const apiData = frontendToApi(value)

      const response = await axiosInstance.put<CoreValueAPI>(
        `/core-value/${value.backend_id}/`,
        apiData
      )

      const updatedValue = apiToFrontend(response.data)
      if (updatedValue) {
        setValues(prev => prev.map(v => v.backend_id === value.backend_id ? updatedValue : v))

        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)

        return updatedValue
      }
    } catch (error) {
      console.error('❌ Error updating value:', error)
      alert('Алдаа гарлаа! Үнэт зүйлс шинэчлэгдсэнгүй.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteCoreValue = async (value: Value) => {
    try {
      setLoading(true)
      await axiosInstance.delete(`/core-value/${value.backend_id}/`)

      setValues(prev => prev.filter(v => v.id !== value.id))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('❌ Error deleting value:', error)
      alert('Алдаа гарлаа! Үнэт зүйлс устгагдсангүй.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ============ LIFECYCLE ============

  useEffect(() => {
    fetchCoreValues()
  }, [])

  useEffect(() => {
    if (!valuesGridRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-value-id')
            if (id) {
              setVisibleCards(prev => new Set([...prev, id]))
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = valuesGridRef.current.querySelectorAll('[data-value-id]')
    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [values])

  // ============ HANDLERS ============

  const handleEditValue = (id: string) => {
    setEditingValueId(id)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingValueId(null)
  }

  const handleAddValue = async () => {
    const coreValuesOnly = values.filter(v => !['vision', 'mission'].includes(v.id))
    const newValue: Value = {
      id: Date.now().toString(),
      index: coreValuesOnly.length,
      visible: true,
      title_mn: 'Шинэ үнэт зүйлс',
      title_en: 'New Core Value',
      desc_mn: '',
      desc_en: '',
      image_url: '',
      image_aspect_ratio: '1 / 1',
      title_color: '#059669',
      title_size: 18,
      title_weight: 'semibold',
      title_family: 'sans-serif',
      title_letter_spacing: 0,
      desc_color: '#6b7280',
      desc_size: 14,
      desc_weight: 'normal',
      desc_family: 'sans-serif',
      desc_letter_spacing: 0
    }
    
    await createCoreValue(newValue)
  }

  const handleDeleteValue = async (id: string) => {
    const value = values.find(v => v.id === id)
    if (!value) return
    
    if (value.backend_id) {
      await deleteCoreValue(value)
    } else {
      setValues(values.filter(v => v.id !== id))
    }
  }

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await handleDeleteValue(pendingDeleteId)
      handleCloseEditModal()
      setDeleteConfirmOpen(false)
      setPendingDeleteId(null)
    }
  }

  const handleSaveValues = async () => {
    if (!editingValue) return

    if (editingValue.backend_id) {
      await updateCoreValue(editingValue)
    } else {
      await createCoreValue(editingValue)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <p className="text-sm font-semibold text-green-900">Амжилттай!</p>
              <p className="text-sm text-green-800">Үнэт зүйлсийг хадгалалаа</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-600">Уншиж байна...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Үнэт зүйлс</h2>
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex bg-slate-200/80 p-1 rounded-lg">
            <button 
              onClick={() => setPreviewLang('mn')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'mn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              MN
            </button>
            <button 
              onClick={() => setPreviewLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${previewLang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-8">Урьдчилсан үзэлт</h3>
        <div 
          ref={valuesGridRef}
          className="space-y-12"
        >
          {/* Vision & Mission Section */}
          {values.filter(v => ['vision', 'mission'].includes(v.id)).map((value, index) => (
            <div
              key={value.id}
              data-value-id={value.id}
              className={`transition-all duration-500 ease-out
                ${visibleCards.has(value.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <div className={`grid md:grid-cols-2 gap-8 items-center p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${value.id === 'vision' ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50' : 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50/50'}`}>
                <div className={`space-y-4 ${value.id === 'mission' ? 'md:order-2' : ''}`}>
                  <span className={`inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full ${value.id === 'vision' ? 'text-blue-700 bg-blue-200/40' : 'text-purple-700 bg-purple-200/40'}`}>
                    {previewLang === 'mn' ? value.title_mn : value.title_en}
                  </span>
                  <h3 style={{
                    color: value.title_color,
                    fontSize: `${value.title_size}px`,
                    fontWeight: value.title_weight,
                    fontFamily: value.title_family,
                    letterSpacing: `${value.title_letter_spacing}px`
                  }} className="leading-tight">
                    {previewLang === 'mn' ? value.desc_mn : value.desc_en}
                  </h3>
                  <button
                    onClick={() => handleEditValue(value.id)}
                    className="mt-6 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-semibold uppercase tracking-wide hover:gap-3 transition-all"
                  >
                    Засах
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {value.image_url && (
                  <div className={`relative overflow-hidden rounded-xl border border-gray-200 group ${value.id === 'mission' ? 'md:order-1' : ''}`} style={{ aspectRatio: value.image_aspect_ratio || '16 / 9' }}>
                    <img 
                      src={value.image_url} 
                      alt={previewLang === 'mn' ? value.title_mn : value.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Core Values Section */}
        {values.filter(v => !['vision', 'mission'].includes(v.id)).length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-slate-900">Үндсэн үнэт зүйлс</h4>
              <button
                onClick={handleAddValue}
                disabled={loading}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Нэмэх
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.filter(v => !['vision', 'mission'].includes(v.id)).map((value, index) => (
                <div
                  key={value.id}
                  data-value-id={value.id}
                  className={`transition-all duration-500 ease-out
                    ${visibleCards.has(value.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{ transitionDelay: `${(index + 2) * 75}ms` }}
                >
                  <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all h-full flex flex-col">
                    {/* Image */}
                    {value.image_url && (
                      <div className="relative overflow-hidden" style={{ aspectRatio: value.image_aspect_ratio || '16 / 9' }}>
                        <img 
                          src={value.image_url} 
                          alt={previewLang === 'mn' ? value.title_mn : value.title_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <h3 style={{
                        color: value.title_color,
                        fontSize: `${value.title_size}px`,
                        fontWeight: value.title_weight,
                        fontFamily: value.title_family,
                        letterSpacing: `${value.title_letter_spacing}px`
                      }} className="group-hover:text-teal-600 transition-colors line-clamp-2">
                        {previewLang === 'mn' ? value.title_mn : value.title_en}
                      </h3>
                      
                      {(value.desc_mn || value.desc_en) && (
                        <p style={{
                          color: value.desc_color,
                          fontSize: `${value.desc_size}px`,
                          fontWeight: value.desc_weight,
                          fontFamily: value.desc_family,
                          letterSpacing: `${value.desc_letter_spacing}px`,
                          lineHeight: '1.6'
                        }} className="text-sm line-clamp-4 flex-1">
                          {previewLang === 'mn' ? value.desc_mn : value.desc_en}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditValue(value.id)}
                          className="flex-1 px-2 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 rounded transition-colors"
                        >
                          Засах
                        </button>
                        <button
                          onClick={() => handleDeleteClick(value.id)}
                          className="px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add First Core Value Button */}
        {values.filter(v => !['vision', 'mission'].includes(v.id)).length === 0 && (
          <div className="mt-12 pt-12 border-t border-gray-300">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Үндсэн үнэт зүйлс байхгүй байна</h4>
              <p className="text-sm text-slate-600 mb-6">Эхний үнэт зүйлсээ нэмэх бол доорх товчийг дарна уу</p>
              <button
                onClick={handleAddValue}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Үнэт зүйлс нэмэх
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={editModalOpen} 
        onClose={handleCloseEditModal} 
        title={editingValue?.id === 'vision' ? 'Алсын харааг засах' : editingValue?.id === 'mission' ? 'Эрхэм зорилгийг засах' : 'Үнэт зүйлсийг засах'}
        size="xl"
      >
        {editingValue && (
          <div className="space-y-5 pb-4">
            {/* Image Upload - Only for Vision/Mission */}
            {(editingValue.id === 'vision' || editingValue.id === 'mission') && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/20">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Зураг</h4>
                <div className="space-y-3">
                  <ImageUpload 
                    value={editingValue.image_url || ''}
                    onChange={(url: string) => setValues(values.map(v => v.id === editingValue.id ? {...v, image_url: url} : v))}
                    label="Үнэт зүйлийн зураг"
                  />
                  
                  {/* Image Aspect Ratio Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Зургийн хэмжээ/харьцаа</label>
                    <select
                      value={editingValue.image_aspect_ratio || '1 / 1'}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, image_aspect_ratio: e.target.value} : v))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="1 / 1">1:1 (Дөрвөлжин)</option>
                      <option value="16 / 9">16:9 (Видео)</option>
                      <option value="3 / 2">3:2</option>
                      <option value="4 / 3">4:3</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Title/Label (for Vision/Mission) OR regular Title (for core values) */}
            <div className="space-y-4">
              {(editingValue.id === 'vision' || editingValue.id === 'mission') ? (
                <>
                  {/* Label Mongolian */}
                  <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Шошго (Монгол)</label>
                    <input
                      type="text"
                      value={editingValue.title_mn}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_mn: e.target.value} : v))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Label English */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Label (English)</label>
                    <input
                      type="text"
                      value={editingValue.title_en}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_en: e.target.value} : v))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Main Text Mongolian */}
                  <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Үндсэн текст (Монгол)</label>
                    <textarea
                      value={editingValue.desc_mn}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, desc_mn: e.target.value} : v))}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Main Text English */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Main Text (English)</label>
                    <textarea
                      value={editingValue.desc_en}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, desc_en: e.target.value} : v))}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Title Mongolian */}
                  <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Гарчиг (Монгол)</label>
                    <input
                      type="text"
                      value={editingValue.title_mn}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_mn: e.target.value} : v))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Title English */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      value={editingValue.title_en}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_en: e.target.value} : v))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description Mongolian */}
                  <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Тайлбар (Монгол)</label>
                    <textarea
                      value={editingValue.desc_mn}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, desc_mn: e.target.value} : v))}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Description English */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description (English)</label>
                    <textarea
                      value={editingValue.desc_en}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, desc_en: e.target.value} : v))}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}

              {/* Title/Main Text Styling Section */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">Aa</span> {(editingValue.id === 'vision' || editingValue.id === 'mission') ? 'Үндсэн текст' : 'Гарчиг'}
                  </h4>
                  <div style={{
                    color: editingValue.title_color,
                    fontSize: `${editingValue.title_size}px`,
                    fontWeight: editingValue.title_weight,
                    fontFamily: editingValue.title_family,
                    letterSpacing: `${editingValue.title_letter_spacing}px`
                  }} className="px-3 py-1">
                    Aa
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {/* Color */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Өнгө</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingValue.title_color}
                        onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_color: e.target.value} : v))}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                      />
                      <input
                        type="text"
                        value={editingValue.title_color}
                        onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_color: e.target.value} : v))}
                        className="flex-1 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Хэмжээ (px)</label>
                    <input
                      type="number"
                      min="8"
                      max="72"
                      value={editingValue.title_size}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_size: parseInt(e.target.value)} : v))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Жин</label>
                    <select
                      value={editingValue.title_weight}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_weight: e.target.value} : v))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                      <option value="extrabold">Extrabold</option>
                    </select>
                  </div>

                  {/* Family */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Фонт</label>
                    <select
                      value={editingValue.title_family}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_family: e.target.value} : v))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    >
                      <option value="sans-serif">Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Зай (px)</label>
                    <input
                      type="number"
                      min="-5"
                      max="10"
                      step="0.5"
                      value={editingValue.title_letter_spacing}
                      onChange={(e) => setValues(values.map(v => v.id === editingValue.id ? {...v, title_letter_spacing: parseFloat(e.target.value)} : v))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              {!['vision', 'mission'].includes(editingValue.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteClick(editingValue.id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Устгах
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSaveValues()
                  handleCloseEditModal()
                }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => {
          setDeleteConfirmOpen(false)
          setPendingDeleteId(null)
        }} 
        title="Устгах баталгаа"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">Анхаарал!</p>
                <p className="text-sm text-red-800">
                  Та "{values.find(v => v.id === pendingDeleteId)?.title_mn}" үнэт зүйлсийг устгах гэж байна.
                </p>
                <p className="text-sm text-red-800 mt-2">
                  <strong>Энэ үйлдэл буцаах боломжгүй!</strong> Та үнэхээр устгахыг хүсэж байна уу?
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setPendingDeleteId(null)
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Цуцлах
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Устгаж байна...' : 'Устгах'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}