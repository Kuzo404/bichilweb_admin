'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Input, Button, PageHeader } from '@/components/FormElements'
import Modal from '@/components/Modal'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import axiosInstance from '@/app/config/axiosConfig'

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000'

const LANGUAGE_IDS = {
  EN: 1,
  MN: 2,
} as const

const DEFAULT_FONT = 'Arial'
const DEFAULT_COLOR = '#ffffff'
const SUCCESS_MESSAGE_DURATION = 3000

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Inter', label: 'Inter' },
]

// Types
interface CTASlide {
  id: number
  file: string
  file_url: string
  index: number
  font: string
  color: string
  number: string
  description: string
  url: string
  titles: Array<{
    id: number
    language: number
    label: string
  }>
  subtitles: Array<{
    id: number
    language: number
    label: string
  }>
}

interface SubtitlePair {
  mn: string
  en: string
}

interface FormData {
  number: string
  title_mn: string
  title_en: string
  subtitlePairs: SubtitlePair[]
  description: string
  url: string
  font: string
  textColor: string
  index: number
}

export default function CTAPage() {
  // State
  const [slides, setSlides] = useState<CTASlide[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CTASlide | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [previewLang, setPreviewLang] = useState<'mn' | 'en'>('mn')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({})

  const [formData, setFormData] = useState<FormData>({
    number: '01',
    title_mn: '',
    title_en: '',
    subtitlePairs: [{ mn: '', en: '' }],
    description: '',
    url: '',
    font: DEFAULT_FONT,
    textColor: DEFAULT_COLOR,
    index: 1,
  })

  // Cleanup preview URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_DURATION)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Auto-hide error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Helper functions
  const getTitle = useCallback((slide: CTASlide, lang: 'mn' | 'en') => {
    const languageId = lang === 'mn' ? LANGUAGE_IDS.MN : LANGUAGE_IDS.EN
    return slide.titles.find(t => t.language === languageId)?.label || ''
  }, [])

  const getSubtitle = useCallback((slide: CTASlide, lang: 'mn' | 'en') => {
    const languageId = lang === 'mn' ? LANGUAGE_IDS.MN : LANGUAGE_IDS.EN
    return slide.subtitles.filter(s => s.language === languageId).map(s => s.label).join(', ')
  }, [])

  // Fetch slides from backend using axiosInstance
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axiosInstance.get('/CTA/')
      
      const slidesData = Array.isArray(response.data) ? response.data : response.data.slides || []
      setSlides(slidesData)
      
      // Initialize image loading states
      const loadingStates: { [key: number]: boolean } = {}
      slidesData.forEach((slide: CTASlide) => {
        loadingStates[slide.id] = true
      })
      setImageLoading(loadingStates)
      
    } catch (err: any) {
      console.error('Backend-ээс татахад алдаа:', err)
      const message = err.response?.data?.message || err.message || 'Өгөгдөл татахад алдаа гарлаа'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  // Image selection handler
  const handleImageSelect = useCallback((file: File) => {
    // Revoke previous preview URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [previewUrl])

  // Form validation
  const validateForm = useCallback((): string | null => {
    if (!selectedFile && !editingSlide) {
      return 'Зураг сонгоно уу'
    }
    
    if (!formData.title_mn.trim() && !formData.title_en.trim()) {
      return 'Хамгийн багадаа нэг хэл дээр гарчиг оруулна уу'
    }
    
    if (formData.index < 1) {
      return 'Эрэмбэ 1-ээс их байх ёстой'
    }
    
    if (!formData.number.trim()) {
      return 'Дугаар оруулна уу'
    }
    
    return null
  }, [selectedFile, editingSlide, formData])

  // Reset form
  const resetForm = useCallback(() => {
    const maxIndex = slides.length > 0 ? Math.max(...slides.map(s => s.index)) : 0
    
    setFormData({
      number: `0${slides.length + 1}`,
      title_mn: '',
      title_en: '',
      subtitlePairs: [{ mn: '', en: '' }],
      description: '',
      url: '',
      font: DEFAULT_FONT,
      textColor: DEFAULT_COLOR,
      index: maxIndex + 1,
    })
    
    setSelectedFile(null)
    
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
  }, [slides.length, previewUrl])

  // Modal handlers
  const handleOpenCreate = useCallback(() => {
    setError(null)
    setEditingSlide(null)
    resetForm()
    setModalOpen(true)
  }, [resetForm])

  const handleOpenEdit = useCallback((slide: CTASlide) => {
    setError(null)
    setEditingSlide(slide)
    setSelectedFile(null)
    
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(slide.file_url?.startsWith('http') ? slide.file_url : `${API_BASE_URL}${slide.file_url}`)
    
    // Parse subtitles into pairs
    const mnSubs = slide.subtitles.filter(s => s.language === LANGUAGE_IDS.MN)
    const enSubs = slide.subtitles.filter(s => s.language === LANGUAGE_IDS.EN)
    const pairCount = Math.max(mnSubs.length, enSubs.length, 1)
    const pairs: SubtitlePair[] = []
    for (let i = 0; i < pairCount; i++) {
      pairs.push({
        mn: mnSubs[i]?.label || '',
        en: enSubs[i]?.label || '',
      })
    }
    
    setFormData({
      number: slide.number,
      title_mn: getTitle(slide, 'mn'),
      title_en: getTitle(slide, 'en'),
      subtitlePairs: pairs,
      description: slide.description || '',
      url: slide.url || '',
      font: slide.font,
      textColor: slide.color,
      index: slide.index,
    })
    
    setModalOpen(true)
  }, [getTitle, previewUrl])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingSlide(null)
    setSelectedFile(null)
    setError(null)
    
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
  }, [previewUrl])

  // Create slide using axiosInstance
  const createSlide = useCallback(async () => {
    if (!selectedFile) {
      setError('Зураг сонгоно уу')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const payload = new FormData()
      payload.append('file', selectedFile)
      payload.append('number', formData.number)
      payload.append('index', formData.index.toString())
      payload.append('font', formData.font)
      payload.append('color', formData.textColor)
      payload.append('description', formData.description)
      payload.append('url', formData.url)

      const titles = [
        { language: LANGUAGE_IDS.EN, label: formData.title_en || '' },
        { language: LANGUAGE_IDS.MN, label: formData.title_mn || '' },
      ]
      payload.append('titles', JSON.stringify(titles))

      // Build subtitles array from pairs
      const subtitles: Array<{ language: number; label: string }> = []
      formData.subtitlePairs.forEach(pair => {
        if (pair.mn.trim()) subtitles.push({ language: LANGUAGE_IDS.MN, label: pair.mn })
        if (pair.en.trim()) subtitles.push({ language: LANGUAGE_IDS.EN, label: pair.en })
      })
      payload.append('subtitles', JSON.stringify(subtitles))

      const response = await axiosInstance.post('/CTA/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      await fetchSlides()
      setSuccess('Слайд амжилттай нэмэгдлээ!')
      handleCloseModal()
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Слайд үүсгэхэд алдаа гарлаа'
      setError(message)
      console.error('Create error:', err)
    } finally {
      setSaving(false)
    }
  }, [selectedFile, formData, fetchSlides, handleCloseModal])

  // Update slide using axiosInstance
  const updateSlide = useCallback(async () => {
    if (!editingSlide) return

    try {
      setSaving(true)
      setError(null)

      const payload = new FormData()

      if (selectedFile) {
        payload.append('file', selectedFile)
      }

      payload.append('number', formData.number)
      payload.append('index', formData.index.toString())
      payload.append('font', formData.font)
      payload.append('color', formData.textColor)
      payload.append('description', formData.description)
      payload.append('url', formData.url)

      const titles = [
        { language: LANGUAGE_IDS.EN, label: formData.title_en || '' },
        { language: LANGUAGE_IDS.MN, label: formData.title_mn || '' },
      ]
      payload.append('titles', JSON.stringify(titles))

      // Build subtitles array from pairs
      const subtitles: Array<{ language: number; label: string }> = []
      formData.subtitlePairs.forEach(pair => {
        if (pair.mn.trim()) subtitles.push({ language: LANGUAGE_IDS.MN, label: pair.mn })
        if (pair.en.trim()) subtitles.push({ language: LANGUAGE_IDS.EN, label: pair.en })
      })
      payload.append('subtitles', JSON.stringify(subtitles))

      const response = await axiosInstance.put(`/CTA/${editingSlide.id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      await fetchSlides()
      setSuccess('Слайд амжилттай засагдлаа!')
      handleCloseModal()
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Слайд засахад алдаа гарлаа'
      setError(message)
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }, [editingSlide, selectedFile, formData, fetchSlides, handleCloseModal])

  // Save handler
  const handleSave = useCallback(() => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (editingSlide) {
      updateSlide()
    } else {
      createSlide()
    }
  }, [validateForm, editingSlide, updateSlide, createSlide])

  // Delete slide using axiosInstance
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Энэ слайдыг устгах уу?')) return

    try {
      setError(null)
      
      await axiosInstance.delete(`/CTA/${id}/`)

      await fetchSlides()
      setSuccess('Слайд амжилттай устгагдлаа!')
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Слайд устгахад алдаа гарлаа'
      setError(message)
      console.error('Delete error:', err)
    }
  }, [fetchSlides])

  // Keyboard shortcut for closing modal (ESC)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        handleCloseModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [modalOpen, handleCloseModal])

  return (
    <AdminLayout title="CTA Slider">
      <div className="max-w-6xl mx-auto">
        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-900">Амжилттай!</h4>
              <p className="text-xs text-emerald-700">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)} 
              className="text-emerald-600 hover:text-emerald-800"
              aria-label="Хаах"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">Алдаа!</h4>
              <p className="text-xs text-red-700">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-600 hover:text-red-800"
              aria-label="Хаах"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="CTA Accordion Slider"
          description="Нүүр хуудасны интерактив слайдер"
          action={
            <Button onClick={handleOpenCreate} disabled={saving || loading}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Шинэ слайд
            </Button>
          }
        />

        {/* Live Preview */}
        {slides.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-600 uppercase">Live Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    onClick={() => setPreviewLang('mn')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      previewLang === 'mn' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-label="Монгол хэл"
                  >
                    MN
                  </button>
                  <button
                    onClick={() => setPreviewLang('en')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      previewLang === 'en' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-label="Англи хэл"
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="relative h-[500px] rounded-xl overflow-hidden">
                <div className="flex h-full gap-4">
                  {slides
                    .sort((a, b) => a.index - b.index)
                    .map((slide, index) => {
                      const isHovered = hoveredIndex === index
                      const isLoading = imageLoading[slide.id]

                      return (
                        <div
                          key={slide.id}
                          className={`relative transition-all duration-700 cursor-pointer overflow-hidden rounded-2xl ${
                            isHovered ? 'flex-[2.7]' : 'flex-1'
                          }`}
                          style={{
                            filter: isHovered ? 'grayscale(0)' : 'grayscale(0.7)',
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            minWidth: '100px',
                          }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {isLoading && (
                            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          
                          <Image
                            src={slide.file_url?.startsWith('http') ? slide.file_url : `${API_BASE_URL}${slide.file_url}`}
                            alt={getTitle(slide, previewLang) || 'Slide image'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            onLoad={() => setImageLoading(prev => ({ ...prev, [slide.id]: false }))}
                            priority={index < 3}
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                          <div
                            className={`absolute ${isHovered ? 'bottom-16' : 'bottom-8'} left-6 right-6 z-10 transition-all duration-700`}
                            style={{ color: slide.color || '#ffffff', fontFamily: slide.font }}
                          >
                            <div className="text-base font-bold mb-2">
                              {getTitle(slide, previewLang)}
                            </div>

                            <div
                              className={`transition-all duration-600 overflow-hidden ${
                                isHovered ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'
                              }`}
                            >
                              <p className="text-sm font-medium">
                                {getSubtitle(slide, previewLang)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slides Grid */}
        {slides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slides
              .sort((a, b) => a.index - b.index)
              .map((slide) => (
                <div key={slide.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-white rounded-full text-sm font-bold">
                        {slide.number}
                      </span>
                      <span className="text-sm text-slate-500">Эрэмбэ: {slide.index}</span>
                    </div>
                  </div>

                  <div className="relative h-48">
                    {imageLoading[slide.id] && (
                      <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    <Image
                      src={slide.file_url?.startsWith('http') ? slide.file_url : `${API_BASE_URL}${slide.file_url}`}
                      alt={getTitle(slide, 'mn') || 'Slide image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onLoad={() => setImageLoading(prev => ({ ...prev, [slide.id]: false }))}
                    />
                    
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(slide)}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                        aria-label="Слайд засах"
                      >
                        <PencilIcon className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                        aria-label="Слайд устгах"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">
                        {slide.font}
                      </span>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-slate-200"
                        style={{ backgroundColor: slide.color }}
                        title={`Өнгө: ${slide.color}`}
                      />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                      {getTitle(slide, 'mn')}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1 line-clamp-2">
                      {getSubtitle(slide, 'mn')}
                    </p>
                    {slide.description && (
                      <p className="text-xs text-slate-500 mb-1 line-clamp-2">
                        📝 {slide.description}
                      </p>
                    )}
                    {slide.url && (
                      <p className="text-xs text-blue-500 mb-1 line-clamp-1">
                        🔗 {slide.url}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 italic line-clamp-1">
                      {getTitle(slide, 'en')}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Empty State */}
        {slides.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Слайд байхгүй</h3>
            <p className="text-sm text-slate-500 mb-4">Эхний слайдаа нэмнэ үү</p>
            <Button onClick={handleOpenCreate}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Слайд нэмэх
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Уншиж байна...</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingSlide ? 'Слайд засах' : 'Шинэ слайд нэмэх'}
      >
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Зураг {editingSlide && '(шинэ зураг сонговол солигдоно)'}
              {!editingSlide && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-teal-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setError('Зургийн хэмжээ 5MB-аас бага байх ёстой')
                      return
                    }
                    handleImageSelect(file)
                  }
                }}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100 file:cursor-pointer cursor-pointer"
                aria-label="Зураг сонгох"
              />
              <p className="text-xs text-slate-500 mt-2">
                PNG, JPG, GIF форматтай, 5MB хүртэл
              </p>
            </div>
            {previewUrl && (
              <div className="mt-3 relative h-48 rounded-lg overflow-hidden border">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            )}
          </div>

          {/* Number Input */}
          <Input
            label="Дугаар"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="01"
            required
          />

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Гарчиг (Монгол)"
              value={formData.title_mn}
              onChange={(e) => setFormData({ ...formData, title_mn: e.target.value })}
              placeholder="Монгол гарчиг"
            />
            <Input
              label="Гарчиг (English)"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="English title"
            />
          </div>

          {/* Subtitles - Dynamic */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Дэд гарчигууд
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, subtitlePairs: [...formData.subtitlePairs, { mn: '', en: '' }] })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Нэмэх
              </button>
            </div>
            <div className="space-y-3">
              {formData.subtitlePairs.map((pair, idx) => (
                <div key={idx} className="relative border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">#{idx + 1}</span>
                    {formData.subtitlePairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPairs = formData.subtitlePairs.filter((_, i) => i !== idx)
                          setFormData({ ...formData, subtitlePairs: newPairs })
                        }}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Устгах"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={pair.mn}
                      onChange={(e) => {
                        const newPairs = [...formData.subtitlePairs]
                        newPairs[idx] = { ...newPairs[idx], mn: e.target.value }
                        setFormData({ ...formData, subtitlePairs: newPairs })
                      }}
                      placeholder="Монгол дэд гарчиг"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      value={pair.en}
                      onChange={(e) => {
                        const newPairs = [...formData.subtitlePairs]
                        newPairs[idx] = { ...newPairs[idx], en: e.target.value }
                        setFormData({ ...formData, subtitlePairs: newPairs })
                      }}
                      placeholder="English subtitle"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Талбар (Тайлбар)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Нэмэлт тайлбар текст..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL (Холбоос)
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/page"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Слайд дээр дарахад энэ хуудас руу үсрэнэ</p>
          </div>

          {/* Font, Color, Index */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Фонт
              </label>
              <select
                value={formData.font}
                onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                aria-label="Фонт сонгох"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Текстийн өнгө
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                  aria-label="Өнгө сонгох"
                />
                <input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="#ffffff"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            
            <Input
              label="Эрэмбэ"
              type="number"
              min="1"
              value={formData.index.toString()}
              onChange={(e) => setFormData({ ...formData, index: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          {/* Modal Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              disabled={saving}
            >
              Болих
            </button>
            <Button variant="dark" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Хадгалж байна...
                </>
              ) : (
                'Хадгалах'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}